import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, lerp, pop } from "../anim";
import { COLORS, FONTS } from "../theme";
import { HookSpec } from "../types";
import { Sfx } from "./Sfx";

interface HookCardProps {
  hook: HookSpec;
  overlayBottom: number;
}

export const HookCard: React.FC<HookCardProps> = ({ hook, overlayBottom }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = fadeOut(frame, durationInFrames, 14);
  const kicker = pop(frame, 0);
  const line1 = pop(frame, 6);
  const line2 = pop(frame, 12, 10);
  const sweep = lerp(frame, [18, 40], [0, 100]);

  return (
    <AbsoluteFill style={{ height: overlayBottom, opacity: out }}>
      <Sfx name="whoosh" />
      <Sfx name="impact" at={12} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(11,18,32,0.55) 0%, ${COLORS.navyGlass} 45%, rgba(11,18,32,0.55) 100%)`,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONTS.display,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: COLORS.cyan,
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 6,
            opacity: kicker,
            transform: `translateY(${(1 - kicker) * -30}px)`,
          }}
        >
          {hook.kicker}
        </div>
        <div
          style={{
            color: COLORS.white,
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.05,
            marginTop: 24,
            transform: `scale(${0.6 + 0.4 * line1})`,
            opacity: line1,
          }}
        >
          {hook.line1}
        </div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1.1,
            transform: `scale(${0.5 + 0.5 * line2}) rotate(${(1 - line2) * -4}deg)`,
            opacity: line2,
          }}
        >
          <span style={{ color: COLORS.green }}>{hook.highlight}</span>
          <span style={{ color: COLORS.white }}>{hook.rest}</span>
        </div>
        <div
          style={{
            marginTop: 26,
            height: 10,
            width: `${sweep * 6}px`,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.cyan})`,
            boxShadow: `0 0 24px ${COLORS.green}`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
