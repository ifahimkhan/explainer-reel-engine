import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { back, ease, enter, range } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, EX_WIDTH, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Burst, Headline } from "./fx";
import type { QuizVisualT } from "./visuals";

interface QuizSceneProps {
  scene: SceneTiming;
  visual: QuizVisualT;
}

const RING = 150;
const RING_STROKE = 14;
const OPTION_H = 104;
const OPTION_GAP = 18;
const LETTERS = ["A", "B", "C", "D"] as const;

/** "Guess first": question, options, a countdown ring ticking down, then the answer lights up. */
export const QuizScene: React.FC<QuizSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const askAt = cue(visual.ask) - 0.1;
  const revealAt = cue(visual.reveal) - 0.1;
  const left = t < askAt ? visual.seconds : Math.max(0, visual.seconds - (t - askAt));
  const ringP = range(t, [askAt, askAt + visual.seconds], [1, 0]);
  const revealed = t >= revealAt;
  const optionsTop = top + 300;
  const circ = Math.PI * (RING - RING_STROKE);

  return (
    <>
      <Headline
        text={visual.question} highlight={visual.highlight} t={t} at={0.1} fontSize={64}
        style={{ position: "absolute", left: GUTTER, width: CONTENT_W, top: top + 20 }}
      />
      <div style={{ position: "absolute", left: EX_WIDTH / 2 - RING / 2, top: top + 150 - 10, width: RING, height: RING, ...enter(t, askAt) }}>
        <svg width={RING} height={RING}>
          <circle cx={RING / 2} cy={RING / 2} r={(RING - RING_STROKE) / 2} fill={LIGHT.card} stroke={LIGHT.line} strokeWidth={RING_STROKE} />
          <circle
            cx={RING / 2} cy={RING / 2} r={(RING - RING_STROKE) / 2} fill="none" stroke={revealed ? LIGHT.greenHl : ringP < 0.34 ? LIGHT.red : LIGHT.ink}
            strokeWidth={RING_STROKE} strokeLinecap="round" strokeDasharray={`${circ * (revealed ? 1 : ringP)} ${circ}`}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 64, color: LIGHT.ink }}>
          {revealed ? <Icon name="check" size={64} color={LIGHT.green} stroke={3.5} /> : Math.ceil(left) || "?"}
        </div>
      </div>
      {visual.options.map((opt, i) => {
        const right = i === visual.answer;
        const p = back(t, 0.4 + i * 0.12, 0.45);
        const win = revealed && right ? ease(t, revealAt, 0.3) : 0;
        const lose = revealed && !right ? ease(t, revealAt, 0.3) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: GUTTER + 40, width: CONTENT_W - 80, top: optionsTop + i * (OPTION_H + OPTION_GAP), height: OPTION_H, boxSizing: "border-box",
              display: "flex", alignItems: "center", gap: 22, padding: "0 28px", borderRadius: 26, boxShadow: SHADOW,
              background: win > 0.5 ? LIGHT.greenSoft : LIGHT.card, border: `3px solid ${win > 0.5 ? LIGHT.greenHl : LIGHT.line}`,
              transform: `scale(${p * (1 + 0.05 * Math.sin(Math.PI * win))})`, opacity: Math.min(1, p * 2) * (1 - 0.55 * lose),
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: win > 0.5 ? LIGHT.greenHl : LIGHT.paper, color: win > 0.5 ? "#fff" : LIGHT.ink, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 28,
              }}
            >
              {win > 0.5 ? <Icon name="check" size={30} color="#fff" stroke={3.5} /> : LETTERS[i]}
            </div>
            <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 36, color: LIGHT.ink, textDecoration: lose > 0.5 ? "line-through" : "none" }}>{opt}</div>
          </div>
        );
      })}
      <Burst t={t} at={revealAt + 0.1} x={EX_WIDTH / 2} y={optionsTop + visual.answer * (OPTION_H + OPTION_GAP) + OPTION_H / 2} radius={320} count={18} />
      {Array.from({ length: visual.seconds }, (_, i) => <Sfx key={i} name="pop" at={f(askAt + i)} volume={0.22} />)}
      <Sfx name="ding" at={f(revealAt)} volume={0.35} />
    </>
  );
};
