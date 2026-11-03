"""Generate a voiceover WAV with Kokoro (local, free).

Usage: python tts/kokoro_tts.py "text to speak" public/voice/out.wav [voice] [speed]
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

SAMPLE_RATE = 24000
DEFAULT_VOICE = "am_michael"
DEFAULT_SPEED = 1.05


def synthesize(text: str, out: Path, voice: str = DEFAULT_VOICE, speed: float = DEFAULT_SPEED) -> float:
    if not text.strip():
        raise ValueError("text is empty")
    pipeline = KPipeline(lang_code="a")  # American English
    chunks = [audio for _, _, audio in pipeline(text, voice=voice, speed=speed)]
    if not chunks:
        raise RuntimeError("kokoro produced no audio")
    audio = np.concatenate(chunks)
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(out, audio, SAMPLE_RATE)
    return len(audio) / SAMPLE_RATE


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    text, out = sys.argv[1], Path(sys.argv[2])
    voice = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_VOICE
    speed = float(sys.argv[4]) if len(sys.argv) > 4 else DEFAULT_SPEED
    seconds = synthesize(text, out, voice, speed)
    print(f"wrote {out} ({seconds:.2f}s)")


if __name__ == "__main__":
    main()
