# Reel brief (attach this, fill the blanks, paste script at the bottom)

Run `/reel-from-script` with this brief. Follow the GATES exactly. Do not skip ahead.

## My choices (fill or leave "ask me")

| Field | Value |
|---|---|
| Reel id (file name) | ask me |
| Language | English |
| Voice engine | ask me — options: `elevenlabs eleven_flash_v2_5` (cheap) / `elevenlabs eleven_v3` (expressive, more credits) / `kokoro` (free, offline) |
| Preview with free voice first? | yes — render a Kokoro draft for visuals, ElevenLabs only after I approve |
| CTA | ask me — keyword to comment? Follow card? both? |
| Background music | no / reuse existing track from `public/music/` (never generate new) |
| Target length | 45-75 s |
| Screenshots / assets | none / in `reference/` (read every image, zoom so text is legible) |
| Script edits allowed | only typos, numbers→spoken words in `say`, splitting sentences. Suggest anything else, don't apply |

## GATES (hard stops — wait for my reply at each)

**Gate 1 — Plan (no files written, no TTS, no render)**
Show me in chat (not inside a question dialog):
1. Full script table: `# · scene · exact caption · spoken say (if different) · visual component · add-ons (glitch/camera/transition)`.
2. Component plan using the WHOLE palette, picked by content:
   `punch` hook · `chart` for any money/metric/loss/limit · `sequence` for agents/systems talking ·
   `screenshot` (zoom + pans + highlights) for real UI · `phoneflow` / `phoneapp` for app screens ·
   `compare` for A vs B · `quiz` mid-reel (needs a line from me) · `stat` for a big number ·
   `diff` / `terminal` / `editor` for code · `journey` / `steps` / `trio` for lists ·
   `comment` / `follow` for CTA · `glitch` on every failure line · `camera` on the key word.
   Never the same component twice in a row; max 2 screenshots in a row.
3. Facts you could not verify, numbers that would be illustrative (label them on screen).
4. Questions: voice engine, CTA, anything unclear — ONE batch.

**Gate 2 — Draft (free)**
After my "go plan": write job, render with free Kokoro (or cached audio), send me 6-10 tiled stills + the draft path.
No ElevenLabs call yet.

**Gate 3 — Final voice (credits)**
Only after my "go voice": ElevenLabs once, with the model I chose. Tell me char count first.

**Gate 4 — Changes after final**
Visual-only changes → `tts/build_voiceover_cached.py` (refuses to spend credits). Re-voice only if I change words/voice and say so.

## Token savers
- Don't re-read files already read this session; don't print big JSON.
- Stills: one tiled image per check, not one by one.
- Report at the end: path, duration, credits used, scene list, assumptions. Short.

---

## Script

<paste script here — plain text or the CSV table (Timestamp, Visual cue, On-screen text, Voiceover)>
