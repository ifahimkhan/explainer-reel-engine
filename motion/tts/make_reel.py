"""End-to-end: narration -> timeline -> Remotion render -> mp4.

Jobs with a `video` field use your recording (build_from_recording.py: your voice,
whisper captions, split-screen camera panel); others use Kokoro TTS (build_voiceover.py).

Usage: python tts/make_reel.py jobs/<job>.json <CompositionId> [output_dir]

Example:
  python tts/make_reel.py jobs/github-tricks.json GithubTricks ../output
  python tts/make_reel.py jobs/split-stitch.json SplitStitch ../output
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT.parent / "output"


def fail(msg: str) -> None:
    sys.exit(f"make_reel: {msg}")


def run(cmd: list, step: str) -> None:
    print(f"[{step}] {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        fail(f"{step} failed (exit {result.returncode})")


def main() -> None:
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    job_path = Path(sys.argv[1]).resolve()
    composition = sys.argv[2]
    out_dir = Path(sys.argv[3]).resolve() if len(sys.argv) == 4 else DEFAULT_OUT
    if not job_path.is_file():
        fail(f"job not found: {job_path}")
    job = json.loads(job_path.read_text(encoding="utf-8"))
    job_id = job.get("id", "")
    if not job_id:
        fail("job has no id")

    # On Windows a bare "npx" can resolve to a POSIX shell shim CreateProcess can't run.
    npx = (shutil.which("npx.cmd") if sys.platform == "win32" else None) or shutil.which("npx")
    if not npx:
        fail("npx not found on PATH")

    builder = "build_from_recording.py" if job.get("video") else "build_voiceover.py"
    if job.get("video") and not job.get("scenes"):
        fail("recording job has no scenes yet: run build_from_recording.py for the transcript, write the script, then retry")
    run([sys.executable, str(ROOT / "tts" / builder), str(job_path)], "timeline")

    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{job_id}.mp4"
    run([npx, "remotion", "render", "src/index.ts", composition, str(out_file),
         "--codec=h264", "--crf=18", "--audio-bitrate=192k"], "render")
    print(f"done -> {out_file}")


if __name__ == "__main__":
    main()
