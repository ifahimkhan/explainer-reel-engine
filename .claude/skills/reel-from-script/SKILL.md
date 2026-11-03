---
name: reel-from-script
description: Turn a script the user provides into a Fahim Khan motion-graphics reel narrated by the user's ElevenLabs voice clone, with visuals generated to match what is said. Use when the user pastes or attaches script text and asks to make a video/reel from it.
---

# Reel from a script (Fahim Khan voice clone)

Goal: the user's script, spoken by their ElevenLabs clone, with word-timed captions and
motion graphics that show what each sentence says.

## Locked settings (do not change unless the user asks)

| Setting | Value |
|---|---|
| Brand / channel | `Fahim Khan`, logo `motion/public/logo.png` |
| TTS engine | `"engine": "elevenlabs"` |
| Voice | `"voice": "ruZOzaKd6ljzH7J9ejYE"` (ElevenLabs clone "Fahim Khan") |
| Model | `"model": "eleven_flash_v2_5"`, `"voiceSettings": {"stability": 0.5, "similarity_boost": 0.8}` |
| Format | 1080x1920, 30 fps, h264 crf 18, AAC 192k |
| Output | `C:\Users\i_fah\Downloads\reels\output\<job id>.mp4` |
| API key | `motion/.env.local` (ELEVENLABS_API_KEY). Never open, print or copy it. If missing/invalid run `npx -y @elevenlabs/cli@latest onboard init` from `motion/`. |

## Rules for the script

- **Speak the user's words.** Don't rewrite meaning. Only allowed edits: fixing obvious typos, spelling out
  symbols for speech (`10K` stays in the caption, put the spoken form in `say` if needed), splitting long
  sentences into caption chunks with `|`. If you think a line should change, ask instead.
- Ask (AskUserQuestion, one batch) only when unclear: language (default English), title/hook text for the
  first card, CTA keyword, a fact/name you can't verify, or a target length if the script runs > 75 s.

## Default style (UPI recipe) - use for every new reel unless the user picks another

The user's house style since 2026-11-01. Reference: `motion/jobs/upi-layers.json` -> `output/upi-layers.mp4`.
Goal: something new on screen every few seconds so viewers don't scroll away.

- **8-12 short scenes**, each one beat: problem -> fix -> result. Change the visual every ~10-15 s.
- **Hook**: `punch` (one big word + headline with a highlighted number).
- **Mid-reel quiz**: one `quiz` scene ("Pause and guess: ...") around the 25-40 s mark.
- **Pick the visual by content**: `sequence` for any request/response between systems, `journey` for user steps,
  `chart` for load/cost/metric changes, `diff` for code fixes, `phoneapp` for app behaviour (jank, ANR), `phoneflow` for what the user sees while paying/logging in
  (use it instead of a 2nd/3rd `sequence` in a row), `compare`
  for before/after.
- **Add-ons**:
  - `glitch` on every failure line ("Money sent. To someone else.")
  - `camera` zoom on the key word (zoom 1.15-1.35, keep all lanes/labels in frame)
  - vary scene entries with `transition` (`slide` / `whip` / `zoom`)
  - caption pop is automatic
- **Variety**: never use the same visual type in two scenes in a row; swap one for `phoneflow`, `phoneapp`, `compare` or `chart`.
- **Ending**: a callback twist that repeats the day-one failure line, then the `follow` CTA.
- **Numbers on screen, words in speech**: show ₹500 / 16 in the caption and put the spoken form in `say`.
- **Before rendering**: check stills for cropped zooms, wrapped labels and overlaps with captions.

## GATES (mandatory, added 2026-11-01 after credits/tokens were spent without approval)

If the user attached `briefs/REEL_BRIEF.md` (or a filled copy), its choices win. Either way:

- **Gate 1 - Plan, nothing written/spent.** Print in chat (NOT inside an AskUserQuestion dialog) the full script
  table: `# | scene | exact caption | say (if different) | component | add-ons`, the component plan, unverifiable
  facts / illustrative numbers. Then ONE question batch: voice engine (`eleven_flash_v2_5` / `eleven_v3` /
  free `kokoro`), CTA (comment keyword? follow card? both?), anything unclear. Ask the CTA even if the script
  already contains one. Wait for explicit "go".
- **Gate 2 - Free draft.** Write the job; if a draft was requested, copy it to `jobs/<id>-draft.json` with the
  `engine`/`model`/`voiceSettings` keys removed and `"voice": "am_michael", "lang": "a"` (Kokoro, free), build +
  render the draft, show tiled stills. No ElevenLabs call.
