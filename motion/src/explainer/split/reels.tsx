import React from "react";
import splitStitchTimeline from "../data/split-stitch.json";
import type { Timeline } from "../timeline";
import { SplitConfig, SplitExplainer } from "./SplitExplainer";

const BRAND = "Fahim Khan";

interface SplitReel {
  config: SplitConfig;
  component: React.FC;
}

const splitReel = (id: string, timeline: Timeline): SplitReel => {
  const config: SplitConfig = { id, brand: BRAND, timeline };
  return { config, component: () => <SplitExplainer config={config} /> };
};

/** Split-screen reels built from recordings (tts/build_from_recording.py). Add one entry per recording. */
export const SPLIT_REELS: readonly SplitReel[] = [splitReel("SplitStitch", splitStitchTimeline as Timeline)];
