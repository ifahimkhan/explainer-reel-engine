import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter, range } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { StepsVisualT } from "./visuals";

interface StepsSceneProps {
  scene: SceneTiming;
  visual: StepsVisualT;
}

const ROW_H = 132;
const ROW_GAP = 26;
const BADGE = 76;

/** Numbered rows that appear and tick off on their cues, joined by a growing rail. */
export const StepsScene: React.FC<StepsSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 110 : 40);
  const ats = visual.steps.map((s) => cue(s.cue) - 0.2);
  const railX = GUTTER + 28 + BADGE / 2;
  const lastAt = ats[ats.length - 1];
  const railP = range(t, [ats[0], lastAt + 0.4], [0, 1]);
  const railH = (visual.steps.length - 1) * (ROW_H + ROW_GAP);

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="layers" text={visual.title} mono />
        </Centered>
      ) : null}
      <div style={{ position: "absolute", left: railX - 2, top: top + ROW_H / 2, width: 4, height: railH * railP, background: LIGHT.greenHl, borderRadius: 2 }} />
      {visual.steps.map((step, i) => {
        const at = ats[i];
        const done = t >= at + 0.5;
        const pop = back(t, at + 0.5, 0.35);
        return (
          <div
            key={step.label}
            style={{
              position: "absolute", top: top + i * (ROW_H + ROW_GAP), left: GUTTER, right: GUTTER, height: ROW_H,
              display: "flex", alignItems: "center", gap: 28, padding: "0 28px", borderRadius: 28, background: LIGHT.card,
              border: `3px solid ${done ? LIGHT.greenHl : LIGHT.line}`, boxShadow: SHADOW, ...enter(t, at, 30),
            }}
          >
            <div
              style={{
                width: BADGE, height: BADGE, borderRadius: BADGE / 2, flexShrink: 0, display: "flex", alignItems: "center",
                justifyContent: "center", background: done ? LIGHT.greenHl : LIGHT.greenSoft, color: done ? "#fff" : LIGHT.green,
                fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 36, transform: `scale(${done ? 0.85 + 0.15 * pop : 1})`,
              }}
            >
              {done ? <Icon name="check" size={40} stroke={3} /> : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 42, color: LIGHT.ink, letterSpacing: -1 }}>{step.label}</div>
              {step.sub ? (
                <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, color: LIGHT.muted, opacity: ease(t, at + 0.25, 0.3) }}>{step.sub}</div>
              ) : null}
            </div>
            {step.icon ? <Icon name={step.icon} size={48} color={done ? LIGHT.green : LIGHT.muted} /> : null}
          </div>
        );
      })}
      {ats.map((at, i) => (
        <React.Fragment key={i}>
          <Sfx name="pop" at={f(Math.max(0, at))} />
          <Sfx name="ding" at={f(at + 0.5)} volume={0.2} />
        </React.Fragment>
      ))}
    </>
  );
};
