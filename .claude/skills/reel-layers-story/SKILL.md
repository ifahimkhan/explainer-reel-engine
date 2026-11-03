---
name: reel-layers-story
description: Build a "layers story" reel (like tagway-ai-layers) - a problem -> fix chain told inside one persistent chat window with a lighting-up layer tracker and step-by-step diagrams, ending on a callback twist. Use when the user says "layers reel", "layers style", "like the Tagway AI video", or gives a topic/reference and asks for that style.
---

# Layers-story reel (Fahim Khan)

Reference build: `motion/jobs/tagway-ai-layers.json` -> `output/tagway-ai-layers.mp4`.
Visual: generic `layers` type (`motion/src/explainer/scenes/generic/layers/`). Pipeline steps 5-9 are the
same as `.claude/skills/reel-from-script/SKILL.md`.

## Input the user may give

- A topic ("how Netflix streams video"), a script, or a reference video/SRT in `reference/`.
- Optional: company/product name to use, layer count, target length, voice.

## Step 1 - Write the script (the style)

Story = one product being built over time. Every beat: **problem shown -> one fix -> result shown**.
1. Hook: "Every <thing> is built in <N> layers. And every layer fixes a problem."
2. Day one: the naive version + the first failure, as a quoted user question and a quoted wrong answer.
3. For each layer: "Then <someone> <does X>." -> what went wrong (concrete, quoted) -> "So you add <fix>." ->
   one-line plain-English analogy if the term is jargon -> the fixed result, quoted ("Request blocked.").
4. Numbers only as clearly-labelled examples (bill, latency); never invent real-company facts.
5. Twist: "After months of work, it's <A>, <B>, <C>. Then one day someone <shortcut>." -> the **exact** day-one
   failure line again (callback).
6. CTA: "Follow for more tips like this." (or a keyword the user picks).
Short sentences, spoken English, 5-8 layers, ~350-430 words (v3 runs ~2.4 words/s + gaps).

## Step 2 - Confirm with the user BEFORE any credits

Show: full script, layer list, and voice. Voice options: `eleven_v3` (used for this style, more expressive) or
`eleven_flash_v2_5` (locked default, cheaper), both clone `ruZOzaKd6ljzH7J9ejYE`. Wait for an explicit "go".

## Step 3 - Map script to the `layers` visual (one scene + a `follow` CTA scene)

- `layers[]`: one chip per fix (name max 16 chars), cue on the word where the fix is named.
- `chat[]`: every quoted question/answer becomes a message with a cue; a failure that a later layer fixes is ONE
  ai message with `tone: "bad"` + `update { tone: "good", cue }` on the fix result. Tags explain the state
  ("made up", "via MCP tools", "cache hit · $0").
- `diagrams[]` (swap on cue, one per beat): `big` red word for each named problem ("hallucination"),
  `flow` for pipelines (max 5 nodes, text max 14), `hub` for one thing connecting to tools, `code` for a
  prompt/config, `bill` for cost drops, `trace` for logs/evals, `badges` + `swap` + `fade` for the twist.
- `warn[]`: tracker chip that breaks in the twist.
- Validate every cue exists in captions before TTS (see the validate step in the reference session:
  parseVisual + cue/tag cross-check via `npx tsx`).

## Step 4 - Build, check, report

Narration -> register in `scriptReels.tsx` -> tsc -> stills every ~10 s (check chat bubbles, notes and bill
never overlap captions) -> render -> ffprobe/decode/ebur128 (v3 ~-16 LUFS, flash ~-19) -> report path,
duration, aligned count, credits.
