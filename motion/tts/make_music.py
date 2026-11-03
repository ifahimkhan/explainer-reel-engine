"""Generate an instrumental background track with ElevenLabs Music.

Usage: python tts/make_music.py <name> <seconds> "<prompt>"
Writes public/music/<name>.mp3 (skipped if it already exists, so re-runs cost nothing).
Costs ElevenLabs credits. The key is loaded by elevenlabs_tts.client(); never print it.
"""
import sys
from pathlib import Path

from elevenlabs_tts import ROOT, client

MIN_SECONDS, MAX_SECONDS = 10, 300


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    name, seconds, prompt = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    if not MIN_SECONDS <= seconds <= MAX_SECONDS:
        sys.exit(f"seconds must be between {MIN_SECONDS} and {MAX_SECONDS}")
    out = ROOT / "public" / "music" / f"{name}.mp3"
    if out.exists():
        print(f"cached {out.relative_to(ROOT)}")
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    try:
        chunks = client().music.compose(
            prompt=prompt, music_length_ms=int(seconds * 1000), force_instrumental=True,
            output_format="mp3_44100_192",
        )
        data = b"".join(chunks)
    except Exception as e:  # SDK raises ApiError subclasses; surface status + message
        sys.exit(f"ElevenLabs Music failed: {e}")
    Path(out).write_bytes(data)
    print(f"wrote {out.relative_to(ROOT)} ({len(data) // 1024} KB)")


if __name__ == "__main__":
    main()