- **Gate 3 - Final voice.** Only after "go voice": state the char count, then `build_voiceover.py` once.
- **Gate 4 - Visual-only changes after final** -> `tts/build_voiceover_cached.py jobs/<id>.json` (aborts on any
  cache miss, so zero credits). Re-voice only when the user changes words/voice and approves.
- **Use the whole palette**: every reel should mix at least 6 component types incl. a `chart` when any number,
  money, loss or limit is mentioned, `sequence` when systems/agents pass work, `screenshot` with pans for real UI
  the user provided; `glitch` on failure lines; never the same type twice in a row; max 2 screenshots in a row.
  Illustrative chart data must say "(illustrative)" in the title.

## Steps

1. **Break down.** Split into sentences, then group into scenes by topic (hook, each point, recap/CTA): 8-12 for the default style, 3-7 for short scripts.
2. **Mark captions.** `*word*` highlights the key word of each sentence (1-2 per sentence).
   Add `word#tag` cues on the words where a visual element should appear.
3. **Choose a visual per scene** from the generic types (`src/explainer/scenes/generic/visuals.ts`):
   - `title` - hook / big statement: `kicker`, `headline`, optional `highlight`, `icon`, `sub{text,cue}`
   - `steps` - a process or list of 1-5 items, each `{label, sub?, icon?, cue}` ticking in on its cue
   - `phones` - 1-3 app screens `{title, cue, locked?}` + optional `note`
   - `compare` - before/after or A vs B: `left`/`right` `{kicker, title, items[1-4], cue}`
   - `trio` - 2-3 options compared on one dimension (e.g. Native / Web / Hybrid): optional `title`,
     `rows[{kicker, text (max 40 chars), icon, cue}]`, stacked full width, newest row glows
   - `journey` - 2-5 stops on a track (e.g. 5G -> 2G -> Dead zone -> Wi-Fi): optional `headline`/`highlight`,
     `stops[{name (max 12), sub? (max 14), icon, cue, tone? "good"|"bad"}]`, optional `note{text, cue}`
   - Other types exist too (stat, cards, chips, reason, terminal, editor, merge, follow, ...): see `visuals.ts`.
   - `layers` - **story reels where each step fixes the last problem** (best for "how X is built" scripts): one chat
     window stays on screen the whole scene (messages arrive on cues, `update` rewrites a bubble good/bad), a tracker of
     2-8 layers lights up on cues, and the area below swaps diagrams on cues (`big`, `flow`, `hub`, `code`, `bill`,
     `trace`, `badges`). Use ONE scene for the whole story so the chat never flickers. Schema: `scenes/generic/layers/schema.ts`,
     example job: `jobs/tagway-ai-layers.json`.
   - `punch` - **attention hook for scene 1**: `word` (max 10 chars) slams in huge with flash + screen shake +
     burst, then shrinks up while `headline` (+`highlight`) rises; optional `kicker`, `icon`, `sub{text,cue}`.
     Prefer it over `title` for the first scene.
   - `chart` - live line chart: `points[]` (4-80 values), `yMax`, `unit`, pen draws from `start` cue to `end` cue;
     drops >= `dropMin` flash `dropLabel` (default "GC"); optional `limit{value,label}` red dashed line, `note`.
     Great for memory / latency / cost over time.
   - `sequence` - system-design sequence diagram: `lanes[2-5]{name max 12, icon}`, `messages[1-8]{from, to (lane
     index), text max 32, cue, tone?}` flying lane to lane; optional `title`, `note`. Rows shrink to stay above captions.
   - **Camera (any visual)**: add `"camera": [{cue, zoom 1-2.5, x, y, dur?}]` to a visual to push in on a point
     (scene px, 1080 wide; content centre ~540,700) on a cue, pan, or pull back with `{cue, zoom: 1}`. Zoomed content
     is clipped above the captions. Use 1-2 moves per scene on the key moment, zoom 1.3-1.6.
   - `phoneflow` - 1-2 phones (`owner` max 18, `tone`) whose `screens[1-4]` swap on cues: `pay{to, amount}` (Pay button presses),
     `pin{title?, sub?}` (dark secure keypad, dots fill), `status{title, sub?, icon?, tone}` (big check/lock disc). A phone
     appearing later slides the first one aside. Optional `note{text, cue}`. Example: `jobs/upi-layers.json` scene `device`.
   - `phoneapp` - phone running a scrolling feed (`title`, `rows`, `speed`, `scroll` cue); `jank{cue, end?}` makes it
     stutter with a red frame-time meter and fps drop; `dialog{cue, title, body, buttons}` pops an ANR/crash box.
   - `diff` - code diff: `lines[{text, kind ctx|del|add, cue?}]` (max 12, ~44 chars wide); del strikes red, add grows green.
   - `quiz` - "guess first": `question`, `options[2-4]`, `answer` index, countdown `seconds` from `ask` cue, `reveal` cue.
   - **Transition (any visual)**: `"transition": "whip" | "zoom" | "slide"` (default `rise`). Use whip/zoom on 2-3
     key scene changes, not every scene.
   - **Glitch (any visual)**: `"glitch": [{cue, text?}]` - RGB-split jolt + red flash + alert sound on the cue; `text`
     (max 48) slides in as a stack-trace strip ("FATAL EXCEPTION: OutOfMemoryError"). Use on crash/failure moments.
   - Captions automatically pop highlighted words and colour any word containing a digit green.
   Demos: `jobs/components-demo.json` (punch, chart, camera, sequence) and `jobs/components-demo2.json` (quiz,
   phoneapp, glitch, transitions, diff), Kokoro voice -> `output/components-demo*.mp4`.
   Every visual needs `label` (header chip, max 24 chars). Every `cue` must exist as a `#tag` in that scene's captions.
   Icons must come from `ICON_NAMES` in `src/explainer/components/Icon.tsx`.
   If the content truly needs a new kind of visual, add a generic type (zod schema + scene component +
   `renderVisual` case) so future scripts can reuse it; tell the user.
