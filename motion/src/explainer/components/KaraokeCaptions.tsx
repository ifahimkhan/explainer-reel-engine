import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { back, ease, range } from "../motion";
import type { Chunk, Timeline } from "../timeline";
import { CONTENT_W, EX_FONTS, GUTTER, LAYOUT, LIGHT } from "../theme";

const WORD_FADE_S = 0.18;
/** How long a finished chunk lingers when the next one starts later. */
const HOLD_S = 0.6;
/** Peak extra scale of a highlighted word as it lands. */
const HL_POP = 0.16;
/** Words that carry a number (500, ₹500, 25x, 4MB, 1,000) get their own colour so stats jump out. */
const NUMBER = /\d/;

/** 0 -> peak -> 0 bump over `dur` seconds after `at`. */
const bump = (t: number, at: number, dur: number): number => Math.sin(Math.PI * range(t, [at, at + dur], [0, 1]));

const BOXED: React.CSSProperties = {
  // Sized to the chunk's laid-out text (hidden words included, so the card never resizes mid-chunk).
  maxWidth: CONTENT_W,
  boxSizing: "border-box",
  padding: "22px 30px 18px",
  borderRadius: 30,
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 18px 50px rgba(15,17,21,0.18)",
  border: `2px solid ${LIGHT.line}`,
  fontSize: 56,
};

interface KaraokeCaptionsProps {
  timeline: Timeline;
  top?: number;
  /** Draw the chunk on a white card (used over video / on the split seam). */
  boxed?: boolean;
}

/**
 * One caption chunk at a time. Every word of the chunk is laid out up front
 * (so lines never reflow) and fades in as it is spoken; highlights get a green box.
 */
export const KaraokeCaptions: React.FC<KaraokeCaptionsProps> = ({ timeline, top = LAYOUT.captionTop, boxed = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const chunks: Chunk[] = timeline.scenes.flatMap((sc) => sc.sentences.flatMap((s) => s.chunks));
  const active = chunks.find((c, i) => {
    const next = chunks[i + 1];
    const until = next ? Math.min(next.start, c.end + HOLD_S) : c.end + HOLD_S;
    return t >= c.start - 0.05 && t < until;
  });
  if (!active) return null;
  const cardIn = ease(t, active.start - 0.12, 0.15);

  return (
    <div style={{ position: "absolute", top, left: GUTTER, width: CONTENT_W, display: "flex", justifyContent: "center", zIndex: 5 }}>
    <div
      style={{
        textAlign: "center",
        fontFamily: EX_FONTS.sans,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.3,
        letterSpacing: -1.6,
        color: LIGHT.ink,
        ...(boxed ? { ...BOXED, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 12}px)` } : {}),
      }}
    >
      {active.words.map((w, i) => {
        const shown = ease(t, w.start - 0.04, WORD_FADE_S);
        const settled = range(t, [w.start, w.start + 0.25], [0, 1]);
        const box = w.hl ? ease(t, w.start, 0.22) : 0;
        const isNumber = !w.hl && NUMBER.test(w.text);
        const pop = w.hl ? 1 + HL_POP * bump(t, w.start, 0.32) : isNumber ? 0.9 + 0.1 * back(t, w.start - 0.04, 0.35) : 1;
        return (
          <span
            key={`${active.start}-${i}`}
            style={{
              display: "inline-block",
              marginRight: 16,
              opacity: shown,
              transform: `translateY(${(1 - shown) * 14}px)`,
              color: w.hl ? "#fff" : isNumber ? LIGHT.green : settled < 1 ? `rgba(15,17,21,${0.45 + 0.55 * settled})` : LIGHT.ink,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: w.hl ? "0 12px" : 0,
                borderRadius: 12,
                background: w.hl ? `rgba(34,163,90,${box})` : "transparent",
                color: w.hl && box < 0.5 ? LIGHT.ink : undefined,
                transform: `scale(${pop})`,
              }}
            >
              {w.text}
            </span>
            {w.tail}
          </span>
        );
      })}
    </div>
    </div>
  );
};
