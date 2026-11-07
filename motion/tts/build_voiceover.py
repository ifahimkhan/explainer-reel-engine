"""Build a voiceover WAV + caption timeline for an explainer job.

Usage: python tts/build_voiceover.py jobs/<job>.json

Writes:
  public/<id>/voice.wav               concatenated narration
  src/explainer/data/<id>.json        scene / sentence / chunk / word timings (seconds) + on-screen copy

Caption markup is described in captions.py. `say` (optional) overrides the spoken text.

Engines (job "engine"):
  kokoro       default; job "voice" is a Kokoro voice, "lang" its pipeline code
  elevenlabs   job "voice" is an ElevenLabs voice_id (e.g. your clone from clone_voice.py),
               optional "model" (default eleven_flash_v2_5) and "voiceSettings" {stability, similarity_boost}.
               "speed" is not sent (Eleven v4 has no speed control).
  omnivoice    local zero-shot clone (CPU, slow). Needs "refAudio" (+ "refText" or a sibling .txt);
               see omnivoice_tts.py and OMNIVOICE.md.

Word timings come from engine timestamps when available (Kokoro tokens / ElevenLabs
character alignment) and fall back to spreading words by estimated syllable count.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Optional

import numpy as np
import soundfile as sf

from captions import estimate, norm, parse_caption, plain_caption, timed_chunks

SAMPLE_RATE = 24000
SILENCE_THRESHOLD = 0.008
EDGE_PAD_S = 0.03
MAX_TOKENS_PER_WORD = 3
PEAK_TARGET = 0.89  # -1 dBFS
CACHE_DIR = Path(".cache/tts")
ROOT = Path(__file__).resolve().parent.parent


def fail(msg: str) -> None:
    sys.exit(f"build_voiceover: {msg}")


def load_job(path: Path) -> dict:
    if not path.is_file():
        fail(f"job not found: {path}")
    job = json.loads(path.read_text(encoding="utf-8"))
    if not re.fullmatch(r"[\w-]+", job.get("id", "")):
        fail("job.id must be a slug")
    scenes = job.get("scenes") or []
    if not scenes:
        fail("job has no scenes")
    for scene in scenes:
        for s in scene.get("sentences") or fail(f"scene {scene.get('id')} has no sentences"):
            if not s.get("caption", "").strip():
                fail(f"empty caption in scene {scene['id']}")
    return job


def trim_bounds(audio: np.ndarray) -> tuple:
    loud = np.flatnonzero(np.abs(audio) > SILENCE_THRESHOLD)
    if loud.size == 0:
        return 0, len(audio)
    pad = int(EDGE_PAD_S * SAMPLE_RATE)
    return max(0, loud[0] - pad), min(len(audio), loud[-1] + pad)


def run_kokoro(pipeline, text: str, voice: str, speed: float) -> tuple:
    """Returns (trimmed audio, token timings or None)."""
    audio_parts, tokens, offset, have_ts = [], [], 0.0, True
    for r in pipeline(text, voice=voice, speed=speed):
        if r.audio is None:
            continue
        part = np.asarray(r.audio, dtype=np.float32)
        for tok in r.tokens or []:
            if tok.start_ts is None or tok.end_ts is None:
                have_ts = False
                break
            if norm(tok.text):
                tokens.append((norm(tok.text), offset + tok.start_ts, offset + tok.end_ts))
        if not r.tokens:
            have_ts = False
        audio_parts.append(part)
        offset += len(part) / SAMPLE_RATE
    if not audio_parts:
        fail(f"kokoro produced no audio for: {text}")
    audio = np.concatenate(audio_parts)
    lo, hi = trim_bounds(audio)
    lead = lo / SAMPLE_RATE
    timed = [(t, max(0.0, s - lead), max(0.0, e - lead)) for t, s, e in tokens] if have_ts and tokens else None
    return audio[lo:hi], timed


def run_elevenlabs(get_client, text: str, voice: str, model: str, settings: dict) -> tuple:
    """Returns (trimmed audio, word timings or None) from ElevenLabs character alignment."""
    from elevenlabs_tts import synthesize as el_synthesize

    audio, tokens = el_synthesize(get_client(), text, voice, model, settings)
    if audio.size == 0:
        fail(f"elevenlabs produced no audio for: {text}")
    lo, hi = trim_bounds(audio)
    lead = lo / SAMPLE_RATE
    timed = [(t, max(0.0, s - lead), max(0.0, e - lead)) for t, s, e in tokens] if tokens else None
    return audio[lo:hi], timed


def run_omnivoice(worker, text: str, speed: float) -> tuple:
    """Returns (trimmed audio, None); OmniVoice gives no timestamps, so words are estimated."""
    from omnivoice_tts import OmniVoiceError

    try:
        audio = worker.synthesize(text, speed)
    except OmniVoiceError as exc:
        fail(str(exc))
    if audio.size == 0:
        fail(f"omnivoice produced no audio for: {text}")
    lo, hi = trim_bounds(audio)
    return audio[lo:hi], None


def synthesize(engine, text: str, voice: str, speed: float) -> tuple:
    """Synthesis with an on-disk cache keyed by engine settings + text/voice/speed."""
    key = hashlib.sha1(f"{engine.cache_tag}{voice}|{speed}|{text}".encode("utf-8")).hexdigest()[:16]
    wav_path = ROOT / CACHE_DIR / f"{key}.wav"
    tok_path = wav_path.with_suffix(".tokens.json")
    if wav_path.is_file():
        audio, _ = sf.read(wav_path, dtype="float32")
        tokens = json.loads(tok_path.read_text()) if tok_path.is_file() else None
        return audio, tokens
    audio, tokens = engine.run(text, voice, speed)
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(wav_path, audio, SAMPLE_RATE)
    if tokens is not None:
        tok_path.write_text(json.dumps(tokens))
    return audio, tokens


def align(words: list, tokens: list) -> Optional[list]:
    """Greedy map of caption words onto token timings; None if they disagree."""
    spans, i = [], 0
    for w in words:
        target, acc, j = norm(w["text"]), "", i
        while j < len(tokens) and len(acc) < len(target) and j - i < MAX_TOKENS_PER_WORD:
            acc += tokens[j][0]
            j += 1
        if acc != target:
            return None
        spans.append((tokens[i][1], tokens[j - 1][2]))
        i = j
    return spans


def time_sentence(caption: str, start: float, duration: float, tokens: Optional[list]) -> tuple:
    chunks = parse_caption(caption)
    flat = [w for c in chunks for w in c]
    spans = align(flat, tokens) if tokens else None
    if spans:
        return timed_chunks(chunks, [(start + s, start + e) for s, e in spans]), "aligned"
    return timed_chunks(chunks, estimate(flat, start, duration)), "estimated"


class Engine:
    """Lazily-created TTS backend. Kokoro keeps the original cache keys (empty cache_tag)."""

    def __init__(self, job: dict):
        self.name = job.get("engine", "kokoro")
        self.lang = job.get("lang", "a")
        self.model = job.get("model", "eleven_flash_v2_5")
        self.settings = job.get("voiceSettings", {})
        self.job = job
        self._backend = None
        if self.name == "kokoro":
            self.cache_tag = ""
        elif self.name == "elevenlabs":
            self.cache_tag = f"elevenlabs|{self.model}|{json.dumps(self.settings, sort_keys=True)}|"
        elif self.name == "omnivoice":
            from omnivoice_tts import OmniVoiceError, cache_tag

            try:
                self.cache_tag = cache_tag(job)
            except OmniVoiceError as exc:
                fail(str(exc))
        else:
            fail(f"unknown engine {self.name!r} (use kokoro, elevenlabs or omnivoice)")

    def _get(self):
        if self._backend is None:
            if self.name == "kokoro":
                from kokoro import KPipeline

                self._backend = KPipeline(lang_code=self.lang)
            elif self.name == "omnivoice":
                import atexit

                from omnivoice_tts import OmniVoiceError, OmniVoiceWorker

                try:
                    self._backend = OmniVoiceWorker(self.job)
                except OmniVoiceError as exc:
                    fail(str(exc))
                atexit.register(self._backend.close)
            else:
                from elevenlabs_tts import client

                self._backend = client()
        return self._backend

    def run(self, text: str, voice: str, speed: float) -> tuple:
        if self.name == "kokoro":
            return run_kokoro(self._get(), text, voice, speed)
        if self.name == "omnivoice":
            return run_omnivoice(self._get(), text, speed)
        return run_elevenlabs(self._get, text, voice, self.model, self.settings)


def build(job: dict) -> tuple:
    engine = Engine(job)
    voice, speed = job.get("voice", "am_michael"), float(job.get("speed", 1.0))
    sentence_gap = np.zeros(int(job.get("sentenceGap", 0.12) * SAMPLE_RATE), dtype=np.float32)
    scene_gap = np.zeros(int(job.get("sceneGap", 0.3) * SAMPLE_RATE), dtype=np.float32)

    pieces, scenes, cursor = [], [], 0.0
    for scene in job["scenes"]:
        scene_start, sentences = cursor, []
        for i, s in enumerate(scene["sentences"]):
            if i > 0:
                pieces.append(sentence_gap)
                cursor += len(sentence_gap) / SAMPLE_RATE
            audio, tokens = synthesize(engine, s.get("say") or plain_caption(s["caption"]), voice, speed)
            dur = len(audio) / SAMPLE_RATE
            chunks, method = time_sentence(s["caption"], cursor, dur, tokens)
            print(f"  {scene['id']}[{i}] {dur:5.2f}s {method:9} {plain_caption(s['caption'])[:56]}")
            sentences.append({"start": round(cursor, 3), "end": round(cursor + dur, 3), "chunks": chunks})
            pieces.append(audio)
            cursor += dur
        pieces.append(scene_gap)
        cursor += len(scene_gap) / SAMPLE_RATE
        scenes.append({"id": scene["id"], "start": round(scene_start, 3), "end": round(cursor, 3),
                       "sentences": sentences, **({"visual": scene["visual"]} if "visual" in scene else {})})

    tail = float(job.get("tail", 1.0))
    pieces.append(np.zeros(int(tail * SAMPLE_RATE), dtype=np.float32))
    scenes[-1]["end"] = round(cursor + tail, 3)
    timeline = {"id": job["id"], "durationS": round(cursor + tail, 3), "copy": job.get("copy", {}),
                "scenes": scenes}
    audio = np.concatenate(pieces)
    peak = float(np.max(np.abs(audio))) or 1.0
    return audio * (PEAK_TARGET / peak), timeline


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    job = load_job(Path(sys.argv[1]))
    audio, timeline = build(job)

    wav_out = ROOT / "public" / job["id"] / "voice.wav"
    json_out = ROOT / "src" / "explainer" / "data" / f"{job['id']}.json"
    wav_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(wav_out, audio, SAMPLE_RATE)
    json_out.write_text(json.dumps(timeline, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {wav_out.relative_to(ROOT)} ({timeline['durationS']:.2f}s) and {json_out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
