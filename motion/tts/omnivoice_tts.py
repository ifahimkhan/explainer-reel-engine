"""Local OmniVoice (k2-fsa, Apache-2.0) zero-shot cloning for build_voiceover.py.

The model runs in a separate venv (motion/.venv-omnivoice) via a long-lived worker
process (omnivoice_worker.py), so it loads once per build. CPU only: ~1-2 min per sentence
on this laptop (cost is dominated by the reference length); the TTS cache makes re-renders free.

Job fields:
  "engine": "omnivoice"
  "refAudio": "voices/fahim-v3-ref.wav"   path relative to motion/ (the delivery is cloned too:
                                           use an animated clip, e.g. an ElevenLabs v3 take)
  "refText":  "..."                        optional; defaults to the sibling .txt of refAudio
  "omnivoice": {"numStep": 16, "guidanceScale": 2.0, "seed": 7}   optional
"""
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path

import soundfile as sf

MOTION = Path(__file__).resolve().parent.parent
WORKER = Path(__file__).resolve().parent / "omnivoice_worker.py"
VENV_PY = MOTION / ".venv-omnivoice" / "Scripts" / "python.exe"
# numStep 16 (model default 32) halves CPU time; set 32 per job if a take sounds rough.
DEFAULTS = {"numStep": 16, "guidanceScale": 2.0, "seed": None}


class OmniVoiceError(RuntimeError):
    pass


def resolve_reference(job: dict) -> tuple:
    """Returns (absolute ref audio path, ref transcript). Raises OmniVoiceError if unusable."""
    rel = job.get("refAudio")
    if not rel:
        raise OmniVoiceError('omnivoice job needs "refAudio" (e.g. "voices/fahim-v3-ref.wav")')
    ref = (MOTION / rel).resolve()
    if not ref.is_file():
        raise OmniVoiceError(f"refAudio not found: {ref}")
    text = job.get("refText")
    if not text:
        txt = ref.with_suffix(".txt")
        if not txt.is_file():
            raise OmniVoiceError(f'no "refText" in job and no transcript file {txt.name}')
        text = txt.read_text(encoding="utf-8")
    text = " ".join(text.split())
    if not text:
        raise OmniVoiceError("reference transcript is empty")
    return ref, text


def settings(job: dict) -> dict:
    extra = job.get("omnivoice", {})
    unknown = set(extra) - set(DEFAULTS)
    if unknown:
        raise OmniVoiceError(f"unknown omnivoice settings: {sorted(unknown)}")
    return {**DEFAULTS, **extra}


def cache_tag(job: dict) -> str:
    """Cache key prefix: changes when the reference clip, its transcript or settings change."""
    ref, text = resolve_reference(job)
    ref_hash = hashlib.sha1(ref.read_bytes()).hexdigest()[:12]
    return f"omnivoice|{ref_hash}|{text}|{json.dumps(settings(job), sort_keys=True)}|"


class OmniVoiceWorker:
    def __init__(self, job: dict):
        if not VENV_PY.is_file():
            raise OmniVoiceError(f"missing {VENV_PY}; see motion/tts/OMNIVOICE.md to create it")
        self.ref, self.ref_text = resolve_reference(job)
        self.opts = settings(job)
        env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        self.proc = subprocess.Popen(
            [str(VENV_PY), "-I", str(WORKER)], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            text=True, encoding="utf-8", env=env, cwd=str(MOTION),
        )
        ready = self._read()
        if not ready.get("ready"):
            raise OmniVoiceError(f"worker failed to start: {ready}")

    def _read(self) -> dict:
        line = self.proc.stdout.readline()
        if not line:
            raise OmniVoiceError(f"worker exited (code {self.proc.poll()}); see its log above")
        return json.loads(line)

    def synthesize(self, text: str, speed: float):
        """Returns float32 mono audio at 24 kHz (untrimmed)."""
        fd, out = tempfile.mkstemp(suffix=".wav")
        os.close(fd)
        try:
            req = {"text": text, "out": out, "ref_audio": str(self.ref), "ref_text": self.ref_text,
                   "speed": speed, "num_step": self.opts["numStep"],
                   "guidance_scale": self.opts["guidanceScale"], "seed": self.opts["seed"]}
            self.proc.stdin.write(json.dumps(req) + "\n")
            self.proc.stdin.flush()
            res = self._read()
            if not res.get("ok"):
                raise OmniVoiceError(f"omnivoice failed for {text[:60]!r}: {res.get('error')}")
            audio, _ = sf.read(out, dtype="float32")
            return audio
        finally:
            Path(out).unlink(missing_ok=True)

    def close(self) -> None:
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=30)
            except subprocess.TimeoutExpired:
                self.proc.kill()
