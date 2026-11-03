import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Centered, Pill } from "../../components/Primitives";
import { Icon } from "../../components/Icon";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { SequenceVisualT } from "./visuals";

interface SequenceSceneProps {
  scene: SceneTiming;
  visual: SequenceVisualT;
}

const HEAD_H = 130;
const MAX_ROW_H = 104;
/** Scene-space y the diagram (and its note) must stay above, clear of the captions. */
const SAFE_BOTTOM = 1110;
const NOTE_H = 70;
const FIRST_ROW = HEAD_H + 74;
const TRAVEL_S = 0.5;
const GLOW_S = 0.7;
const OLD_OPACITY = 0.5;

const TONE = { good: LIGHT.greenHl, bad: LIGHT.red, normal: LIGHT.ink } as const;

/** Sequence diagram: lanes with lifelines; each message arrow flies from lane to lane on its cue. */
export const SequenceScene: React.FC<SequenceSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 90 : 10);
  const lanes = visual.lanes.length;
  const laneW = Math.min(196, (CONTENT_W - (lanes - 1) * 16) / lanes);
  const laneX = (i: number): number => (CONTENT_W / lanes) * (i + 0.5);
  const msgs = visual.messages.map((m) => ({ ...m, at: cue(m.cue) - 0.1 }));
  const room = SAFE_BOTTOM - top - (visual.note ? NOTE_H : 0) - FIRST_ROW - 50;
  const rowH = msgs.length > 1 ? Math.min(MAX_ROW_H, room / (msgs.length - 1)) : MAX_ROW_H;
  const bottom = FIRST_ROW + (msgs.length - 1) * rowH + 50;
  const current = msgs.reduce((acc, m, i) => (t >= m.at ? i : acc), -1);

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="share" text={visual.title} mono />
        </Centered>
      ) : null}
      <div style={{ position: "absolute", left: GUTTER, top, width: CONTENT_W, height: bottom }}>
        <svg width={CONTENT_W} height={bottom} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {visual.lanes.map((_, i) => (
            <line
              key={i} x1={laneX(i)} x2={laneX(i)} y1={HEAD_H} y2={HEAD_H + (bottom - HEAD_H) * ease(t, 0.3 + i * 0.08, 0.6)}
              stroke={LIGHT.muted} strokeWidth={3} strokeDasharray="10 10"
            />
          ))}
          {msgs.map((m, i) => {
            if (t < m.at) return null;
            const p = ease(t, m.at, TRAVEL_S);
            const x1 = laneX(m.from);
            const x2 = laneX(m.to);
            const xe = x1 + (x2 - x1) * p;
            const y = FIRST_ROW + i * rowH;
            const dir = Math.sign(x2 - x1) || 1;
            const color = TONE[m.tone ?? "normal"];
            return (
              <g key={i} opacity={i === current ? 1 : OLD_OPACITY}>
                <line x1={x1} x2={xe} y1={y} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round" />
                {p > 0.95 ? <polygon points={`${x2},${y} ${x2 - 20 * dir},${y - 11} ${x2 - 20 * dir},${y + 11}`} fill={color} /> : null}
                {p < 1 ? <circle cx={xe} cy={y} r={11} fill={color} stroke="#fff" strokeWidth={3} /> : null}
              </g>
            );
          })}
        </svg>
        {visual.lanes.map((lane, i) => {
          const glow = msgs.some((m) => (m.from === i || m.to === i) && t >= m.at && t < m.at + GLOW_S);
          const p = back(t, 0.15 + i * 0.1, 0.5);
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: laneX(i) - laneW / 2, top: 0, width: laneW, height: HEAD_H, boxSizing: "border-box", borderRadius: 22,
                background: LIGHT.card, border: `3px solid ${glow ? LIGHT.greenHl : LIGHT.line}`, boxShadow: glow ? `${SHADOW}, 0 0 0 8px ${LIGHT.greenGlow}` : SHADOW,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                transform: `scale(${p})`, opacity: Math.min(1, p * 2),
              }}
            >
              <Icon name={lane.icon} size={42} color={glow ? LIGHT.green : LIGHT.ink} stroke={2.2} />
              <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 27, color: LIGHT.ink, textAlign: "center", lineHeight: 1.05 }}>{lane.name}</div>
            </div>
          );
        })}
        {msgs.map((m, i) => {
          if (t < m.at) return null;
          const p = back(t, m.at + 0.15, 0.4);
          const y = FIRST_ROW + i * rowH;
          const mid = (laneX(m.from) + laneX(m.to)) / 2;
          const color = TONE[m.tone ?? "normal"];
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: mid - 240, width: 480, top: y - 54, display: "flex", justifyContent: "center",
                opacity: Math.min(1, p * 2), transform: `scale(${p})`,
              }}
            >
              <span
                style={{
                  padding: "3px 14px", borderRadius: 10, background: LIGHT.paper, color, whiteSpace: "nowrap",
                  fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 30,
                }}
              >
                {/* Fade only the text: an opaque background keeps lane lines from showing through older labels. */}
                <span style={{ opacity: i === current ? 1 : OLD_OPACITY }}>{m.text}</span>
              </span>
            </div>
          );
        })}
      </div>
      {visual.note ? (
        <Centered top={top + bottom + 26} style={enter(t, cue(visual.note.cue) - 0.2)}>
          <Pill icon="check" text={visual.note.text} tone="dark" />
        </Centered>
      ) : null}
      {msgs.map((m, i) => <Sfx key={i} name="whoosh" at={f(Math.max(0, m.at))} volume={0.16} />)}
      {msgs.map((m, i) => <Sfx key={`d${i}`} name={m.tone === "bad" ? "alert" : "pop"} at={f(m.at + TRAVEL_S)} volume={0.22} />)}
      {visual.note ? <Sfx name="ding" at={f(Math.max(0, cue(visual.note.cue) - 0.2))} volume={0.25} /> : null}
    </>
  );
};
