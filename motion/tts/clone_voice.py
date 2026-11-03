"""Create (or reuse) an ElevenLabs instant voice clone from your recordings.

Usage: python tts/clone_voice.py "<Voice Name>" <recording> [<recording> ...]

Each recording (video or audio) is reduced to a cleaned mono mp3 sample with ffmpeg,
then uploaded as one instant voice clone. If a voice with the same name already
exists in your account it is reused, so re-running costs nothing.

Prints the voice_id; put it in a job as {"engine": "elevenlabs", "voice": "<voice_id>"}.
Only clone a voice you own or have explicit permission to use.
"""
import subprocess
import sys
from pathlib import Path

from elevenlabs_tts import ROOT, client

SAMPLE_DIR = ROOT / ".cache" / "voice-samples"
AUDIO_FILTER = "highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11"


def fail(msg: str) -> None:
    sys.exit(f"clone_voice: {msg}")


def make_sample(src: Path) -> Path:
    if not src.is_file():
        fail(f"recording not found: {src}")
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    out = SAMPLE_DIR / f"{src.stem}.mp3"
    result = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vn", "-af", AUDIO_FILTER,
                             "-ar", "44100", "-ac", "1", "-b:a", "192k", str(out)])
    if result.returncode != 0:
        fail(f"ffmpeg failed on {src}")
    return out


def existing_voice(api, name: str):
    for voice in api.voices.get_all().voices:
        if voice.name == name and voice.category == "cloned":
            return voice.voice_id
    return None


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    name, sources = sys.argv[1], [Path(p).resolve() for p in sys.argv[2:]]
    api = client()
    voice_id = existing_voice(api, name)
    if voice_id:
        print(f"reusing existing clone {name!r}: {voice_id}")
        return

    samples = [make_sample(s) for s in sources]
    print(f"uploading {len(samples)} samples for {name!r}")
    handles = [open(p, "rb") for p in samples]
    try:
        res = api.voices.ivc.create(name=name, files=handles, remove_background_noise=True,
                                    description="Cloned from the owner's own recordings for reel narration.")
    except Exception as e:
        fail(f"voice clone failed: {e}")
    finally:
        for h in handles:
            h.close()
    print(f"created clone {name!r}: {res.voice_id}")


if __name__ == "__main__":
    main()
