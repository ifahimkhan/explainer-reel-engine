import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, pop } from "../anim";
import { COLORS, FONTS, FPS, sec } from "../theme";
import { Box, Step } from "../types";
import { Sfx } from "./Sfx";

type StepState = "pending" | "active" | "done";

const stateAt = (t: number, start: number, done: number): StepState =>
  t >= done ? "done" : t >= start ? "active" : "pending";

const DOT_COLOR: Record<StepState, string> = {
  pending: "rgba(148,163,184,0.35)",
  active: COLORS.cyan,
  done: COLORS.green,
};

interface StepTrackerProps {
  steps: readonly Step[];
  /** Reel time (s) at which the parent Sequence starts. */
  from: number;
  panel: Box;
}

export const StepTracker: React.FC<StepTrackerProps> = ({ steps, from, panel }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS + from;
  const enter = pop(frame, 0);
  const out = fadeOut(frame, durationInFrames, 14);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);
  // Chime only for completions that land inside this sequence
  const chimes = steps
    .map((s) => sec(s.done - from))
    .filter((f) => f > 0 && f < durationInFrames - 10);

  return (
    <div
      style={{
        position: "absolute",
        ...panel,
        padding: "22px 26px",
        borderRadius: 24,
        background: COLORS.navyGlass,
        border: `2px solid rgba(34,211,238,0.35)`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        fontFamily: FONTS.display,
        opacity: enter * out,
        transform: `translateX(${(1 - enter) * 460}px)`,
      }}
    >
      <Sfx name="whoosh" volume={0.2} />
      {chimes.map((f) => (
        <Sfx key={f} name="ding" at={f} />
      ))}
      <div style={{ color: COLORS.muted, fontSize: 22, fontWeight: 800, letterSpacing: 4, marginBottom: 14 }}>
        WORKFLOW
      </div>
      {steps.map((step, i) => {
        const state = stateAt(t, step.start, step.done);
        const check = pop(frame, sec(step.done - from), 10);
        return (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0" }}>
            <div
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: DOT_COLOR[state],
                boxShadow: state === "active" ? `0 0 ${10 + pulse * 18}px ${COLORS.cyan}` : "none",
                color: COLORS.navy,
                fontSize: 24,
                fontWeight: 900,
                transform: state === "done" ? `scale(${0.7 + 0.3 * check})` : undefined,
              }}
            >
              {state === "done" ? "✓" : i + 1}
            </div>
            <div
              style={{
                color: state === "pending" ? COLORS.muted : COLORS.white,
                fontSize: 26,
                fontWeight: state === "active" ? 800 : 600,
                lineHeight: 1.2,
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
