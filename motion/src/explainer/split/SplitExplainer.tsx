import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Header, HeaderStep } from "../components/Chrome";
import { KaraokeCaptions } from "../components/KaraokeCaptions";
import { range } from "../motion";
import { renderVisual, visualLabel } from "../scenes/generic/renderVisual";
import { CopyContext, Timeline } from "../timeline";
import { GFX_H, SPLIT_CAPTION_TOP, VIDEO_H, VIDEO_TOP } from "./layout";
import { VideoPanel } from "./VideoPanel";

const FADE_S = 0.25;

export interface SplitConfig {
  id: string;
  brand: string;
  timeline: Timeline;
}

const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const end = durationInFrames / fps;
  const opacity = Math.min(range(t, [0, FADE_S], [0, 1]), range(t, [end - FADE_S, end], [1, 0]));
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/**
 * Recording-driven reel: job-declared motion graphics on the top 60%, your camera
 * on the bottom 40%, word-timed captions on the seam, your cleaned voice as audio.
 */
export const SplitExplainer: React.FC<{ config: SplitConfig }> = ({ config }) => {
  const { fps } = useVideoConfig();
  const { timeline } = config;
  if (!timeline.video) throw new Error(`timeline "${timeline.id}" has no video; build it with build_from_recording.py`);
  const steps: HeaderStep[] = timeline.scenes.map((s) => ({ label: visualLabel(s), start: s.start }));

  return (
    <CopyContext.Provider value={timeline.copy}>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: GFX_H, overflow: "hidden" }}>
          <Background />
          {timeline.scenes.map((scene, i) => {
            const from = Math.round(scene.start * fps);
            const next = timeline.scenes[i + 1];
            const to = Math.round((next ? next.start : timeline.durationS) * fps);
            return (
              <Sequence key={scene.id} from={from} durationInFrames={Math.max(1, to - from)} name={`scene:${scene.id}`}>
                <SceneFade>{renderVisual(scene)}</SceneFade>
              </Sequence>
            );
          })}
          <Header brand={config.brand} steps={steps} />
        </div>
        <VideoPanel video={timeline.video} top={VIDEO_TOP} height={VIDEO_H} />
        <KaraokeCaptions timeline={timeline} top={SPLIT_CAPTION_TOP} boxed />
        <Audio src={staticFile(`${timeline.id}/voice.wav`)} />
      </AbsoluteFill>
    </CopyContext.Provider>
  );
};
