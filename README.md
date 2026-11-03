# Explainer Reel Engine

Short-form vertical (1080x1920, 30 fps) motion-graphics reels built with [Remotion](https://www.remotion.dev/),
narrated by TTS (ElevenLabs voice clone or free offline Kokoro), with word-timed captions (faster-whisper).
Designed to be driven by [Claude Code](https://claude.com/claude-code): the project skills in `.claude/skills/`
encode the full workflow.

> New here? Follow **[requirements.md](./requirements.md)** first (Node, Python venv, FFmpeg, ElevenLabs key).

## Example output

Made entirely with this repo (script -> voice -> captions -> render). Click to watch on YouTube:

[![Example reel made with Explainer Reel Engine](https://img.youtube.com/vi/CMvXPMiRqso/hqdefault.jpg)](https://www.youtube.com/shorts/CMvXPMiRqso)

### How a reel is edited with the engine

Behind-the-scenes: watch how a reel gets built and edited with this repo.

[![Edited with Explainer Reel Engine](https://img.youtube.com/vi/p7kpvb0XDtQ/hqdefault.jpg)](https://www.youtube.com/shorts/p7kpvb0XDtQ)

## Repo layout

```
CLAUDE.md          project rules for Claude Code
briefs/            REEL_BRIEF.md - fill in and attach to start a new reel
.claude/skills/    reel-from-script, reel-from-reference, reel-layers-story
motion/            the Remotion project
  src/             compositions, scenes, components (registered in src/explainer/...)
  jobs/            one JSON per reel (script, scenes, voice settings)
  tts/             Python: Kokoro/ElevenLabs voiceover, captions, cached rebuilds
  public/          per-reel audio/assets, fonts, music, logo
output/            rendered reels (empty in git)
reference/         your reference videos/screenshots (empty in git)
```

## Setup

1. Install everything in [requirements.md](./requirements.md).
2. For ElevenLabs voice: `cp motion/.env.example motion/.env.local` and set `ELEVENLABS_API_KEY`
   (this file is git-ignored; never commit it). No key? Use Kokoro (free).
3. Preview: `cd motion && npm run studio`.

## Make a reel

### With Claude Code (recommended)
Open the repo in Claude Code and use one of the locked workflows:

1. **Script -> reel**: attach `briefs/REEL_BRIEF.md` (filled) + your script and run `/reel-from-script`.
2. **Reference video -> your own reel**: put the video in `reference/`, run `/reel-from-reference`.
3. **"Layers story" style** (problem -> fix chain in one chat window): `/reel-layers-story`.

Claude follows 4 gates and waits for your approval at each:
**plan -> free Kokoro draft -> final ElevenLabs voice (spends credits) -> cached-only visual edits** (no credits).

### Manually
```powershell
cd motion
$env:PYTHONIOENCODING="utf-8"
# 1. voiceover + captions from a job (free Kokoro if the job has no "engine")
.venv\Scripts\python tts\build_voiceover.py jobs\components-demo.json
# 2. render
npx remotion render src/index.ts <CompositionId> ..\output\components-demo.mp4
```
Re-render after visual-only edits with no new TTS spend: `tts\build_voiceover_cached.py jobs\<id>.json`.

Other pipelines: own camera recording -> split-screen reel via `tts/build_from_recording.py`
(register in `src/explainer/split/reels.tsx`).

## Job file basics

`motion/jobs/<id>.json` holds the script, scenes, and voice config. Voice config for ElevenLabs:
`"engine": "elevenlabs"`, `"voice": "<voice id>"`, `"model": "eleven_flash_v2_5"`. Omit `engine` for Kokoro.
The included voice id belongs to the repo owner; use your own (`tts/clone_voice.py`) or Kokoro.
Visual component types (punch, chart, sequence, screenshot, phoneflow, compare, quiz, diff, ...) are
documented in `.claude/skills/reel-from-script/SKILL.md`.

## Security

- `motion/.env.local` / `.env` are git-ignored. Never print or commit API keys.
- `output/` and `reference/` contents are git-ignored (folders kept with `.gitkeep`).

## License

[MIT](./LICENSE) © 2026 Fahim Khan. Bundled third-party media in `motion/public/` (e.g. reference clips) may carry their own rights.
