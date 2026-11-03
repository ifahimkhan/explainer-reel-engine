import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { NEVER, back, ease, typed } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Burst } from "./fx";
import type { TerminalVisualT } from "./visuals";

interface TerminalSceneProps {
  scene: SceneTiming;
  visual: TerminalVisualT;
}

const CPS = 16;
const FONT = 28;
const LINE_H = 46;
const LINE_GAP_S = 0.07;

const TONE_COLOR = {
  normal: "#d7dae0",
  dim: "#7d8590",
  good: "#4ade80",
  bad: "#ff8a8d",
} as const;

/** Dark terminal: command types, output prints, flagged lines turn red, dropped lines squash out. */
export const TerminalScene: React.FC<TerminalSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + 60;
  const cmdAt = visual.cue ? Math.max(0.3, cue(visual.cue) - 0.3) : 0.35;
  const cmdDone = cmdAt + visual.command.length / CPS;
  const printAt = cmdDone + 0.2;
  const cursorOn = Math.floor(t * 2.5) % 2 === 0;
  const badgeAt = visual.badge ? cue(visual.badge.cue) : NEVER;
  const badge = back(t, badgeAt, 0.5);

  return (
    <>
      <div
        style={{
          position: "absolute", left: GUTTER, top, width: CONTENT_W, borderRadius: 28, overflow: "hidden",
          background: "#16181d", border: `2px solid ${LIGHT.darkLine}`, boxShadow: SHADOW,
          opacity: ease(t, 0.05, 0.35), transform: `translateY(${(1 - ease(t, 0.05, 0.5)) * 50}px)`,
        }}
      >
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 26px", background: "#1f2228" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
          ))}
          <div style={{ marginLeft: 16, fontFamily: EX_FONTS.mono, fontSize: 22, color: "#7d8590" }}>{visual.title ?? "terminal"}</div>
        </div>
        <div style={{ padding: "26px 30px 34px", fontFamily: EX_FONTS.mono, fontSize: FONT, whiteSpace: "pre" }}>
          <div style={{ height: LINE_H, color: "#fff" }}>
            <span style={{ color: LIGHT.greenHl }}>$ </span>
            {typed(visual.command, t, cmdAt, CPS)}
            {t < printAt && cursorOn ? <span style={{ color: LIGHT.greenHl }}>▋</span> : null}
          </div>
          {visual.lines.map((line, i) => {
            const at = printAt + i * LINE_GAP_S;
            const flagAt = line.flag ? cue(line.flag) - 0.1 : NEVER;
            const dropAt = line.drop ? cue(line.drop) - 0.15 : NEVER;
            const flagged = ease(t, flagAt, 0.35);
            const drop = ease(t, dropAt, 0.4);
            const shake = t > flagAt && t < flagAt + 0.4 ? Math.sin((t - flagAt) * 70) * 6 * (1 - (t - flagAt) / 0.4) : 0;
            const tone = flagged > 0 ? "bad" : line.tone ?? "normal";
            return (
              <div
                key={i}
                style={{
                  position: "relative", height: LINE_H * (1 - drop), overflow: "hidden", opacity: ease(t, at, 0.15) * (1 - drop),
                  color: TONE_COLOR[tone], transform: `translateX(${shake}px) scaleY(${1 - drop * 0.6})`,
                }}
              >
                <div
                  style={{
                    position: "absolute", left: -10, top: 2, bottom: 2, width: `calc(${flagged * 100}% + 20px)`,
                    background: "rgba(229,72,77,0.22)", borderRadius: 8, opacity: flagged > 0 ? 1 : 0,
                  }}
                />
                <span style={{ position: "relative" }}>{line.text || " "}</span>
              </div>
            );
          })}
        </div>
      </div>
      {visual.badge ? (
        <div
          style={{
            position: "absolute", left: "50%", translate: "-50% 0", top: top - 40, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap",
            padding: "16px 28px", borderRadius: 999, background: LIGHT.greenHl, color: "#fff", boxShadow: SHADOW,
            fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 36, transform: `scale(${badge}) rotate(${(1 - badge) * 10}deg)`,
          }}
        >
          <Icon name="check" size={36} color="#fff" stroke={3} />
          {visual.badge.text}
        </div>
      ) : null}
      {visual.badge ? <Burst t={t} at={badgeAt + 0.1} x={GUTTER + CONTENT_W / 2} y={top} radius={220} count={14} /> : null}
      <Sfx name="type" at={f(cmdAt)} volume={0.25} />
      {visual.lines.map((line, i) =>
        line.flag ? <Sfx key={`f${i}`} name="alert" at={f(Math.max(0, cue(line.flag) - 0.1))} volume={0.25} /> : null,
      )}
      {visual.badge ? <Sfx name="ding" at={f(badgeAt)} volume={0.3} /> : null}
      {visual.lines.map((line, i) =>
        line.drop ? <Sfx key={`d${i}`} name="whoosh" at={f(Math.max(0, cue(line.drop) - 0.15))} volume={0.3} /> : null,
      )}
    </>
  );
};
