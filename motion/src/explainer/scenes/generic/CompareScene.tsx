import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Card, CardLabel } from "../../components/Primitives";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { CompareVisualT } from "./visuals";

interface CompareSceneProps {
  scene: SceneTiming;
  visual: CompareVisualT;
}

const CARD_W = 420;
const CARD_H = 600;

type Side = CompareVisualT["left"];

const SideCard: React.FC<{ side: Side; t: number; at: number; left: number; win: boolean }> = ({ side, t, at, left, win }) => (
  <Card
    style={{
      top: SPLIT_CONTENT.top + 60, left, width: CARD_W, height: CARD_H, padding: 32,
      border: `3px solid ${win ? LIGHT.greenHl : LIGHT.line}`,
      boxShadow: win ? `${SHADOW}, 0 0 0 12px ${LIGHT.greenGlow}` : SHADOW,
      ...enter(t, at, 40),
    }}
  >
    <CardLabel icon={win ? "sparkle" : "file"} text={side.kicker} color={win ? LIGHT.green : LIGHT.muted} />
    <div style={{ marginTop: 18, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 48, lineHeight: 1.1, letterSpacing: -1.5, color: LIGHT.ink }}>
      {side.title}
    </div>
    <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      {side.items.map((item, i) => (
        <div
          key={item}
          style={{
            display: "flex", alignItems: "center", gap: 14, fontFamily: EX_FONTS.sans, fontWeight: 600, fontSize: 28,
            color: LIGHT.sub, opacity: ease(t, at + 0.3 + i * 0.12, 0.3),
          }}
        >
          <Icon name={win ? "check" : "file"} size={30} color={win ? LIGHT.green : LIGHT.muted} stroke={win ? 3 : 2} />
          {item}
        </div>
      ))}
    </div>
  </Card>
);

/** Before / after cards; the right card lands on its cue with a highlight. */
export const CompareScene: React.FC<CompareSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const leftAt = cue(visual.left.cue) - 0.2;
  const rightAt = cue(visual.right.cue) - 0.2;
  const arrow = back(t, rightAt - 0.15, 0.4);

  return (
    <>
      <SideCard side={visual.left} t={t} at={leftAt} left={GUTTER} win={false} />
      <div
        style={{
          position: "absolute", top: SPLIT_CONTENT.top + 60 + CARD_H / 2 - 36, left: 540 - 36, width: 72, height: 72,
          borderRadius: 36, background: LIGHT.dark, display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2, opacity: arrow, transform: `scale(${arrow})`,
        }}
      >
        <Icon name="arrowRight" size={38} color="#fff" stroke={2.6} />
      </div>
      <SideCard side={visual.right} t={t} at={rightAt} left={1080 - GUTTER - CARD_W} win />
      <Sfx name="pop" at={f(Math.max(0, leftAt))} />
      <Sfx name="whoosh" at={f(rightAt - 0.15)} volume={0.25} />
      <Sfx name="ding" at={f(rightAt + 0.4)} />
    </>
  );
};
