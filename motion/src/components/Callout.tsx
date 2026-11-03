import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, lerp, pop } from "../anim";
import { COLORS, FONTS } from "../theme";
import { CalloutSpec, Zones } from "../types";
import { Sfx, SfxName } from "./Sfx";

const TYPE_START = 8;
const FRAMES_PER_CHAR = 2;

interface CalloutProps {
  spec: CalloutSpec;
  band: Zones["calloutBand"];
}

const enterSound = (spec: CalloutSpec): SfxName =>
  spec.accent === "amber" ? "alert" : spec.accent === "green" ? "ding" : "pop";

export const Callout: React.FC<CalloutProps> = ({ spec, band }) => {
  const { icon, text, accent, mono } = spec;
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const color = COLORS[accent];
  const enter = pop(frame, 0, 12);
  const out = fadeOut(frame, durationInFrames, 12);
  const typeEnd = TYPE_START + text.length * FRAMES_PER_CHAR;
  // Typewriter for commands, instant for statements
  const shown = mono ? Math.floor(lerp(frame, [TYPE_START, typeEnd], [0, text.length])) : text.length;
  const caret = mono && Math.floor(frame / 20) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: band.top,
        height: band.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: out,
      }}
    >
      <Sfx name={enterSound(spec)} />
      {mono && <Sfx name="type" at={TYPE_START} volume={0.25} />}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 34px",
          borderRadius: 26,
          background: COLORS.navyGlass,
          border: `3px solid ${color}`,
          boxShadow: `0 0 34px ${color}66, 0 12px 40px rgba(0,0,0,0.5)`,
          transform: `scale(${0.4 + 0.6 * enter}) translateY(${(1 - enter) * 60}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            flexShrink: 0,
            borderRadius: 30,
            background: color,
            color: COLORS.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.display,
            fontSize: 38,
            fontWeight: 900,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            color: COLORS.white,
            fontFamily: mono ? FONTS.mono : FONTS.display,
            fontSize: mono ? 36 : 42,
            fontWeight: mono ? 700 : 800,
            whiteSpace: "nowrap",
          }}
        >
          {text.slice(0, shown)}
          {mono && <span style={{ color, opacity: caret ? 1 : 0 }}>▌</span>}
        </div>
      </div>
    </div>
  );
};
