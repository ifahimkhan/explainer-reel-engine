import React from "react";
import { AbsoluteFill } from "remotion";
import { Sfx } from "../../../components/Sfx";
import { Centered, Pill } from "../../components/Primitives";
import { ease, enter, range } from "../../motion";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Burst, Headline } from "./fx";
import type { PunchVisualT } from "./visuals";

interface PunchSceneProps {
  scene: SceneTiming;
  visual: PunchVisualT;
}

const SLAM_AT = 0.05;
const SLAM_S = 0.28;
const HIT_AT = SLAM_AT + SLAM_S * 0.7;
const SHAKE_S = 0.4;
const SHAKE_PX = 26;
const SETTLE_AT = 1.0;
const WORD_FONT = 260;
const WORD_Y = 430;
const SETTLED_Y = 260;
const SETTLED_SCALE = 0.5;

/** Screen shake: decaying jitter after the hit. */
const shakeAt = (t: number): { x: number; y: number } => {
  if (t < HIT_AT || t > HIT_AT + SHAKE_S) return { x: 0, y: 0 };
  const k = 1 - (t - HIT_AT) / SHAKE_S;
  return { x: Math.sin(t * 95) * SHAKE_PX * k, y: Math.cos(t * 77) * SHAKE_PX * 0.6 * k };
};

/** Hook: one huge word slams in with a flash and screen shake, then shrinks up and the headline rises below. */
export const PunchScene: React.FC<PunchSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const slam = ease(t, SLAM_AT, SLAM_S);
  const settle = ease(t, SETTLE_AT, 0.5);
  const wordScale = (4 - 3 * slam) * (1 - (1 - SETTLED_SCALE) * settle);
  const wordY = WORD_Y + (SETTLED_Y - WORD_Y) * settle;
  const flash = range(t, [HIT_AT, HIT_AT + 0.3], [0.55, 0]);
  const shake = shakeAt(t);
  const subAt = visual.sub ? cue(visual.sub.cue) - 0.2 : 0;

  return (
    <>
      <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
        {visual.kicker ? (
          <Centered top={150} style={enter(t, SETTLE_AT + 0.1)}>
            <Pill icon={visual.icon ?? "sparkle"} text={visual.kicker} mono />
          </Centered>
        ) : null}
        <div
          style={{
            position: "absolute", left: GUTTER, width: CONTENT_W, top: wordY, display: "flex", justifyContent: "center",
            transform: `scale(${wordScale})`, transformOrigin: "50% 50%", opacity: Math.min(1, slam * 2.5),
            filter: `blur(${(1 - slam) * 18}px)`,
          }}
        >
          <div
            style={{
              padding: "0 40px", borderRadius: 48, background: LIGHT.greenHl, color: "#fff", boxShadow: SHADOW,
              fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: WORD_FONT, lineHeight: 1.15, letterSpacing: -8, whiteSpace: "nowrap",
            }}
          >
            {visual.word}
          </div>
        </div>
        <Headline
          text={visual.headline} highlight={visual.highlight} t={t} at={SETTLE_AT + 0.2} fontSize={80}
          style={{ position: "absolute", left: GUTTER, width: CONTENT_W, top: 520 }}
        />
        {visual.sub ? (
          <Centered top={820} style={enter(t, Math.max(SETTLE_AT + 0.6, subAt))}>
            <Pill icon="bell" text={visual.sub.text} tone="dark" />
          </Centered>
        ) : null}
        <Burst t={t} at={HIT_AT} x={GUTTER + CONTENT_W / 2} y={WORD_Y + WORD_FONT * 0.55} radius={420} count={22} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Sfx name="impact" at={f(HIT_AT - 0.05)} volume={0.5} />
      <Sfx name="whoosh" at={f(SETTLE_AT)} volume={0.25} />
      {visual.sub ? <Sfx name="pop" at={f(Math.max(SETTLE_AT + 0.6, subAt))} volume={0.25} /> : null}
    </>
  );
};