4. **Job** `motion/jobs/<id>.json`: locked settings + `sentenceGap` 0.6, `sceneGap` 1.0 (user default: 1 s between scenes, never 2 s), `tail` 2.3,
   `copy: {}`, `scenes[{id, visual, sentences[{caption, say?}]}]`.
5. **Register** in `motion/src/explainer/scriptReels.tsx`:
   `import <x> from "./data/<id>.json";` and add `scriptReel("<CompositionId>", <x> as Timeline)` to `SCRIPT_REELS`.
   (The data JSON must exist first: run step 6 before typechecking.)
6. **Narration** (from `motion/`): `PYTHONIOENCODING=utf-8 .venv/Scripts/python tts/build_voiceover.py jobs/<id>.json`.
   Costs ElevenLabs credits (~1/char); cached in `.cache/tts`. All sentences should print `aligned`;
   fix any `estimated` one by making caption words match the spoken words.
6b. **Background music (optional, when the user asks)**: **reuse an existing track from `public/music/`.
   Never generate new music unless the user explicitly asks for new music** (each generation costs ElevenLabs credits).
   Rotate these (same upbeat 120 BPM tech style; the track loops if the reel is longer, fades out if shorter).
   Gains below are for a flash-voice reel (~-18.4 LUFS voice); for an `eleven_v3` voice (~-15.5 LUFS) multiply both by 1.45:

   | Track | Length | Loudness | Mood | duck / open |
   |---|---|---|---|---|
   | `music/tech-pulse-48s.mp3` | 49s | -12.0 LUFS | energetic | 0.11 / 0.24 (defaults) |
   | `music/tech-pulse-part2-74s.mp3` | 74s | -15.2 LUFS | curious, mid lift | 0.155 / 0.34 |
   | `music/tech-pulse-part3-53s.mp3` | 53s | -13.0 LUFS | playful, futuristic | 0.123 / 0.27 |
   | `music/tech-pulse-part4-56s.mp3` | 56s | -13.2 LUFS | focused, darker | 0.125 / 0.27 |
   | `music/tech-pulse-part5-57s.mp3` | 57s | -13.6 LUFS | triumphant finish | 0.13 / 0.28 |

   Prefer a track at least as long as the voice (avoids an audible loop seam). Register with
   `scriptReel("<Id>", <x> as Timeline, { src: "music/<name>.mp3", duck, open })`; it ducks under the voice automatically
   (`components/BackgroundMusic.tsx`). Only if the user asks for new music: `tts/make_music.py <name> <seconds> "<prompt>"`
   (cached, then measure its LUFS and add it to this table). After render, check `ebur128` (aim ~-19 LUFS flash /
   ~-16 LUFS v3, peak < -1 dB) and transcribe the mix with whisper to confirm the voice is clear.
7. **Render**: `npx tsc --noEmit -p .`, then
   `.venv/Scripts/python tts/make_reel.py jobs/<id>.json <CompositionId> ../output` (background).
8. **Verify**: ffprobe (1080x1920, h264+aac), full decode, `volumedetect`, and 4-6 stills
   (`npx remotion still src/index.ts <CompositionId> <tmp>/fN.png --frame=N`) tiled and viewed: check no
   overlaps between visuals and captions and that each visual appears with its words.
9. **Report**: output path, duration, aligned count, credits used, scene/visual list, assumptions.
