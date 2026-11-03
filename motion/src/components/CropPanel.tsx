import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { SOURCE } from "../shorts/layout";
import { WIDTH } from "../theme";
import { Rect } from "../types";

interface CropPanelProps {
  src: string;
  rect: Rect;
  y: number;
  height: number;
  muted?: boolean;
}

/** Shows `rect` of the 1920×1080 source scaled to fill a full-width panel. */
export const CropPanel: React.FC<CropPanelProps> = ({ src, rect, y, height, muted = false }) => {
  const scale = WIDTH / rect.w;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: WIDTH, height, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted={muted}
        style={{
          position: "absolute",
          left: -rect.x * scale,
          top: -rect.y * scale,
          width: SOURCE.width * scale,
          height: SOURCE.height * scale,
          maxWidth: "none",
        }}
      />
    </div>
  );
};
