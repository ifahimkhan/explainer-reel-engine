import { createContext, useContext } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/** Shapes written by tts/build_voiceover.py. All times are seconds. */
export interface Word {
  text: string;
  tail: string;
  hl: boolean;
  /** Cue tag from the job caption (`word#tag`). */
  cue?: string;
  start: number;
  end: number;
}

export interface Chunk {
  start: number;
  end: number;
  words: readonly Word[];
}

export interface Sentence {
  start: number;
  end: number;
  chunks: readonly Chunk[];
}

export interface SceneTiming {
  id: string;
  start: number;
  end: number;
  sentences: readonly Sentence[];
  /** Job-declared visual spec (validated by scenes/generic/visuals.ts). */
  visual?: unknown;
}

/** Source-pixel box of the recording shown in the split-screen video panel. */
export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Camera track written by tts/build_from_recording.py. */
export interface VideoMeta {
  src: string;
  width: number;
  height: number;
  crop?: CropBox;
}

export interface Timeline {
  id: string;
  durationS: number;
  /** On-screen text keyed by "scene.slot". */
  copy: Readonly<Record<string, string>>;
  video?: VideoMeta;
  scenes: readonly SceneTiming[];
}

const sceneWords = (scene: SceneTiming): Word[] =>
  scene.sentences.flatMap((s) => s.chunks.flatMap((c) => c.words));

/** Local start time (s) of the word tagged `#tag`. Throws so a missing cue fails the render. */
export const cueOf = (scene: SceneTiming, tag: string): number => {
  const hit = sceneWords(scene).find((w) => w.cue === tag);
  if (!hit) throw new Error(`cue "#${tag}" not found in scene "${scene.id}"`);
  return hit.start - scene.start;
};

export const CopyContext = createContext<Readonly<Record<string, string>>>({});

/** Lookup for on-screen text; throws on a missing key so untranslated slots fail loudly. */
export const useCopy = (): ((key: string) => string) => {
  const copy = useContext(CopyContext);
  return (key) => {
    const value = copy[key];
    if (value === undefined) throw new Error(`copy "${key}" missing from job`);
    return value;
  };
};

export interface SceneClock {
  /** Local time in seconds. */
  t: number;
  fps: number;
  cue: (tag: string) => number;
  /** Seconds → frames. */
  f: (s: number) => number;
  /** Local start of sentence i. */
  sentence: (i: number) => number;
}

export const useSceneClock = (scene: SceneTiming): SceneClock => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return {
    t: frame / fps,
    fps,
    cue: (tag) => cueOf(scene, tag),
    f: (s) => Math.round(s * fps),
    sentence: (i) => {
      const s = scene.sentences[i];
      if (!s) throw new Error(`sentence ${i} missing in scene "${scene.id}"`);
      return s.start - scene.start;
    },
  };
};
