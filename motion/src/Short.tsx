import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Captions } from "./components/Captions";
import { CropPanel } from "./components/CropPanel";
import { Overlays } from "./Overlays";
import { SHORT_LAYOUT } from "./shorts/layout";
import { COLORS, FPS } from "./theme";
import { ShortConfig, ShortSegment } from "./types";

type ShortProps = {
  config: ShortConfig;
};

const activeSegment = (segments: readonly ShortSegment[], t: number): ShortSegment =>
  segments.reduce((current, s) => (t >= s.from ? s : current), segments[0]);

export const Short: React.FC<ShortProps> = ({ config }) => {
  const frame = useCurrentFrame();
  const { top, bottom } = activeSegment(config.segments, frame / FPS);
  const { band, captions } = SHORT_LAYOUT;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      <CropPanel src={config.src} rect={top} y={SHORT_LAYOUT.top.y} height={SHORT_LAYOUT.top.height} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: band.y,
          height: band.height,
          background: `linear-gradient(180deg, #050a14 0%, ${COLORS.navy} 100%)`,
          borderTop: `4px solid ${COLORS.green}`,
          borderBottom: `4px solid ${COLORS.green}`,
        }}
      />
      <CropPanel src={config.src} rect={bottom} y={SHORT_LAYOUT.bottom.y} height={SHORT_LAYOUT.bottom.height} muted />
      <Captions words={config.words} top={captions.top} height={captions.height} />
      <Overlays config={config} />
    </AbsoluteFill>
  );
};
