"""Build a caption timeline from a real recording (your voice + camera).

Usage: python tts/build_from_recording.py jobs/<job>.json

Job fields:
  id          slug
  video       path to the recording (relative to the job file)
  language    whisper language code, e.g. "en" (default) or "hi"
  model       faster-whisper model (default "small.en" for en, "small" otherwise)
  crop        optional {x, y, width, height} source-pixel box shown in the video panel
  scenes      script: [{id, visual?, sentences: [{caption}]}] using captions.py markup.
              Leave it out on the first run to get a timed transcript to write the script from.

Writes:
  public/<id>/camera.mp4              silent, 30fps video for the panel
  public/<id>/voice.wav               cleaned narration (denoise + loudness normalise)
  src/explainer/data/<id>.json        timeline (same shape as build_voiceover.py) + video metadata
  jobs/<id>.transcript.txt            whisper transcript with timings (always)

Your script supplies the exact words; whisper only supplies timing. Script words that
whisper heard differently are matched by sequence alignment and interpolated.
"""
import difflib
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from captions import estimate, norm, parse_caption, timed_chunks

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / ".cache" / "whisper"
VIDEO_FPS = 30
AUDIO_FILTER = "highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11"
SCENE_LEAD_S = 0.15


def fail(msg: str) -> None:
    sys.exit(f"build_from_recording: {msg}")


def ffmpeg(args: list, step: str) -> None:
    result = subprocess.run(["ffmpeg", "-v", "error", "-y", *args])
    if result.returncode != 0:
        fail(f"ffmpeg failed while {step}")


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        fail(f"ffprobe failed on {path}")
    info = json.loads(out.stdout)
    stream = (info.get("streams") or [{}])[0]
    return {"width": int(stream["width"]), "height": int(stream["height"]),
            "duration": float(info["format"]["duration"])}


def load_job(path: Path) -> dict:
    if not path.is_file():
        fail(f"job not found: {path}")
    job = json.loads(path.read_text(encoding="utf-8"))
    if not re.fullmatch(r"[\w-]+", job.get("id", "")):
        fail("job.id must be a slug")
    video = (path.parent / job.get("video", "")).resolve()
    if not job.get("video") or not video.is_file():
        fail(f"job.video not found: {video}")
    crop = job.get("crop")
    if crop is not None and not all(isinstance(crop.get(k), (int, float)) for k in ("x", "y", "width", "height")):
        fail("crop needs numeric x, y, width, height")
    return {**job, "video": video}


def prepare_media(video: Path, out_dir: Path) -> tuple:
    out_dir.mkdir(parents=True, exist_ok=True)
    camera, voice = out_dir / "camera.mp4", out_dir / "voice.wav"
    print("  transcoding camera track")
    ffmpeg(["-i", str(video), "-an", "-r", str(VIDEO_FPS), "-c:v", "libx264", "-crf", "20", "-preset", "fast",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(camera)], "transcoding video")
    print("  cleaning audio")
    ffmpeg(["-i", str(video), "-vn", "-af", AUDIO_FILTER, "-ar", "48000", "-ac", "1", str(voice)], "cleaning audio")
    return camera, voice


def transcribe(voice: Path, language: str, model_name: str) -> list:
    """Whisper word timings [(text, start, end)], cached by audio hash + settings."""
    digest = hashlib.sha1(voice.read_bytes() + f"|{language}|{model_name}".encode()).hexdigest()[:16]
    cached = CACHE_DIR / f"{digest}.json"
    if cached.is_file():
        return json.loads(cached.read_text(encoding="utf-8"))
    from faster_whisper import WhisperModel

    print(f"  transcribing with {model_name} (cpu)")
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    # No initial_prompt: feeding the script makes whisper hallucinate it at the end of clips.
    segments, _ = model.transcribe(str(voice), language=language, word_timestamps=True, vad_filter=True,
                                   condition_on_previous_text=False)
    words = [(w.word.strip(), round(w.start, 3), round(w.end, 3)) for s in segments for w in s.words if w.word.strip()]
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return words


