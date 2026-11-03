---
name: reel-from-reference
description: Recreate a reference reel/short (another creator's video) as an original Fahim Khan reel narrated in the user's ElevenLabs voice clone. Use when the user gives a reference video and asks to make "the same", "like this", or "a reel like this" for their channel.
---

# Reel from a reference video (Fahim Khan voice clone)

Goal: same topic, structure, pacing and visual style as the reference, but **our own script,
our own brand, our own visuals**, narrated by the user's ElevenLabs clone.

## Locked settings (do not change unless the user asks)

| Setting | Value |
|---|---|
| Brand / channel | `Fahim Khan`, logo `motion/public/logo.png` (header via `BRAND` const) |
| TTS engine | `"engine": "elevenlabs"` |
| Voice | `"voice": "ruZOzaKd6ljzH7J9ejYE"` (ElevenLabs clone "Fahim Khan") |
| Model | `"model": "eleven_flash_v2_5"`, `"voiceSettings": {"stability": 0.5, "similarity_boost": 0.8}` |
| Format | 1080x1920, 30 fps, h264 crf 18, AAC 192k |
| Output | `C:\Users\i_fah\Downloads\reels\output\<job id>.mp4` |
| API key | `motion/.env.local` (ELEVENLABS_API_KEY). Never open, print or copy it. If missing/invalid run `npx -y @elevenlabs/cli@latest onboard init` from `motion/`. |

Never copy the reference creator's name, handle, logo, watermark or exact wording.
Never claim facts you can't verify; ask.

## Steps

1. **Ingest.** Put the video in `reels/reference/` if it isn't there. `ffprobe` it for duration/size.
2. **Watch it.** Extract frames to a temp folder (not the project), ~1 per second plus scene cuts:
   `ffmpeg -i ref.mp4 -vf "fps=1,scale=360:-1" <tmp>/f%03d.png`, tile them (`tile=6x4`) and view.
   Note: hook, number of scenes, what each scene shows, on-screen text, caption style, CTA, total length.
3. **Hear it.** Transcribe with faster-whisper from `motion/.venv` (`device="cpu", compute_type="int8"`,
   `vad_filter=True`, no `initial_prompt`; model `small` for Hindi/Hinglish, `small.en` for English).
   Write the timed transcript to the temp folder.
4. **Ask before writing** (AskUserQuestion, one batch) whenever any of these are unclear:
   - language: English or Hinglish (default: English);
   - the CTA keyword / what gets DMed (reference CTA is usually theirs);
   - any fact, tool name, URL or number in the reference you can't confirm;
   - whether to keep the same length or tighten it;
   - anything in the visuals you can't identify.
   Don't ask about things already locked above.
5. **Script.** Rewrite in the user's voice: same beats, new wording, ~same length (aim 45-60 s).
   Put a hook in sentence 1 and a CTA last.
6. **Job** `motion/jobs/<id>.json` (slug id): locked settings above + `sentenceGap` 0.14, `sceneGap` 1.0 (user default: 1 s between scenes, never 2 s),
   `tail` 1.2, `copy` (on-screen strings), `scenes[{id, visual?, sentences[{caption}]}]`.
   Caption markup (`tts/captions.py`): `*word*` highlight, `word#tag` animation cue, `|` chunk split.
7. **Visuals.**
   - Prefer generic visuals in the job (`title`, `phones`, `steps`, `compare`, schema in
     `src/explainer/scenes/generic/visuals.ts`) and register `scriptReel("<CompositionId>", timeline)` in
     `src/explainer/scriptReels.tsx` (import `./data/<id>.json`).
   - If the reference needs something the generic types can't show (URL bar morph, diagram, chat UI...),
     build bespoke scenes like `src/explainer/githubTricks.tsx` (scenes animate on `#tag` cues, read text
     via `useCopy()`), or add a new generic visual type (zod schema + scene + `renderVisual` case) if reusable.
   - Match the reference's look in spirit (light cards, green highlights) but keep our theme.
8. **Narration.** `PYTHONIOENCODING=utf-8 .venv/Scripts/python tts/build_voiceover.py jobs/<id>.json` from `motion/`.
   This costs ElevenLabs credits (~1 credit/char); results are cached in `.cache/tts`, so re-runs are free
   unless captions change. Every sentence should print `aligned`; if one prints `estimated`, fix the caption
   text so its words match what is spoken (numbers/symbols spelled as spoken, or add `say`).
9. **Render.** `npx tsc --noEmit -p .`, then
   `.venv/Scripts/python tts/make_reel.py jobs/<id>.json <CompositionId> ../output` (run in background).
10. **Verify** before reporting: ffprobe (1080x1920, h264+aac, duration), full decode `ffmpeg -v error -i out.mp4 -f null -`,
    `volumedetect` (mean around -22 dB), and 4-6 stills via `npx remotion still ... --frame=N` tiled into one image and viewed.
11. **Report**: output path, duration, aligned count, credits used, anything assumed. Ask if they want changes.
