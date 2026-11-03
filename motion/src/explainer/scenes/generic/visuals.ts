import { z } from "zod";
import { ICON_NAMES } from "../../components/Icon";
import { LayersVisual } from "./layers/schema";

/**
 * Scene visuals declared in the job JSON (`scenes[].visual`). Each one names the
 * cue tags (`word#tag` in captions) it animates on. Validated before render so a
 * typo in a job fails with a readable message instead of a broken frame.
 */
const icon = z.enum(ICON_NAMES);
const label = z.string().min(1).max(24);

export const TitleVisual = z.object({
  type: z.literal("title"),
  label,
  kicker: z.string().min(1),
  headline: z.string().min(1),
  highlight: z.string().optional(),
  icon: icon.optional(),
  sub: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

export const PhonesVisual = z.object({
  type: z.literal("phones"),
  label,
  title: z.string().optional(),
  phones: z
    .array(z.object({ title: z.string().min(1), cue: z.string(), locked: z.boolean().optional() }))
    .min(1)
    .max(3),
  note: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

export const StepsVisual = z.object({
  type: z.literal("steps"),
  label,
  title: z.string().optional(),
  steps: z
    .array(z.object({ label: z.string().min(1), sub: z.string().optional(), icon: icon.optional(), cue: z.string() }))
    .min(1)
    .max(5),
});

const CompareSide = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1).max(4),
  cue: z.string(),
});

export const CompareVisual = z.object({
  type: z.literal("compare"),
  label,
  left: CompareSide,
  right: CompareSide,
});

/** Big number counting (from `from`, default 0) to `value` on its cue, with a burst. */
export const StatVisual = z.object({
  type: z.literal("stat"),
  label,
  kicker: z.string().min(1),
  value: z.number().int().nonnegative(),
  from: z.number().int().nonnegative().default(0),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  caption: z.string().min(1),
  icon: icon.optional(),
  cue: z.string(),
});

/** 2-4 icon cards in a grid, each flipping in on its cue. */
export const CardsVisual = z.object({
  type: z.literal("cards"),
  label,
  title: z.string().optional(),
  cards: z
    .array(z.object({ title: z.string().min(1), sub: z.string().optional(), icon, cue: z.string() }))
    .min(2)
    .max(4),
});

/** 2-3 option rows (e.g. Native / Web / Hybrid) stacked full width, each sliding in on its cue. */
export const TrioVisual = z.object({
  type: z.literal("trio"),
  label,
  title: z.string().optional(),
  rows: z
    .array(
      z.object({
        kicker: z.string().min(1),
        text: z.string().min(1).max(40),
        icon,
        cue: z.string(),
        tone: z.enum(["good", "bad"]).optional(),
      }),
    )
    .min(2)
    .max(3),
});

/** 2-5 stops on a track (e.g. 5G -> 2G -> Dead zone -> Wi-Fi), each lighting up on its cue; `bad` stops glow red. */
export const JourneyVisual = z.object({
  type: z.literal("journey"),
  label,
  headline: z.string().optional(),
  highlight: z.string().optional(),
  stops: z
    .array(
      z.object({
        name: z.string().min(1).max(12),
        sub: z.string().max(14).optional(),
        icon,
        cue: z.string(),
        tone: z.enum(["good", "bad"]).optional(),
      }),
    )
    .min(2)
    .max(5),
  note: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** Hub card with chips flying in around it on their cues. */
export const ChipsVisual = z.object({
  type: z.literal("chips"),
  label,
  hub: z.object({ text: z.string().min(1), sub: z.string().optional(), icon: icon.optional() }),
  chips: z.array(z.object({ text: z.string().min(1), cue: z.string() })).min(3).max(8),
});

/** Numbered reason: giant number, headline, optional points on cues. */
export const ReasonVisual = z.object({
  type: z.literal("reason"),
  label,
  number: z.number().int().min(1).max(9),
  title: z.string().min(1),
  highlight: z.string().optional(),
  icon,
  points: z.array(z.object({ text: z.string().min(1), cue: z.string() })).max(3).optional(),
});

/** Call to action: a comment box types the keyword and sends it. */
export const CommentVisual = z.object({
  type: z.literal("comment"),
  label,
  headline: z.string().min(1),
  highlight: z.string().optional(),
  keyword: z.string().min(1),
  cue: z.string(),
  sub: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** Price list: rows slide in on cues, price tags stamp on, running total ticks up from startTotal. */
export const ReceiptVisual = z.object({
  type: z.literal("receipt"),
  label,
  title: z.string().optional(),
  currency: z.string().default("$"),
  startTotal: z.number().nonnegative().default(0),
  rows: z
    .array(
      z.object({ name: z.string().min(1), role: z.string().optional(), price: z.number().nonnegative(), icon: icon.optional(), cue: z.string() }),
    )
    .min(1)
    .max(5),
});

const AppTile = z.object({ title: z.string().min(1), sub: z.string().optional(), icon, dark: z.boolean().optional() });

/** Two app tiles slide in from the sides and join; a stamp slams onto them on its cue. */
export const PairVisual = z.object({
  type: z.literal("pair"),
  label,
  left: AppTile,
  right: AppTile,
  stamp: z.object({ text: z.string().min(1), cue: z.string() }),
});

const lineTone = z.enum(["normal", "dim", "good", "bad"]);

/**
 * Terminal: the command types on `cue` (or at once), output lines print after it.
 * A line's `flag` cue paints it red; its `drop` cue squashes it out. `badge` bounces in on its cue.
 */
export const TerminalVisual = z.object({
  type: z.literal("terminal"),
  label,
  title: z.string().optional(),
  command: z.string().min(1),
  cue: z.string().optional(),
  lines: z
    .array(z.object({ text: z.string(), tone: lineTone.optional(), flag: z.string().optional(), drop: z.string().optional() }))
    .min(1)
    .max(10),
  badge: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/**
 * Code editor card: lines without a cue are there from the start, lines with a cue type in on it
 * (several lines may share a cue and type one after another). `hl` lines get a green glow.
 * `strike` crosses the whole file out; `toast` pops a confirmation; `note` lands a pill below.
 */
export const EditorVisual = z.object({
  type: z.literal("editor"),
  label,
  file: z.string().min(1),
  lines: z.array(z.object({ text: z.string(), cue: z.string().optional(), hl: z.boolean().optional() })).min(1).max(10),
  strike: z.object({ cue: z.string() }).optional(),
  toast: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
  note: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** Segmented tabs: the active pill slides to each tab on its cue and swaps the value card + tree below. */
export const TabsVisual = z.object({
  type: z.literal("tabs"),
  label,
  title: z.string().optional(),
  tabs: z
    .array(z.object({ name: z.string().min(1), value: z.string().min(1), cue: z.string(), tree: z.array(z.string()).max(5).optional() }))
    .min(2)
    .max(3),
});

const Box = z.object({ x: z.number(), y: z.number(), w: z.number().positive(), h: z.number().positive() });

/**
 * Screenshot from `public/`: shown whole, zooms into `focus` on its cue, highlight boxes draw on
 * around regions (image-pixel coordinates) on their cues.
 */
export const ScreenshotVisual = z.object({
  type: z.literal("screenshot"),
  label,
  title: z.string().optional(),
  src: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  focus: Box.extend({ cue: z.string() }).optional(),
  /** Camera path: after `focus` (if any), glide to each region on its cue so long text stays legible. */
  pans: z.array(Box.extend({ cue: z.string() })).max(6).default([]),
  /** Frame height in px (default 620); raise it for tall screenshots (max 740 keeps it above captions). */
  viewH: z.number().min(400).max(740).optional(),
  highlights: z.array(Box.extend({ cue: z.string(), label: z.string().optional() })).max(4).default([]),
});

/** Items pop in as orbs on their cues, then collapse into one switch that clicks on (result cue). */
export const MergeVisual = z.object({
  type: z.literal("merge"),
  label,
  headline: z.string().min(1),
  highlight: z.string().optional(),
  items: z.array(z.object({ text: z.string().min(1), icon, cue: z.string() })).min(2).max(4),
  result: z.object({ text: z.string().min(1), sub: z.string().optional(), cue: z.string() }),
});

/**
 * Follow / download CTA: profile card with the brand logo; a cursor taps the button on its cue and it
 * flips from `action` to `done` (defaults Follow -> Following).
 */
export const FollowVisual = z.object({
  type: z.literal("follow"),
  label,
  headline: z.string().min(1),
  highlight: z.string().optional(),
  name: z.string().min(1),
  tagline: z.string().optional(),
  action: z.string().min(1).default("Follow"),
  done: z.string().min(1).default("Following"),
  actionIcon: icon.default("plus"),
  mono: z.boolean().optional(),
  cue: z.string(),
  sub: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
  /** Browser address bar under the button that types `text` on its cue (e.g. the repo link). */
  url: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** Hook: one huge word slams in (flash + screen shake), then shrinks up while the headline rises. */
export const PunchVisual = z.object({
  type: z.literal("punch"),
  label,
  word: z.string().min(1).max(10),
  headline: z.string().min(1),
  highlight: z.string().optional(),
  kicker: z.string().optional(),
  icon: icon.optional(),
  sub: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** Live line chart drawn between `start` and `end` cues; drops of at least `dropMin` flash `dropLabel`. */
export const ChartVisual = z.object({
  type: z.literal("chart"),
  label,
  title: z.string().optional(),
  points: z.array(z.number().nonnegative()).min(4).max(80),
  yMax: z.number().positive(),
  unit: z.string().default(""),
  decimals: z.number().int().min(0).max(2).default(0),
  start: z.string().optional(),
  end: z.string(),
  dropLabel: z.string().min(1).default("GC"),
  dropMin: z.number().positive().optional(),
  limit: z.object({ value: z.number().positive(), label: z.string().min(1) }).optional(),
  note: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** Sequence diagram: 2-5 lanes, up to 8 messages flying lane to lane on their cues. */
export const SequenceVisual = z
  .object({
    type: z.literal("sequence"),
    label,
    title: z.string().optional(),
    lanes: z.array(z.object({ name: z.string().min(1).max(12), icon })).min(2).max(5),
    messages: z
      .array(
        z.object({
          from: z.number().int().min(0),
          to: z.number().int().min(0),
          text: z.string().min(1).max(32),
          cue: z.string(),
          tone: z.enum(["good", "bad"]).optional(),
        }),
      )
      .min(1)
      .max(8),
    note: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
  });

/** Code diff: `del` lines strike red on their cue, `add` lines grow in green and type; `ctx` lines stay. */
export const DiffVisual = z.object({
  type: z.literal("diff"),
  label,
  file: z.string().min(1),
  lines: z
    .array(z.object({ text: z.string(), kind: z.enum(["ctx", "del", "add"]).default("ctx"), cue: z.string().optional() }))
    .min(1)
    .max(12),
  note: z.object({ text: z.string().min(1), cue: z.string() }).optional(),
});

/** "Guess first" quiz: question + 2-4 options, a countdown ring from `ask`, the answer lights up on `reveal`. */
export const QuizVisual = z.object({
  type: z.literal("quiz"),
  label,
  question: z.string().min(1),
  highlight: z.string().optional(),
  options: z.array(z.string().min(1).max(30)).min(2).max(4),
  answer: z.number().int().min(0).max(3),
  seconds: z.number().int().min(1).max(5).default(3),
  ask: z.string(),
  reveal: z.string(),
});

/** Phone running a scrolling feed; `jank` makes it stutter (frame meter spikes), `dialog` pops an ANR/crash box. */
export const PhoneAppVisual = z.object({
  type: z.literal("phoneapp"),
  label,
  title: z.string().min(1).max(20),
  rows: z.number().int().min(4).max(30).default(12),
  speed: z.number().positive().default(480),
  scroll: z.string().optional(),
  jank: z.object({ cue: z.string(), end: z.string().optional() }).optional(),
  dialog: z
    .object({ cue: z.string(), title: z.string().min(1), body: z.string().min(1), buttons: z.array(z.string().min(1)).min(1).max(2) })
    .optional(),
  meter: z.boolean().default(true),
});

/** 1-2 phones whose screens swap on cues (pay -> PIN pad -> paid / blocked). */
export const PhoneFlowScreen = z.object({
  cue: z.string(),
  kind: z.enum(["pay", "pin", "status"]),
  to: z.string().min(1).max(18).optional(),
  amount: z.string().min(1).max(9).optional(),
  button: z.string().min(1).max(20).optional(),
  press: z.boolean().optional(),
  title: z.string().min(1).max(22).optional(),
  sub: z.string().min(1).max(40).optional(),
  icon: icon.optional(),
  tone: z.enum(["good", "bad"]).optional(),
});

export const PhoneFlowVisual = z.object({
  type: z.literal("phoneflow"),
  label,
  phones: z
    .array(z.object({ owner: z.string().min(1).max(18), tone: z.enum(["good", "bad"]).optional(), screens: z.array(PhoneFlowScreen).min(1).max(4) }))
    .min(1)
    .max(2),
  note: z.object({ text: z.string().min(1).max(36), cue: z.string() }).optional(),
});

export const Visual = z.discriminatedUnion("type", [
  PhoneFlowVisual,
  DiffVisual,
  QuizVisual,
  PhoneAppVisual,
  PunchVisual,
  ChartVisual,
  SequenceVisual,
  LayersVisual,
  PairVisual,
  TerminalVisual,
  EditorVisual,
  TabsVisual,
  ScreenshotVisual,
  MergeVisual,
  FollowVisual,
  ReceiptVisual,
  TitleVisual,
  PhonesVisual,
  StepsVisual,
  CompareVisual,
  StatVisual,
  CardsVisual,
  TrioVisual,
  JourneyVisual,
  ChipsVisual,
  ReasonVisual,
  CommentVisual,
]);

export type PairVisualT = z.infer<typeof PairVisual>;
export type TerminalVisualT = z.infer<typeof TerminalVisual>;
export type EditorVisualT = z.infer<typeof EditorVisual>;
export type TabsVisualT = z.infer<typeof TabsVisual>;
export type ScreenshotVisualT = z.infer<typeof ScreenshotVisual>;
export type MergeVisualT = z.infer<typeof MergeVisual>;
export type FollowVisualT = z.infer<typeof FollowVisual>;
export type ReceiptVisualT = z.infer<typeof ReceiptVisual>;
export type StatVisualT = z.infer<typeof StatVisual>;
export type CardsVisualT = z.infer<typeof CardsVisual>;
export type TrioVisualT = z.infer<typeof TrioVisual>;
export type JourneyVisualT = z.infer<typeof JourneyVisual>;
export type ChipsVisualT = z.infer<typeof ChipsVisual>;
export type ReasonVisualT = z.infer<typeof ReasonVisual>;
export type CommentVisualT = z.infer<typeof CommentVisual>;

export type TitleVisualT = z.infer<typeof TitleVisual>;
export type PhonesVisualT = z.infer<typeof PhonesVisual>;
export type StepsVisualT = z.infer<typeof StepsVisual>;
export type CompareVisualT = z.infer<typeof CompareVisual>;
export type PunchVisualT = z.infer<typeof PunchVisual>;
export type ChartVisualT = z.infer<typeof ChartVisual>;
export type SequenceVisualT = z.infer<typeof SequenceVisual>;
export type DiffVisualT = z.infer<typeof DiffVisual>;
export type QuizVisualT = z.infer<typeof QuizVisual>;
export type PhoneAppVisualT = z.infer<typeof PhoneAppVisual>;
export type VisualT = z.infer<typeof Visual>;

export const parseVisual = (sceneId: string, raw: unknown): VisualT => {
  const result = Visual.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".") || "visual"}: ${i.message}`).join("; ");
    throw new Error(`scene "${sceneId}" has an invalid visual: ${issues}`);
  }
  return result.data;
};
export type PhoneFlowVisualT = z.infer<typeof PhoneFlowVisual>;
export type PhoneFlowScreenT = z.infer<typeof PhoneFlowScreen>;