def write_transcript(words: list, path: Path) -> None:
    lines, line, line_start = [], [], 0.0
    for text, start, _ in words:
        if not line:
            line_start = start
        line.append(text)
        if text.endswith((".", "?", "!")) or len(line) >= 14:
            lines.append(f"[{line_start:6.2f}] {' '.join(line)}")
            line = []
    if line:
        lines.append(f"[{line_start:6.2f}] {' '.join(line)}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def align_script(script_words: list, heard: list, duration: float) -> tuple:
    """Spans for every script word: matched words take whisper timing, the rest are interpolated."""
    a = [norm(w["text"]) for w in script_words]
    b = [norm(t) for t, _, _ in heard]
    spans = [None] * len(a)
    matcher = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for op, i1, i2, j1, j2 in matcher.get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                spans[i1 + k] = (heard[j1 + k][1], heard[j1 + k][2])
        elif op == "replace":
            spans[i1:i2] = estimate(script_words[i1:i2], heard[j1][1], heard[j2 - 1][2] - heard[j1][1])
    matched = sum(1 for s in spans if s is not None)
    return fill_gaps(script_words, spans, duration), matched


def fill_gaps(words: list, spans: list, duration: float) -> list:
    """Interpolate unmatched runs between their timed neighbours."""
    out, i = list(spans), 0
    while i < len(out):
        if out[i] is not None:
            i += 1
            continue
        j = i
        while j < len(out) and out[j] is None:
            j += 1
        lo = out[i - 1][1] if i > 0 else 0.0
        hi = out[j][0] if j < len(out) else duration
        out[i:j] = estimate(words[i:j], lo, max(0.1, hi - lo))
        i = j
    return out


def build_timeline(job: dict, heard: list, media: dict) -> dict:
    scenes_in = job["scenes"]
    parsed = [[parse_caption(s["caption"]) for s in sc["sentences"]] for sc in scenes_in]
    flat = [w for sc in parsed for sent in sc for chunk in sent for w in chunk]
    spans, matched = align_script(flat, heard, media["duration"])
    print(f"  aligned {matched}/{len(flat)} script words to whisper timings")

    scenes, k = [], 0
    for sc, sentences_in in zip(scenes_in, parsed):
        sentences = []
        for chunks in sentences_in:
            n = sum(len(c) for c in chunks)
            timed = timed_chunks(chunks, spans[k:k + n])
            k += n
            sentences.append({"start": timed[0]["start"], "end": timed[-1]["end"], "chunks": timed})
        scenes.append({"id": sc["id"], "start": max(0.0, round(sentences[0]["start"] - SCENE_LEAD_S, 3)),
                       "sentences": sentences, **({"visual": sc["visual"]} if "visual" in sc else {})})
    scenes[0]["start"] = 0.0
    for cur, nxt in zip(scenes, scenes[1:] + [None]):
        cur["end"] = nxt["start"] if nxt else round(media["duration"], 3)

    return {
        "id": job["id"],
        "durationS": round(media["duration"], 3),
        "copy": job.get("copy", {}),
        "video": {"src": f"{job['id']}/camera.mp4", "width": media["width"], "height": media["height"],
                  **({"crop": job["crop"]} if job.get("crop") else {})},
        "scenes": scenes,
    }


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    job_path = Path(sys.argv[1]).resolve()
    job = load_job(job_path)
    language = job.get("language", "en")
    model = job.get("model") or ("small.en" if language == "en" else "small")

    _, voice = prepare_media(job["video"], ROOT / "public" / job["id"])
    media = probe(job["video"])
    heard = transcribe(voice, language, model)
    transcript_path = job_path.with_name(f"{job['id']}.transcript.txt")
    write_transcript(heard, transcript_path)
    print(f"  transcript -> {transcript_path.relative_to(ROOT)} ({len(heard)} words)")

    if not job.get("scenes"):
        print("no scenes in job yet: write the script from the transcript, then run again")
        return

    timeline = build_timeline(job, heard, media)
    out = ROOT / "src" / "explainer" / "data" / f"{job['id']}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(timeline, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({timeline['durationS']:.2f}s, {len(timeline['scenes'])} scenes)")


if __name__ == "__main__":
    main()
