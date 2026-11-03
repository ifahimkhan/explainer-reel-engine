import React from "react";
import { ease, range } from "../../motion";
import { EX_FONTS, LIGHT } from "../../theme";

interface HeadlineProps {
  text: string;
  highlight?: string;
  t: number;
  at: number;
  fontSize: number;
  align?: "center" | "left";
  style?: React.CSSProperties;
}

/** Words rise in one after another; the highlight word gets a green box that wipes in. */
export const Headline: React.FC<HeadlineProps> = ({ text, highlight, t, at, fontSize, align = "center", style }) => (
  <div
    style={{
      textAlign: align, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize, lineHeight: 1.12,
      letterSpacing: -fontSize * 0.03, color: LIGHT.ink, ...style,
    }}
  >
    {text.split(" ").map((w, i) => {
      const wordAt = at + i * 0.08;
      const p = ease(t, wordAt, 0.45);
      const hl = highlight !== undefined && w.replace(/[^\w+]/g, "") === highlight;
      const wipe = hl ? ease(t, wordAt + 0.2, 0.35) : 0;
      return (
        <span key={i} style={{ display: "inline-block", marginRight: fontSize * 0.22, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
          <span
            style={{
              display: "inline-block", padding: hl ? `0 ${fontSize * 0.18}px` : 0, borderRadius: fontSize * 0.18,
              color: hl && wipe > 0.5 ? "#fff" : LIGHT.ink,
              background: hl ? `linear-gradient(90deg, ${LIGHT.greenHl} ${wipe * 100}%, transparent ${wipe * 100}%)` : "transparent",
            }}
          >
            {w}
          </span>
        </span>
      );
    })}
  </div>
);

interface BurstProps {
  t: number;
  at: number;
  x: number;
  y: number;
  radius?: number;
  count?: number;
}

const BURST_COLORS = [LIGHT.greenHl, LIGHT.yellow, LIGHT.cyan, "#f4966e"];

/** Confetti-like particles flying out from (x, y) at `at`. Deterministic per index. */
export const Burst: React.FC<BurstProps> = ({ t, at, x, y, radius = 260, count = 16 }) => {
  if (t < at || t > at + 1.2) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.2;
        const dist = radius * (0.7 + 0.3 * ((i * 37) % 10) / 10);
        const p = ease(t, at, 0.9);
        const fade = range(t, [at + 0.5, at + 1.1], [1, 0]);
        const size = 10 + (i % 3) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x + Math.cos(angle) * dist * p - size / 2, top: y + Math.sin(angle) * dist * p - size / 2,
              width: size, height: size, borderRadius: i % 3 === 0 ? 3 : size / 2, background: BURST_COLORS[i % BURST_COLORS.length],
              opacity: fade, transform: `rotate(${p * 180 * (i % 2 ? 1 : -1)}deg) scale(${1 - 0.4 * p})`,
            }}
          />
        );
      })}
    </>
  );
};

/** Gentle idle bob so settled elements never look frozen. */
export const bob = (t: number, i: number, amp = 6): number => Math.sin(t * 2.2 + i * 1.3) * amp;
