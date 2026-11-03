import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { back, ease } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, EX_WIDTH, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { bob, Burst } from "./fx";
import type { ChipsVisualT } from "./visuals";

interface ChipsSceneProps {
  scene: SceneTiming;
  visual: ChipsVisualT;
}

const RX = 330;
const RY = 300;
const HUB_W = 440;
const HUB_H = 220;

/** Dark hub card; chips shoot out from it along drawn connectors to orbit positions. */
export const ChipsScene: React.FC<ChipsSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const cx = EX_WIDTH / 2;
  const cy = SPLIT_CONTENT.top + 390;
  const hubIn = back(t, 0.1, 0.6);
  const ats = visual.chips.map((c) => cue(c.cue) - 0.2);
  const spots = visual.chips.map((_, i) => {
    const a = -Math.PI / 2 + (i / visual.chips.length) * Math.PI * 2;
    return { x: cx + Math.cos(a) * RX, y: cy + Math.sin(a) * RY };
  });

  return (
    <>
      <svg width={EX_WIDTH} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {spots.map((s, i) => {
          const p = ease(t, ats[i], 0.45);
          return (
            <line
              key={i} x1={cx} y1={cy} x2={cx + (s.x - cx) * p} y2={cy + (s.y - cy) * p}
              stroke={LIGHT.greenHl} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-t * 40} opacity={0.55 * p}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute", left: cx - HUB_W / 2, top: cy - HUB_H / 2, width: HUB_W, height: HUB_H, borderRadius: 40,
          background: LIGHT.dark, boxShadow: `0 0 0 ${8 + 6 * Math.sin(t * 3)}px ${LIGHT.greenGlow}, ${SHADOW}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          transform: `scale(${hubIn})`, opacity: ease(t, 0.1, 0.3),
        }}
      >
        {visual.hub.icon ? <Icon name={visual.hub.icon} size={44} color={LIGHT.greenHl} /> : null}
        <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 70, color: "#fff", letterSpacing: -2 }}>{visual.hub.text}</div>
        {visual.hub.sub ? <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, letterSpacing: 3, color: LIGHT.muted }}>{visual.hub.sub}</div> : null}
      </div>
      {visual.chips.map((chip, i) => {
        const at = ats[i];
        const p = back(t, at, 0.55);
        const s = spots[i];
        const x = cx + (s.x - cx) * p;
        const y = cy + (s.y - cy) * p + (t > at + 0.6 ? bob(t, i, 7) : 0);
        return (
          <div
            key={chip.text}
            style={{
              position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * p})`, opacity: ease(t, at, 0.2),
              display: "flex", alignItems: "center", gap: 12, padding: "16px 28px", borderRadius: 999, background: LIGHT.card,
              border: `3px solid ${LIGHT.greenHl}`, boxShadow: SHADOW, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 36,
              color: LIGHT.ink, whiteSpace: "nowrap",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: LIGHT.greenHl }} />
            {chip.text}
          </div>
        );
      })}
      <Burst t={t} at={ats[ats.length - 1] + 0.5} x={cx} y={cy} radius={200} count={14} />
      {ats.map((at, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, at))} volume={0.25} />
      ))}
    </>
  );
};
