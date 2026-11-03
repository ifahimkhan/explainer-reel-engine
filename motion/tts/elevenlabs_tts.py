"""ElevenLabs helpers shared by the TTS pipeline and clone_voice.py.

The API key is read from ELEVENLABS_API_KEY, loaded from .env.local (written by
`npx @elevenlabs/cli onboard`) or .env. Never put the key in code or job files.
"""
import base64
import os
import sys
from pathlib import Path

import numpy as np

from captions import norm

ROOT = Path(__file__).resolve().parent.parent
SAMPLE_RATE = 24000
OUTPUT_FORMAT = "pcm_24000"  # raw 16-bit mono PCM, matches the Kokoro sample rate
DEFAULT_MODEL = "eleven_flash_v2_5"


def client():
    from dotenv import load_dotenv
    from elevenlabs import ElevenLabs

    for name in (".env.local", ".env"):
        load_dotenv(ROOT / name, override=False)
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("ElevenLabs: ELEVENLABS_API_KEY is not set (run `npx -y @elevenlabs/cli@latest onboard init`)")
    # Passed explicitly: the SDK's default reads the env var at import time, before dotenv runs.
    return ElevenLabs(api_key=api_key)


def char_words(chars: list, starts: list, ends: list) -> list:
    """Group character timings into word tokens [(normalized word, start, end)]."""
    words, text, start, end = [], "", None, 0.0
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if norm(text):
                words.append((norm(text), start, end))
            text, start = "", None
            continue
        if start is None:
            start = s
        text, end = text + ch, e
    if norm(text):
        words.append((norm(text), start, end))
    return words


def synthesize(api, text: str, voice_id: str, model: str, settings: dict) -> tuple:
    """Returns (float32 audio at SAMPLE_RATE, word tokens or None)."""
    from elevenlabs import VoiceSettings

    try:
        res = api.text_to_speech.convert_with_timestamps(
            voice_id, text=text, model_id=model, output_format=OUTPUT_FORMAT,
            voice_settings=VoiceSettings(**settings) if settings else None,
        )
    except Exception as e:  # SDK raises ApiError subclasses; surface status + message
        sys.exit(f"ElevenLabs TTS failed for {text[:40]!r}: {e}")
    pcm = np.frombuffer(base64.b64decode(res.audio_base_64), dtype="<i2")
    audio = pcm.astype(np.float32) / 32768.0
    a = res.alignment
    tokens = char_words(a.characters, a.character_start_times_seconds, a.character_end_times_seconds) if a else None
    return audio, tokens or None
