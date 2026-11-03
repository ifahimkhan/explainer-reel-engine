import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { EX_WIDTH, LIGHT } from "../theme";
import type { VideoMeta } from "../timeline";

interface VideoPanelProps {
  video: VideoMeta;
  top: number;
  height: number;
}

/** Placement of the source frame so the crop box (or the whole frame) covers the panel. */
const placement = (video: VideoMeta, panelW: number, panelH: number): React.CSSProperties => {
  const box = video.crop ?? { x: 0, y: 0, width: video.width, height: video.height };
  // Cover: scale so the box fills the panel in both directions, then centre the box.
  const scale = Math.max(panelW / box.width, panelH / box.height);
  const cx = (box.x + box.width / 2) * scale;
  const cy = (box.y + box.height / 2) * scale;
  return {
    position: "absolute",
    width: video.width * scale,
    height: video.height * scale,
    left: panelW / 2 - cx,
    top: panelH / 2 - cy,
  };
};

/** Bottom camera panel. The recording is muted here; narration plays from the cleaned voice track. */
export const VideoPanel: React.FC<VideoPanelProps> = ({ video, top, height }) => (
  <div style={{ position: "absolute", top, left: 0, width: EX_WIDTH, height, overflow: "hidden", background: LIGHT.dark }}>
    <OffthreadVideo src={staticFile(video.src)} muted style={placement(video, EX_WIDTH, height)} />
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, rgba(13,15,18,0.35) 0%, transparent 22%, transparent 80%, rgba(13,15,18,0.4) 100%)" }}
    />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${LIGHT.red}, ${LIGHT.greenHl})` }} />
  </div>
);
