"""Rebuild a job's voice track and timeline from the TTS cache ONLY.

Use for visual-only changes (new components, cues, transitions) so no ElevenLabs
credits can be spent. Any sentence whose spoken text is not cached aborts the run
instead of calling the API.

    PYTHONIOENCODING=utf-8 .venv/Scripts/python tts/build_voiceover_cached.py jobs/<id>.json

The cache key is the spoken text (`say`, or the caption with markup stripped) +
voice + model + settings. Adding/removing `*highlight*`, `#cue` tags or `|` splits
keeps the key; changing words, voice or model does not.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_voiceover as bv  # noqa: E402


def _refuse(*_args, **_kwargs):
    raise SystemExit("CACHE MISS: this sentence is not cached; refusing to call the TTS API. "
                     "Words, voice or model changed -> run build_voiceover.py after user approval.")


bv.el_synthesize = _refuse
bv.Engine.run = lambda self, *a, **k: _refuse()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: build_voiceover_cached.py jobs/<id>.json")
    sys.argv = ["build_voiceover.py", sys.argv[1]]
    bv.main()
