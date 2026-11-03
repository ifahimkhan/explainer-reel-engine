# Fahim Khan reels

Short-form vertical reels for the **Fahim Khan** channel, built with Remotion in `motion/`.
Finished videos go to `output/`. Reference videos go in `reference/`.

## Locked workflows (default narration: the user's ElevenLabs voice clone)

1. **Reference video -> same reel for my channel**: follow `.claude/skills/reel-from-reference/SKILL.md`.
2. **Script text -> video with visuals**: follow `.claude/skills/reel-from-script/SKILL.md`.
3. **"Layers story" style (problem -> fix chain in one persistent chat, like `tagway-ai-layers`)**: follow `.claude/skills/reel-layers-story/SKILL.md`.

Always confirm the final script + voice model with the user before generating audio or rendering.
New reels: user attaches `briefs/REEL_BRIEF.md` + script; follow its 4 gates (plan -> free draft -> final voice -> cached-only edits via `tts/build_voiceover_cached.py`).

Both use `"engine": "elevenlabs"`, voice `ruZOzaKd6ljzH7J9ejYE` ("Fahim Khan" clone), model `eleven_flash_v2_5` (locked by the user; never switch back to eleven_v4 unless asked).
Ask the user when something is unclear (language, CTA keyword, unverifiable facts) instead of guessing.

## Other pipelines

- Own camera recording -> split-screen reel (60% graphics / 40% camera, whisper captions):
  job with `video`, `tts/build_from_recording.py`, register in `src/explainer/split/reels.tsx`.
- Kokoro offline TTS: job without `engine` (default `kokoro`).

## Gotchas

- Python: `motion/.venv`, run with `PYTHONIOENCODING=utf-8`. faster-whisper CPU int8 only; never pass the script as `initial_prompt`.
- ElevenLabs key lives in `motion/.env.local`; never read or print it.
- Composition configs hold functions: register via wrapper components, not `defaultProps`.
- Fonts are self-hosted (`src/fonts.ts`); don't reintroduce `@remotion/google-fonts`.
- From Python on Windows spawn `npx.cmd`, not `npx`.
