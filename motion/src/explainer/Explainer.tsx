import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BackgroundMusic, MusicConfig } from "./components/BackgroundMusic";
import { Background, Header, HeaderStep } from "./components/Chrome";
import { KaraokeCaptions } from "./components/KaraokeCaptions";
import { range } from "./motion";
import { CopyContext, SceneTiming, Timeline } from "./timeline";

const FADE_S = 0.25;

export type SceneRenderer = (scene: SceneTiming) => React.ReactNode;

export interface ExplainerConfig {
  id: string;
  brand: string;
  voiceSrc: string;
  timeline: Timeline;
  /** Header counter label per scene id. */
  labels: Readonly<Record<string, string>>;
  scenes: Readonly<Record<string, SceneRenderer>>;
  /** Optional background track, ducked under the voice. */
  music?: MusicConfig;
}

/** Fades a scene in at its start and out at its end. */
const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const end = durationInFrames / fps;
  const opacity = Math.min(range(t, [0, FADE_S], [0, 1]), range(t, [end - FADE_S, end], [1, 0]));
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const Explainer: React.FC<{ config: ExplainerConfig }> = ({ config }) => {
  const { fps } = useVideoConfig();
  const { timeline } = config;
  const steps: HeaderStep[] = timeline.scenes.map((s) => ({ label: config.labels[s.id] ?? s.id.toUpperCase(), start: s.start }));

  return (
    <CopyContext.Provider value={timeline.copy}>
    <AbsoluteFill>
      <Background />
      {timeline.scenes.map((scene, i) => {
        const render = config.scenes[scene.id];
        if (!render) throw new Error(`no renderer for scene "${scene.id}"`);
        const from = Math.round(scene.start * fps);
        const next = timeline.scenes[i + 1];
        const to = Math.round((next ? next.start : timeline.durationS) * fps);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={to - from} name={`scene:${scene.id}`}>
            <SceneFade>{render(scene)}</SceneFade>
          </Sequence>
        );
      })}
      <Header brand={config.brand} steps={steps} />
      <KaraokeCaptions timeline={timeline} />
      <Audio src={staticFile(config.voiceSrc)} />
      {config.music ? <BackgroundMusic music={config.music} timeline={timeline} /> : null}
    </AbsoluteFill>
    </CopyContext.Provider>
  );
};
