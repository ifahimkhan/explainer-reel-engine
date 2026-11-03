import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease } from "../motion";
import { EX_FONTS, GUTTER, LAYOUT, LIGHT } from "../theme";

/** Paper background with slowly drifting green / peach glows. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 40;
  return (
    <AbsoluteFill style={{ background: LIGHT.paper }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${880 + drift}px ${160 - drift / 2}px, rgba(34,163,90,0.16), transparent 70%),
            radial-gradient(800px 900px at ${120 - drift}px ${1500 + drift}px, rgba(244,150,110,0.14), transparent 70%),
            radial-gradient(700px 500px at 540px 1950px, rgba(34,163,90,0.08), transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export interface HeaderStep {
  label: string;
  start: number;
}

interface HeaderProps {
  brand: string;
  steps: readonly HeaderStep[];
}

/** Brand row + scene counter pill + overall progress bar. */
export const Header: React.FC<HeaderProps> = ({ brand, steps }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const idx = Math.max(0, steps.reduce((acc, s, i) => (t >= s.start ? i : acc), 0));
  const progress = frame / (durationInFrames - 1);
  const intro = ease(t, 0, 0.5);
  const counter = `${steps[idx]?.label ?? ""} · ${String(idx + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;

  return (
    <div style={{ position: "absolute", top: LAYOUT.headerTop, left: GUTTER, right: GUTTER, opacity: intro }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={staticFile("logo.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
          <span style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 36, color: LIGHT.ink, letterSpacing: -0.8 }}>
            {brand}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.8)",
            border: `2px solid ${LIGHT.line}`,
            fontFamily: EX_FONTS.mono,
            fontSize: 23,
            letterSpacing: 2,
            color: LIGHT.sub,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 6, background: LIGHT.greenHl }} />
          {counter}
        </div>
      </div>
      <div style={{ marginTop: 18, height: 5, borderRadius: 3, background: "rgba(15,17,21,0.06)" }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${LIGHT.red}, ${LIGHT.greenHl})`,
          }}
        />
      </div>
    </div>
  );
};
