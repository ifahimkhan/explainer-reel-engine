import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { TrioVisualT } from "./visuals";

interface TrioSceneProps {
  scene: SceneTiming;
  visual: TrioVisualT;
}

const ROW_H = 200;
const GAP = 24;
const TILE = 112;

/** 2-3 option rows (e.g. Native / Web / Hybrid) slide in on their cues; the newest one glows. */
export const TrioScene: React.FC<TrioSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 110 : 40);
  const ats = visual.rows.map((r) => cue(r.cue) - 0.25);
  const newest = ats.reduce((acc, at, i) => (t >= at ? i : acc), -1);

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={{ opacity: ease(t, 0.05, 0.3) }}>
          <Pill icon="layers" text={visual.title} mono />
        </Centered>
      ) : null}
      {visual.rows.map((row, i) => {
        const at = ats[i];
        const slide = back(t, at, 0.55);
        const active = i === newest;
        const bad = row.tone === "bad";
        const hl = bad ? LIGHT.red : LIGHT.greenHl;
        const glow = bad ? "rgba(229, 72, 77, 0.18)" : LIGHT.greenGlow;
        const soft = bad ? "#fde2e2" : LIGHT.greenSoft;
        const ink = bad ? LIGHT.red : LIGHT.green;
        return (
          <div
            key={row.kicker}
            style={{
              position: "absolute", left: GUTTER, top: top + i * (ROW_H + GAP), width: CONTENT_W, height: ROW_H,
              boxSizing: "border-box", padding: "0 36px", borderRadius: 34, background: LIGHT.card,
              border: `3px solid ${active ? hl : LIGHT.line}`,
              boxShadow: active ? `0 0 0 10px ${glow}, ${SHADOW}` : SHADOW,
              display: "flex", alignItems: "center", gap: 32,
              opacity: ease(t, at, 0.25), transform: `translateX(${(1 - slide) * -120}px) scale(${active ? 1.02 : 1})`,
            }}
          >
            <div
              style={{
                flex: "none", width: TILE, height: TILE, borderRadius: 30,
                background: active ? hl : soft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon name={row.icon} size={60} color={active ? "#fff" : ink} stroke={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: EX_FONTS.mono, fontSize: 26, letterSpacing: 3, color: active || bad ? ink : LIGHT.muted }}>
                {row.kicker}
              </div>
              <div
                style={{
                  marginTop: 8, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 44, lineHeight: 1.12,
                  letterSpacing: -1.2, color: LIGHT.ink, opacity: ease(t, at + 0.15, 0.3),
                }}
              >
                {row.text}
              </div>
            </div>
          </div>
        );
      })}
      {ats.map((at, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, at))} />
      ))}
    </>
  );
};
