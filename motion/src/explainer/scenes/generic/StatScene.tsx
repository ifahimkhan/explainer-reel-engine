import React from "react";
import { Easing, interpolate } from "remotion";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter, range } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, EX_WIDTH, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Burst } from "./fx";
import type { StatVisualT } from "./visuals";

interface StatSceneProps {
  scene: SceneTiming;
  visual: StatVisualT;
}

const COUNT_S = 1.3;
const RING_R = 250;
/** Widest the number may get inside the ring (px); font shrinks to fit longer values. */
const NUMBER_MAX_W = 360;
const CHAR_W = 0.6;
const SUFFIX_EM = 0.5;

/** Number counts (up or down) inside a drawing ring, then bursts; caption pill lands after. */
export const StatScene: React.FC<StatSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  // Finish counting (and show the caption) before the scene ends, even in short scenes.
  const latest = scene.end - scene.start - COUNT_S - 0.8;
  const at = Math.max(0.2, Math.min(cue(visual.cue) - 0.3, latest));
  const done = at + COUNT_S;
  const n = Math.round(
    interpolate(t, [at, done], [visual.from, visual.value], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
    }),
  );
  // Counting down: show the starting value right away so the ring is never empty.
  const showAt = visual.from > 0 ? 0.2 : at - 0.1;
  const cx = EX_WIDTH / 2;
  // Suffix renders at half size, so it counts half toward the fitted width.
  const mainText = `${visual.prefix ?? ""}${Math.max(visual.from, visual.value).toLocaleString("en-US")}`;
  const fitChars = mainText.length + (visual.suffix ?? "").length * SUFFIX_EM;
  const fontSize = Math.min(190, NUMBER_MAX_W / (fitChars * CHAR_W));
  const cy = SPLIT_CONTENT.top + 400;
  const ring = ease(t, 0.1, COUNT_S + at);
  const circ = 2 * Math.PI * RING_R;
  const punch = 1 + 0.08 * Math.sin(Math.PI * range(t, [done, done + 0.3], [0, 1]));

  return (
    <>
      <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
        <Pill icon={visual.icon ?? "sparkle"} text={visual.kicker} mono />
      </Centered>
      <svg width={EX_WIDTH} height={RING_R * 2 + 40} style={{ position: "absolute", left: 0, top: cy - RING_R - 20 }}>
        <circle cx={cx} cy={RING_R + 20} r={RING_R} fill={LIGHT.card} stroke={LIGHT.line} strokeWidth={6} opacity={ease(t, 0.05, 0.4)} />
        <circle
          cx={cx} cy={RING_R + 20} r={RING_R} fill="none" stroke={LIGHT.greenHl} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform={`rotate(-90 ${cx} ${RING_R + 20})`}
        />
      </svg>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: cy - fontSize * 0.75, textAlign: "center", fontFamily: EX_FONTS.sans, fontWeight: 800,
          fontSize, letterSpacing: -fontSize * 0.04, color: LIGHT.ink, transform: `scale(${punch * (0.8 + 0.2 * back(t, showAt, 0.5))})`,
          opacity: ease(t, showAt, 0.3),
        }}
      >
        {visual.prefix}
        {n.toLocaleString("en-US")}
        <span style={{ color: LIGHT.greenHl, fontSize: `${SUFFIX_EM}em`, letterSpacing: 0 }}>{visual.suffix}</span>
      </div>
      {visual.icon ? (
        <div
          style={{
            position: "absolute", left: cx - 50, top: cy + 100, width: 100, height: 100, borderRadius: 30, background: LIGHT.greenSoft,
            display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${back(t, done - 0.2, 0.5)})`,
          }}
        >
          <Icon name={visual.icon} size={58} color={LIGHT.green} stroke={2} />
        </div>
      ) : null}
      <Burst t={t} at={done} x={cx} y={cy} radius={330} count={20} />
      <Centered top={cy + RING_R + 50} style={enter(t, done + 0.1)}>
        <div
          style={{
            padding: "18px 34px", borderRadius: 999, background: LIGHT.dark, color: "#fff", boxShadow: SHADOW,
            fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 40,
          }}
        >
          {visual.caption}
        </div>
      </Centered>
      <Sfx name="whoosh" at={f(at)} volume={0.25} />
      <Sfx name="impact" at={f(done)} volume={0.3} />
    </>
  );
};
