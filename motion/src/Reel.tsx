import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { Overlays } from "./Overlays";
import { ReelConfig } from "./types";

// Type alias (not interface) so it satisfies Remotion's Record<string, unknown> props constraint
type ReelProps = {
  config: ReelConfig;
};

export const Reel: React.FC<ReelProps> = ({ config }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={staticFile(config.src)} />
    <Overlays config={config} />
  </AbsoluteFill>
);
