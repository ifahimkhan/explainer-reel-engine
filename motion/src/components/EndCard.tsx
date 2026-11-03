import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { lerp, pop } from "../anim";
import { COLORS, FONTS } from "../theme";
import { Sfx } from "./Sfx";

interface EndCardProps {
  overlayBottom: number;
}

export const EndCard: React.FC<EndCardProps> = ({ overlayBottom }) => {
  const frame = useCurrentFrame();
  const bg = lerp(frame, [0, 10], [0, 1]);
  const logo = pop(frame, 4, 9);
  const name = pop(frame, 12);
  const cta = pop(frame, 22, 10);
  const pulse = 1 + 0.04 * Math.sin(frame / 5);

  return (
    <AbsoluteFill style={{ height: overlayBottom }}>
      <Sfx name="whoosh" />
      <Sfx name="impact" at={8} />
      <Sfx name="ding" at={22} />
      <AbsoluteFill
        style={{
          background: COLORS.navyGlass,
          opacity: bg,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONTS.display,
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            border: `5px solid ${COLORS.green}`,
            boxShadow: `0 0 50px ${COLORS.green}88`,
            transform: `scale(${logo}) rotate(${(1 - logo) * -180}deg)`,
          }}
        />
        <div style={{ color: COLORS.white, fontSize: 70, fontWeight: 900, marginTop: 30, opacity: name }}>
          FAHIM KHAN
        </div>
        <div style={{ color: COLORS.cyan, fontSize: 32, fontWeight: 600, letterSpacing: 8, opacity: name }}>
          CODE • BUILD • LEARN
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "22px 48px",
            borderRadius: 60,
            background: COLORS.green,
            color: COLORS.navy,
            fontSize: 44,
            fontWeight: 900,
            opacity: cta,
            transform: `scale(${cta * pulse})`,
            boxShadow: `0 0 40px ${COLORS.green}aa`,
          }}
        >
          SUBSCRIBE for Part 2 →
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
