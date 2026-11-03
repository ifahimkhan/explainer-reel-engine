import React from "react";
import { Audio, staticFile, useVideoConfig } from "remotion";
import type { Timeline } from "../timeline";

export interface MusicConfig {
  /** File under public/, e.g. "music/tech-pulse.mp3". */
  src: string;
  /** Gain while the voice speaks (default 0.11, about 19 dB down: a -12 LUFS track sits well under the voice). */
  duck?: number;
  /** Gain in pauses, intro and outro (default 0.24). */
  open?: number;
  /** Speed (default 1). Slightly below 1 stretches a track that is a few seconds short so its ending lands at the end. */
  playbackRate?: number;
}

const RAMP_S = 0.35;
const FADE_IN_S = 0.4;
const FADE_OUT_S = 1.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 1 while a sentence is spoken, easing to 0 within RAMP_S of its edges. */
const speechAmount = (t: number, timeline: Timeline): number => {
  let amount = 0;
  for (const scene of timeline.scenes) {
    for (const s of scene.sentences) {
      const dist = t < s.start ? s.start - t : t > s.end ? t - s.end : 0;
      amount = Math.max(amount, clamp01(1 - dist / RAMP_S));
      if (amount === 1) return 1;
    }
  }
  return amount;
};

/** Looping background track that ducks under the narration and fades in/out at the edges. */
export const BackgroundMusic: React.FC<{ music: MusicConfig; timeline: Timeline }> = ({ music, timeline }) => {
  const { fps } = useVideoConfig();
  const duck = music.duck ?? 0.11;
  const open = music.open ?? 0.24;
  const end = timeline.durationS;

  const volume = (frame: number): number => {
    const t = frame / fps;
    const level = open - (open - duck) * speechAmount(t, timeline);
    const edge = Math.min(clamp01(t / FADE_IN_S), clamp01((end - t) / FADE_OUT_S));
    return level * edge;
  };

  return <Audio src={staticFile(music.src)} volume={volume} playbackRate={music.playbackRate ?? 1} loop />;
};
