import React from "react";
import { Sfx } from "../../../../components/Sfx";
import { Icon } from "../../../components/Icon";
import { NEVER, back, ease } from "../../../motion";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT } from "../../../theme";
import { Burst } from "../fx";
import { CHAT_H, CHAT_TOP } from "./Chat";

export const TRACKER_TOP = CHAT_TOP + CHAT_H + 20;
const COLS = 4;
const GAP = 12;
const CHIP_H = 54;
export const TRACKER_H = CHIP_H * 2 + GAP;
const CHIP_W = (CONTENT_W - GAP * (COLS - 1)) / COLS;

interface TrackerProps {
  t: number;
  layers: { name: string; cue: string }[];
  warn: { index: number; cue: string }[];
  cue: (tag: string) => number;
  f: (s: number) => number;
}

/** Numbered layer chips (2 rows of 4): dashed until their cue, then they pop green; warned ones turn red. */
export const Tracker: React.FC<TrackerProps> = ({ t, layers, warn, cue, f }) => (
  <>
    {layers.map((layer, i) => {
      const at = cue(layer.cue) - 0.1;
      const warnAt = warn.find((w) => w.index === i)?.cue;
      const badAt = warnAt ? cue(warnAt) - 0.1 : NEVER;
      const lit = ease(t, at, 0.3);
      const pop = back(t, at, 0.5);
      const bad = ease(t, badAt, 0.3) > 0.5;
      const x = GUTTER + (i % COLS) * (CHIP_W + GAP);
      const y = TRACKER_TOP + Math.floor(i / COLS) * (CHIP_H + GAP);
      const on = lit > 0.5;
      const accent = bad ? LIGHT.red : LIGHT.greenHl;
      const shake = t > badAt && t < badAt + 0.5 ? Math.sin((t - badAt) * 60) * 6 : 0;
      return (
        <React.Fragment key={layer.name}>
          <div
            style={{
              position: "absolute", left: x, top: y, width: CHIP_W, height: CHIP_H, borderRadius: 16,
              display: "flex", alignItems: "center", gap: 10, padding: "0 14px", boxSizing: "border-box",
              background: on ? (bad ? "#fde8e8" : LIGHT.card) : "transparent",
              border: on ? `2px solid ${accent}` : `2px dashed ${LIGHT.muted}`,
              boxShadow: on && !bad ? `0 0 ${18 * (1 - ease(t, at + 0.4, 1.2))}px ${LIGHT.greenHl}` : "none",
              transform: `translateX(${shake}px) scale(${on ? 0.92 + 0.08 * pop : 1})`,
              opacity: ease(t, 0.15 + i * 0.05, 0.3) * (on ? 1 : 0.6),
            }}
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: on ? accent : "transparent", border: on ? "none" : `2px solid ${LIGHT.muted}`,
                fontFamily: EX_FONTS.mono, fontSize: 17, fontWeight: 700, color: on ? "#fff" : LIGHT.muted,
              }}
            >
              {on && !bad ? <Icon name="check" size={18} color="#fff" stroke={3.5} /> : i + 1}
            </div>
            <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 21, color: on ? LIGHT.ink : LIGHT.muted, whiteSpace: "nowrap" }}>
              {layer.name}
            </div>
          </div>
          <Burst t={t} at={at + 0.1} x={x + CHIP_W / 2} y={y + CHIP_H / 2} radius={110} count={10} />
          <Sfx name="ding" at={f(Math.max(0, at))} volume={0.22} />
          {badAt < NEVER ? <Sfx name="alert" at={f(badAt)} volume={0.25} /> : null}
        </React.Fragment>
      );
    })}
  </>
);
