import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Headline } from "./fx";
import type { JourneyVisualT } from "./visuals";

interface JourneySceneProps {
  scene: SceneTiming;
  visual: JourneyVisualT;
}

const NODE = 150;
const TRACK_H = 10;

/**
 * Stops on a horizontal track (e.g. 5G -> 2G -> Dead zone -> Wi-Fi). Stops wait dimmed, light up on their
 * cues while the track fills up to them; the current stop glows (red for `bad` stops).
 */
export const JourneyScene: React.FC<JourneySceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const n = visual.stops.length;
  const step = (CONTENT_W - NODE) / (n - 1);
  const xOf = (i: number) => GUTTER + i * step;
  const headTop = SPLIT_CONTENT.top + 20;
  const nodeTop = SPLIT_CONTENT.top + (visual.headline ? 300 : 160);
  const ats = visual.stops.map((s) => cue(s.cue) - 0.2);
  const current = ats.reduce((acc, at, i) => (t >= at ? i : acc), -1);
  const fill = ats.reduce((acc, at, i) => (i === 0 ? acc : acc + ease(t, at - 0.35, 0.35)), 0);

  return (
    <>
      {visual.headline ? (
        <Headline
          text={visual.headline} highlight={visual.highlight} t={t} at={0.1} fontSize={76}
          style={{ position: "absolute", left: GUTTER, top: headTop, width: CONTENT_W }}
        />
      ) : null}
      <div
        style={{
          position: "absolute", left: xOf(0) + NODE / 2, top: nodeTop + NODE / 2 - TRACK_H / 2,
          width: CONTENT_W - NODE, height: TRACK_H, borderRadius: TRACK_H / 2, background: LIGHT.line,
        }}
      />
      <div
        style={{
          position: "absolute", left: xOf(0) + NODE / 2, top: nodeTop + NODE / 2 - TRACK_H / 2,
          width: fill * step, height: TRACK_H, borderRadius: TRACK_H / 2, background: LIGHT.greenHl,
        }}
      />
      {visual.stops.map((stop, i) => {
        const at = ats[i];
        const lit = t >= at;
        const active = i === current;
        const pop = lit ? back(t, at, 0.5) : 1;
        const bad = stop.tone === "bad";
        const accent = bad ? LIGHT.red : LIGHT.greenHl;
        return (
          <div key={i} style={{ position: "absolute", left: xOf(i) - 30, top: nodeTop, width: NODE + 60, textAlign: "center" }}>
            <div
              style={{
                margin: "0 auto", width: NODE, height: NODE, borderRadius: NODE / 2, boxSizing: "border-box",
                background: active ? accent : LIGHT.card, border: `4px solid ${lit ? accent : LIGHT.line}`,
                boxShadow: active ? `0 0 0 14px ${bad ? "rgba(229, 72, 77, 0.18)" : LIGHT.greenGlow}, ${SHADOW}` : SHADOW,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: lit ? 1 : 0.45, transform: `scale(${(active ? 1.08 : 1) * (0.7 + 0.3 * pop)})`,
              }}
            >
              <Icon name={stop.icon} size={72} color={active ? "#fff" : lit ? accent : LIGHT.muted} stroke={2.2} />
            </div>
            <div
              style={{
                marginTop: 24, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 40, letterSpacing: -1, lineHeight: 1.1,
                color: lit ? LIGHT.ink : LIGHT.muted,
              }}
            >
              {stop.name}
            </div>
            {stop.sub ? (
              <div style={{ marginTop: 8, fontFamily: EX_FONTS.mono, fontSize: 22, color: LIGHT.sub, opacity: lit ? ease(t, at + 0.2, 0.3) : 0 }}>
                {stop.sub}
              </div>
            ) : null}
          </div>
        );
      })}
      {visual.note ? (
        <Centered top={nodeTop + NODE + 190} style={{ opacity: ease(t, cue(visual.note.cue) - 0.1, 0.3) }}>
          <Pill icon="arrowRight" text={visual.note.text} tone="dark" />
        </Centered>
      ) : null}
      {ats.map((at, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, at))} />
      ))}
    </>
  );
};
