# OmniVoice engine (optional, local)

Free, offline zero-shot voice cloning with [k2-fsa/OmniVoice](https://github.com/k2-fsa/OmniVoice)
(Apache-2.0 code, model `k2-fsa/OmniVoice` ~3.3 GB in the Hugging Face cache).
ElevenLabs stays the default; use this only when a job opts in.

## What to expect

- **Clones the delivery of the reference clip, not just the timbre.** A flat clip narrates flat.
  Use an animated clip; the house reference `voices/fahim-v3-ref.wav` is a 13 s ElevenLabs v3
  take of the Fahim Khan clone. It keeps one tone for the whole reel; no per-line emotion like v3.
- **CPU only** (MX450 is too small). Each call pays a fixed cost for the reference clip, so time is
  per *sentence*, not per second of audio. Measured (16 steps, 8 threads): ~100 s/sentence with the
  13 s reference, ~60 s with the 7 s `voices/fahim-v3-ref-short.wav`. A 20-sentence reel is
  20-35 min the first time; the TTS cache makes re-renders and `build_voiceover_cached.py` instant.
  Batching sentences gave no speedup on CPU.
- **No word timestamps**: caption words are spread by syllable estimate (same fallback as before).
  ElevenLabs text tags like `[excited]` are read aloud; don't use them.

## Setup (once)

```bash
cd motion
uv venv --python 3.12 .venv-omnivoice
uv pip install --python .venv-omnivoice/Scripts/python.exe \
  --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple \
  --index-strategy unsafe-best-match torch torchaudio "transformers>=5.3.0" accelerate soundfile pydub numpy librosa
uv pip install --python .venv-omnivoice/Scripts/python.exe --no-deps omnivoice==0.2.1
```

The model downloads on first use (or pre-fetch with `huggingface_hub.snapshot_download("k2-fsa/OmniVoice")`).

## Job

```json
{
  "id": "my-reel",
  "engine": "omnivoice",
  "refAudio": "voices/fahim-v3-ref.wav",
  "omnivoice": {"numStep": 16, "guidanceScale": 2.0, "seed": 7},
  "scenes": [...]
}
```

- `refAudio` is relative to `motion/`; 10-15 s, one speaker, no music.
- `refText` is the clip's exact transcript; if omitted, the sibling `.txt` (`voices/fahim-v3-ref.txt`) is used.
- `omnivoice` settings are optional. `numStep` defaults to 16 (model default 32, twice as slow);
  raise it if a take sounds rough. `seed` makes takes reproducible. `speed` (job level) is passed through.
- Changing the clip, its transcript or settings changes the cache key (new synthesis).

Build as usual: `PYTHONIOENCODING=utf-8 .venv/Scripts/python tts/build_voiceover.py jobs/<id>.json`.
The main venv spawns `tts/omnivoice_worker.py` inside `.venv-omnivoice` and keeps the model loaded
for the whole build.
