import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { bob, Headline } from "./fx";
import type { ReasonVisualT } from "./visuals";

interface ReasonSceneProps {
  scene: SceneTiming;
  visual: ReasonVisualT;
}

const TILE = 150;

/** Giant outlined number slams in, icon tile spins in, headline staggers, points tick on cues. */
export const ReasonScene: React.FC<ReasonSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const slam = back(t, 0.05, 0.55);
  const tile = back(t, 0.25, 0.6);
  const bar = ease(t, 0.6, 0.6);

  return (
    <>
      <div
        style={{
          position: "absolute", left: GUTTER - 10, top: top - 40, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 340,
          lineHeight: 1, letterSpacing: -16, color: "transparent", WebkitTextStroke: `5px ${LIGHT.greenHl}`,
          opacity: ease(t, 0.05, 0.3), transform: `translateX(${(1 - slam) * -220}px) scale(${0.85 + 0.15 * slam})`, transformOrigin: "0 50%",
        }}
      >
        {String(visual.number).padStart(2, "0")}
      </div>
      <div
        style={{
          position: "absolute", left: GUTTER + CONTENT_W - TILE, top: top + 60 + bob(t, 1, 6), width: TILE, height: TILE, borderRadius: 44,
          background: LIGHT.greenHl, boxShadow: `0 0 0 12px ${LIGHT.greenGlow}, ${SHADOW}`, display: "flex", alignItems: "center",
          justifyContent: "center", transform: `scale(${tile}) rotate(${(1 - tile) * 90}deg)`,
        }}
      >
        <Icon name={visual.icon} size={84} color="#fff" stroke={2} />
      </div>
      <Headline
        text={visual.title} highlight={visual.highlight} t={t} at={0.35} fontSize={92} align="left"
        style={{ position: "absolute", left: GUTTER, top: top + 330, width: CONTENT_W }}
      />
      <div style={{ position: "absolute", left: GUTTER, top: top + 560, width: 180 * bar, height: 10, borderRadius: 5, background: LIGHT.greenHl }} />
      {(visual.points ?? []).map((pt, i) => {
        const at = cue(pt.cue) - 0.2;
        return (
          <div
            key={pt.text}
            style={{
              position: "absolute", left: GUTTER, top: top + 610 + i * 82, display: "flex", alignItems: "center", gap: 18,
              fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 40, color: LIGHT.ink, ...enter(t, at, 20),
            }}
          >
            <div
              style={{
                width: 54, height: 54, borderRadius: 27, background: LIGHT.greenSoft, display: "flex", alignItems: "center",
                justifyContent: "center", transform: `scale(${back(t, at + 0.1, 0.4)})`,
              }}
            >
              <Icon name="check" size={32} color={LIGHT.green} stroke={3} />
            </div>
            {pt.text}
          </div>
        );
      })}
      <Sfx name="impact" at={f(0.05)} volume={0.3} />
      {(visual.points ?? []).map((pt, i) => (
        <Sfx key={i} name="ding" at={f(Math.max(0, cue(pt.cue) - 0.1))} volume={0.2} />
      ))}
    </>
  );
};
