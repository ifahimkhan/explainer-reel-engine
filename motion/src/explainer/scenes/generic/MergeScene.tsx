import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { back, ease } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, EX_WIDTH, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { bob, Burst, Headline } from "./fx";
import type { MergeVisualT } from "./visuals";

interface MergeSceneProps {
  scene: SceneTiming;
  visual: MergeVisualT;
}

const ORB = 170;
const ORB_COLORS = ["#f4966e", "#8b7cf6", "#4f8ff7", LIGHT.cyan];
const CARD_W = 640;
const CARD_H = 170;
const TRACK_W = 150;
const TRACK_H = 84;

/** Orbs pop in on cues, then get sucked into one card whose switch clicks on. */
export const MergeScene: React.FC<MergeSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const n = visual.items.length;
  const resAt = cue(visual.result.cue) - 0.25;
  const suck = ease(t, resAt, 0.5);
  const orbY = top + 300;
  const cardTop = top + 330;
  const card = back(t, resAt + 0.35, 0.5);
  const flipAt = resAt + 0.85;
  const on = ease(t, flipAt, 0.25);
  const step = CONTENT_W / n;

  return (
    <>
      <Headline
        text={visual.headline} highlight={visual.highlight} t={t} at={0.1} fontSize={80}
        style={{ position: "absolute", left: GUTTER, top: top + 10, width: CONTENT_W }}
      />
      {visual.items.map((item, i) => {
        const p = back(t, cue(item.cue) - 0.2, 0.5);
        const x0 = GUTTER + step * i + step / 2;
        const x = x0 + (EX_WIDTH / 2 - x0) * suck;
        const y = orbY + bob(t, i, 8) + (cardTop + CARD_H / 2 - ORB / 2 - orbY) * suck;
        const color = ORB_COLORS[i % ORB_COLORS.length];
        return (
          <div
            key={item.text}
            style={{
              position: "absolute", left: x - ORB / 2, top: y, width: ORB, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 14, opacity: ease(t, cue(item.cue) - 0.2, 0.2) * (1 - suck),
              transform: `scale(${p * (1 - 0.7 * suck)})`,
            }}
          >
            <div
              style={{
                width: ORB, height: ORB, borderRadius: ORB / 2, background: `radial-gradient(circle at 35% 30%, #fff8 0%, ${color} 55%)`,
                boxShadow: `0 20px 40px ${color}55`, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon name={item.icon} size={80} color="#fff" stroke={2.2} />
            </div>
            <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 36, color: LIGHT.ink, whiteSpace: "nowrap" }}>{item.text}</div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute", left: EX_WIDTH / 2 - CARD_W / 2, top: cardTop, width: CARD_W, height: CARD_H, boxSizing: "border-box",
          borderRadius: 40, background: LIGHT.card, border: `3px solid ${on > 0.5 ? LIGHT.greenHl : LIGHT.line}`,
          boxShadow: on > 0.5 ? `0 0 0 10px ${LIGHT.greenGlow}, ${SHADOW}` : SHADOW, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 40px", opacity: ease(t, resAt + 0.35, 0.2), transform: `scale(${card})`,
        }}
      >
        <div>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 64, letterSpacing: -2, color: LIGHT.ink }}>{visual.result.text}</div>
          {visual.result.sub ? (
            <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, letterSpacing: 4, color: on > 0.5 ? LIGHT.green : LIGHT.muted }}>
              {visual.result.sub}
            </div>
          ) : null}
        </div>
        <div style={{ position: "relative", width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2, background: on > 0.5 ? LIGHT.greenHl : "#d4d6d1" }}>
          <div
            style={{
              position: "absolute", top: 7, left: 7 + on * (TRACK_W - TRACK_H), width: TRACK_H - 14, height: TRACK_H - 14,
              borderRadius: (TRACK_H - 14) / 2, background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
      <Burst t={t} at={flipAt + 0.15} x={EX_WIDTH / 2} y={cardTop + CARD_H / 2} radius={380} count={20} />
      {visual.items.map((item, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, cue(item.cue) - 0.2))} volume={0.25} />
      ))}
      <Sfx name="whoosh" at={f(resAt)} volume={0.3} />
      <Sfx name="ding" at={f(flipAt)} volume={0.35} />
    </>
  );
};
