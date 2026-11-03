import { z } from "zod";
import { ICON_NAMES } from "../../../components/Icon";

/**
 * "layers" visual: one chat window that stays on screen for the whole scene, a tracker of
 * layers that light up on cues, and a diagram area below that swaps diagrams on cues.
 */
const icon = z.enum(ICON_NAMES);
const tone = z.enum(["good", "bad"]);
const Note = z.object({ text: z.string().min(1), cue: z.string(), tone: tone.optional() });

const BubbleState = z.object({
  text: z.string().min(1),
  tone: tone.optional(),
  tag: z.string().optional(),
});

/** A chat message; `cue` makes it arrive (history otherwise), `update` rewrites it in place. */
export const ChatMessage = BubbleState.extend({
  from: z.enum(["user", "ai"]),
  cue: z.string().optional(),
  update: BubbleState.extend({ cue: z.string() }).optional(),
});

const Node = z.object({
  text: z.string().min(1).max(14),
  sub: z.string().max(16).optional(),
  icon: icon.optional(),
  cue: z.string().optional(),
  tone: tone.optional(),
});

const BigDiagram = z.object({
  kind: z.literal("big"),
  text: z.string().min(1),
  highlight: z.string().optional(),
  sub: z.string().optional(),
  tone: tone.optional(),
});

/** Boxes in a row joined by arrows, each popping in on its cue. */
const FlowDiagram = z.object({
  kind: z.literal("flow"),
  title: z.string().optional(),
  nodes: z.array(Node).min(1).max(5),
  note: Note.optional(),
});

/** Centre box with spokes to tools below. */
const HubDiagram = z.object({
  kind: z.literal("hub"),
  center: Node,
  spokes: z.array(Node).min(1).max(4),
  note: Note.optional(),
});

/** Monospace box that types its text. */
const CodeDiagram = z.object({
  kind: z.literal("code"),
  text: z.string().min(1),
  note: Note.optional(),
});

/** "hi" bubbles fill a grid, then a bill counter drops step by step; chips mark each fix. */
const BillDiagram = z.object({
  kind: z.literal("bill"),
  bubbles: z.object({
    count: z.number().int().min(1).max(40),
    cue: z.string(),
    text: z.string().min(1).default("hi"),
    /** Label a bubble flips to when the first step lands. */
    flip: z.string().min(1).default("cached"),
    /** The last `keep` bubbles never flip (e.g. the images still on screen). */
    keep: z.number().int().nonnegative().default(0),
  }),
  kicker: z.string().min(1),
  prefix: z.string().default("$"),
  suffix: z.string().default(""),
  start: z.object({ value: z.number().nonnegative(), cue: z.string() }),
  steps: z.array(z.object({ value: z.number().nonnegative(), cue: z.string(), chip: z.string().min(1) })).max(3),
});

/** Trace waterfall bars, then an evals row ticking up to passed/total. */
const TraceDiagram = z.object({
  kind: z.literal("trace"),
  bars: z
    .array(z.object({ text: z.string().min(1), from: z.number().min(0).max(1), to: z.number().min(0).max(1), cue: z.string() }))
    .min(1)
    .max(5),
  evals: z.object({ passed: z.number().int().nonnegative(), total: z.number().int().positive(), cue: z.string() }).optional(),
});

/** Status chips light up; a model swap and a warning note land after. */
const BadgesDiagram = z.object({
  kind: z.literal("badges"),
  chips: z.array(z.object({ text: z.string().min(1), cue: z.string() })).min(1).max(5),
  swap: z.object({ from: z.string().min(1), to: z.string().min(1), cue: z.string() }).optional(),
  fade: z.object({ cue: z.string() }).optional(),
  note: Note.optional(),
});

export const Diagram = z.discriminatedUnion("kind", [
  BigDiagram,
  FlowDiagram,
  HubDiagram,
  CodeDiagram,
  BillDiagram,
  TraceDiagram,
  BadgesDiagram,
]);

/** Each diagram replaces the previous one on its cue (the first may omit it: shown from the start). */
const TimedDiagram = z.intersection(Diagram, z.object({ cue: z.string().optional() }));

export const LayersVisual = z.object({
  type: z.literal("layers"),
  label: z.string().min(1).max(24),
  app: z.string().min(1),
  status: z.string().optional(),
  layers: z.array(z.object({ name: z.string().min(1).max(16), cue: z.string() })).min(2).max(8),
  warn: z.array(z.object({ index: z.number().int().min(0), cue: z.string() })).default([]),
  chat: z.array(ChatMessage).min(1),
  diagrams: z.array(TimedDiagram).min(1),
});

export type LayersVisualT = z.infer<typeof LayersVisual>;
export type ChatMessageT = z.infer<typeof ChatMessage>;
export type DiagramT = z.infer<typeof Diagram>;
export type NoteT = z.infer<typeof Note>;
export type NodeT = z.infer<typeof Node>;
