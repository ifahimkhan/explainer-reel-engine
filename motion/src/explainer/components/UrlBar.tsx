import React from "react";
import { enter, range } from "../motion";
import { EX_FONTS, GUTTER, LAYOUT, LIGHT, SHADOW } from "../theme";
import { Icon } from "./Icon";

const DELETE_CPS = 22;
const TYPE_CPS = 16;

/** Seconds a morph from `from` to `to` takes. */
export const morphDuration = (from: string, to: string): number =>
  from.length / DELETE_CPS + to.length / TYPE_CPS;

/** The swapped segment text at time `t` (deletes old, then types new). */
const morphText = (from: string, to: string, t: number, at: number): string => {
  if (t < at) return from;
  const deleteEnd = at + from.length / DELETE_CPS;
  if (t < deleteEnd) return from.slice(0, Math.ceil(from.length - (t - at) * DELETE_CPS));
  return to.slice(0, Math.floor((t - deleteEnd) * TYPE_CPS));
};

interface UrlBarProps {
  t: number;
  /** Time the swap starts. */
  morphAt: number;
  prefix: string;
  from: string;
  to: string;
  suffix?: string;
  /** Optional time the old segment gets a yellow "this word" marker. */
  markAt?: number;
  enterAt?: number;
  top?: number;
}

export const UrlBar: React.FC<UrlBarProps> = ({
  t, morphAt, prefix, from, to, suffix = ".com/vercel/next.js", markAt, enterAt = 0, top = LAYOUT.urlTop,
}) => {
  const mid = morphText(from, to, t, morphAt);
  const morphEnd = morphAt + morphDuration(from, to);
  const done = range(t, [morphEnd - 0.1, morphEnd + 0.25], [0, 1]);
  const marked = markAt !== undefined && t >= markAt && t < morphAt;
  const typing = t >= morphAt && t < morphEnd + 0.4;
  const caretOn = typing && Math.floor(t * 4) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: GUTTER,
        right: GUTTER,
        height: 104,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 34px",
        borderRadius: 26,
        background: LIGHT.card,
        border: `3px solid ${done > 0 ? LIGHT.greenHl : LIGHT.line}`,
        boxShadow: `${SHADOW}, 0 0 0 ${10 * done}px ${LIGHT.greenGlow}`,
        fontFamily: EX_FONTS.mono,
        fontSize: 34,
        color: LIGHT.ink,
        ...enter(t, enterAt),
      }}
    >
      <Icon name="lock" size={32} color={done > 0 ? LIGHT.green : LIGHT.muted} />
      <span style={{ color: LIGHT.muted }}>https://</span>
      <span style={{ whiteSpace: "pre" }}>
        <span style={{ fontWeight: 700 }}>{prefix}</span>
        <span
          style={{
            fontWeight: 700,
            color: t >= morphAt ? LIGHT.green : LIGHT.ink,
            background: marked ? LIGHT.yellowSoft : "transparent",
            borderRadius: 8,
            padding: marked ? "2px 4px" : 0,
          }}
        >
          {mid}
        </span>
        <span style={{ display: "inline-block", width: 3, height: 40, marginBottom: -6, background: caretOn ? LIGHT.green : "transparent" }} />
        <span>{suffix}</span>
      </span>
    </div>
  );
};

interface TrickChipProps {
  t: number;
  text: string;
  at?: number;
}

/** Dark "TRICK n/5 · Name" label that sits above the URL bar. */
export const TrickChip: React.FC<TrickChipProps> = ({ t, text, at = 0 }) => (
  <div
    style={{
      position: "absolute",
      top: LAYOUT.chipTop,
      left: GUTTER,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 26px",
      borderRadius: 999,
      background: LIGHT.dark,
      color: "#fff",
      fontFamily: EX_FONTS.sans,
      fontWeight: 800,
      fontSize: 30,
      letterSpacing: -0.4,
      zIndex: 2,
      ...enter(t, at, 16),
    }}
  >
    <Icon name="github" size={30} />
    {text}
  </div>
);
