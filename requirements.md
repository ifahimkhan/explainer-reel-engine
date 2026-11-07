# requirements.md - setup checklist for humans and Claude Code agents

Read this top to bottom and install everything listed BEFORE running any reel workflow.
Target OS: Windows 11 (PowerShell / Git Bash). All paths are relative to the repo root.

## 1. System tools (install first, verify with the command shown)

| Tool | Version | Verify | Why |
|---|---|---|---|
| Node.js | 22+ (tested 24.x) | `node -v` | Remotion (React video renderer), npm |
| npm | bundled with Node | `npm -v` | JS deps |
| Python | 3.12 (tested 3.12.0) | `python --version` | TTS, captions, build scripts |
| FFmpeg | 6+ (tested 9.0) on PATH | `ffmpeg -version` | audio/video processing, Whisper input |
| Git | any recent | `git --version` | version control |
| Google Chrome / Chromium | any | auto-downloaded by Remotion on first render | headless render |

Windows note: from Python, spawn `npx.cmd`, not `npx`.

## 2. JavaScript dependencies

```powershell
cd motion
npm install
```

Installs everything in `motion/package.json` (Remotion 4.0.538 family, React 19, three.js, zod, TypeScript).
Check: `npm run typecheck` must pass.

## 3. Python dependencies (virtualenv MUST live at `motion/.venv`)

```powershell
cd motion
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\pip install -r requirements.txt
```

`motion/requirements.txt` pins: kokoro (free offline TTS), torch, numpy, soundfile, faster-whisper (word-timed
captions), av (**must stay < 16**, 16+ breaks faster-whisper 1.2.1), piper-tts, edge-tts, elevenlabs (paid TTS),
python-dotenv, and the spaCy model `en_core_web_sm` (downloaded from GitHub releases).

Gotchas:
- faster-whisper runs **CPU int8 only** (no CUDA assumed). Never pass the script as `initial_prompt`.
- First run downloads models (Kokoro, Whisper) into `motion/.cache/` (git-ignored). Needs internet; can be slow.
- Always run Python with `PYTHONIOENCODING=utf-8`.
- Kokoro may need `espeak-ng` on PATH if phonemizer complains: install from https://github.com/espeak-ng/espeak-ng/releases.

## 4. Secrets / accounts

| Item | Where | Notes |
|---|---|---|
| ElevenLabs account + API key | `motion/.env.local` | `ELEVENLABS_API_KEY=...`. Copy `motion/.env.example`, or run `npx -y @elevenlabs/cli@latest onboard init` from `motion/`. **Never commit, print or read the key.** Only needed for ElevenLabs voice; Kokoro works with no key. |
| ElevenLabs cloned voice | ElevenLabs dashboard | `CLAUDE.md` / skills reference voice id `ruZOzaKd6ljzH7J9ejYE` which belongs to the repo owner's account. Anyone else must create their own clone (`motion/tts/clone_voice.py`) and replace the id in job files + skills, or use Kokoro (jobs without `"engine"`). |
| GitHub CLI (optional) | `gh auth login` | only for pushing |

## 4b. Optional: OmniVoice local voice cloning

Free, offline cloning from a 10-15 s reference clip (CPU, ~1-2 min per sentence). Needs its own venv at
`motion/.venv-omnivoice` and a ~3.3 GB model download on first use. Setup and job fields:
[motion/tts/OMNIVOICE.md](motion/tts/OMNIVOICE.md). Skip it if you use Kokoro or ElevenLabs.

## 5. Folders that are intentionally empty in git

- `output/` - finished `.mp4` reels land here (git-ignored, `.gitkeep` only).
- `reference/` - drop reference videos / screenshots / `.srt` here (git-ignored, `.gitkeep` only).

## 6. Verify the install (no paid calls)

```powershell
cd motion
npm run typecheck
.venv\Scripts\python -c "import kokoro, faster_whisper, elevenlabs, soundfile; print('python ok')"
npx remotion compositions src/index.ts
```

Then render a free Kokoro demo, e.g. job `motion/jobs/components-demo.json` (see README "Make a reel").

## 7. Rules every agent must follow

1. Read `CLAUDE.md` and the matching `.claude/skills/*/SKILL.md` before making a reel.
2. Obey the gates: plan -> free Kokoro draft -> final ElevenLabs voice (only after user says go) -> cached-only edits.
3. Never open/print `motion/.env.local`. Never commit `output/` or `reference/` contents.
4. Fonts are self-hosted (`motion/src/fonts.ts`); do not add `@remotion/google-fonts` usage.
5. Composition configs hold functions: register via wrapper components, not `defaultProps`.
6. Ask the user when language, CTA keyword or facts are unclear.
