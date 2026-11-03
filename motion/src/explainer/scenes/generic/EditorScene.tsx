import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { NEVER, back, ease, enter, typed } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, EX_WIDTH, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { EditorVisualT } from "./visuals";

interface EditorSceneProps {
  scene: SceneTiming;
  visual: EditorVisualT;
}

const CPS = 22;
const FONT = 34;
const LINE_H = 56;
const HEADER_H = 72;
const BODY_PAD = 26;
const GROW_S = 0.18;

const KEY_COLOR = "#0b6bcb";
const STRING_COLOR = "#c2410c";
const COMMENT_COLOR = "#6a8a5a";

/** Tiny JSON/markdown colouring: quoted keys blue, quoted values orange, `#` lines muted. */
const Highlighted: React.FC<{ text: string }> = ({ text }) => {
  if (text.trimStart().startsWith("#")) return <span style={{ color: COMMENT_COLOR }}>{text}</span>;
  const parts = text.split(/("(?:[^"\\]|\\.)*"?)/);
  return (
    <>
      {parts.map((p, i) => {
        if (!p.startsWith('"')) return <span key={i}>{p}</span>;
        const isKey = (parts[i + 1] ?? "").trimStart().startsWith(":");
        return <span key={i} style={{ color: isKey ? KEY_COLOR : STRING_COLOR }}>{p}</span>;
      })}
    </>
  );
};

/** Start time of each line: un-cued lines are there early, cued lines type one after another per cue. */
const lineStarts = (visual: EditorVisualT, cue: (tag: string) => number): number[] => {
  const nextFree = new Map<string, number>();
  return visual.lines.map((line, i) => {
    if (!line.cue) return 0.15 + i * 0.05;
    const at = nextFree.get(line.cue) ?? Math.max(0.3, cue(line.cue) - 0.25);
    nextFree.set(line.cue, at + Math.max(0.15, line.text.trim().length / CPS) + 0.05);
    return at;
  });
};

/** Light code editor card that types lines in on cues; optional strike-out, toast and note. */
export const EditorScene: React.FC<EditorSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + 40;
  const starts = lineStarts(visual, cue);
  const strikeAt = visual.strike ? cue(visual.strike.cue) - 0.1 : NEVER;
  const toastAt = visual.toast ? cue(visual.toast.cue) - 0.1 : NEVER;
  const noteAt = visual.note ? cue(visual.note.cue) - 0.15 : NEVER;
  const struck = ease(t, strikeAt, 0.5);
  const shake = t > strikeAt && t < strikeAt + 0.45 ? Math.sin((t - strikeAt) * 60) * 10 * (1 - (t - strikeAt) / 0.45) : 0;
  const heights = starts.map((s, i) => (visual.lines[i].cue ? LINE_H * ease(t, s - GROW_S, GROW_S) : LINE_H));
  const cardH = HEADER_H + BODY_PAD * 2 + heights.reduce((a, b) => a + b, 0);
  const typingLine = starts.findIndex((s, i) => visual.lines[i].cue && t >= s && t < s + visual.lines[i].text.length / CPS + 0.4);
  const cursorOn = Math.floor(t * 2.5) % 2 === 0;
  const xMark = back(t, strikeAt + 0.35, 0.45);
  const toast = back(t, toastAt, 0.45);

  return (
    <>
      <div
        style={{
          position: "absolute", left: GUTTER, top, width: CONTENT_W, height: cardH, borderRadius: 28, overflow: "hidden",
          background: LIGHT.card, border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, ...enter(t, 0.05, 40),
          translate: `${shake}px 0`, filter: `saturate(${1 - 0.6 * struck})`,
        }}
      >
        <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", borderBottom: `2px solid ${LIGHT.line}`, background: "#fafaf8" }}>
          <Icon name="file" size={28} color={LIGHT.sub} />
          <div style={{ fontFamily: EX_FONTS.mono, fontSize: 26, color: LIGHT.sub }}>{visual.file}</div>
        </div>
        <div style={{ padding: `${BODY_PAD}px 28px`, fontFamily: EX_FONTS.mono, fontSize: FONT, whiteSpace: "pre", color: LIGHT.ink }}>
          {visual.lines.map((line, i) => {
            const s = starts[i];
            const text = line.cue ? typed(line.text, t, s, CPS) : line.text;
            const glow = line.hl ? ease(t, s + line.text.length / CPS, 0.4) : 0;
            const strike = ease(t, strikeAt + i * 0.08, 0.3);
            return (
              <div
                key={i}
                style={{
                  position: "relative", height: heights[i], overflow: "hidden", display: "flex", alignItems: "center",
                  opacity: line.cue ? 1 : ease(t, s, 0.3),
                }}
              >
                <div
                  style={{
                    position: "absolute", left: -14, right: -14, top: 3, bottom: 3, borderRadius: 10,
                    background: LIGHT.greenSoft, border: `2px solid ${LIGHT.greenHl}`, opacity: glow,
                  }}
                />
                <span style={{ position: "relative", width: 52, color: LIGHT.muted, fontSize: 24 }}>{i + 1}</span>
                <span style={{ position: "relative" }}>
                  <Highlighted text={text} />
                  {i === typingLine && cursorOn ? <span style={{ color: LIGHT.greenHl }}>▋</span> : null}
                  {text.trim() ? (
                    <span
                      style={{
                        position: "absolute", left: -6, top: "52%", height: 5, borderRadius: 3, background: LIGHT.red,
                        width: `calc(${strike * 100}% + 12px)`, opacity: strike > 0 ? 1 : 0,
                      }}
                    />
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {visual.strike ? (
        <div
          style={{
            position: "absolute", left: EX_WIDTH / 2 - 80, top: top + cardH / 2 - 80, width: 160, height: 160, borderRadius: 80,
            background: LIGHT.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW,
            fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 110, color: "#fff", lineHeight: 1,
            opacity: ease(t, strikeAt + 0.35, 0.1), transform: `scale(${xMark}) rotate(${(1 - xMark) * -40}deg)`,
          }}
        >
          ✕
        </div>
      ) : null}
      {visual.toast ? (
        <div
          style={{
            position: "absolute", right: GUTTER + 24, top: top + cardH - 36, display: "flex", alignItems: "center", gap: 12,
            padding: "14px 26px", borderRadius: 999, background: LIGHT.dark, color: "#fff", boxShadow: SHADOW,
            fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 32, transform: `scale(${toast})`, transformOrigin: "100% 50%",
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 8, background: LIGHT.greenHl }} />
          {visual.toast.text}
        </div>
      ) : null}
      {visual.note ? (
        <Centered top={top + cardH + 80} style={enter(t, noteAt)}>
          <Pill icon="check" text={visual.note.text} tone="dark" style={{ fontSize: 36 }} />
        </Centered>
      ) : null}
      {visual.lines.some((l) => l.cue) ? <Sfx name="type" at={f(Math.min(...starts.filter((_, i) => visual.lines[i].cue)))} volume={0.22} /> : null}
      {visual.strike ? <Sfx name="alert" at={f(strikeAt + 0.35)} volume={0.3} /> : null}
      {visual.toast ? <Sfx name="ding" at={f(toastAt)} volume={0.3} /> : null}
      {visual.note ? <Sfx name="pop" at={f(noteAt)} /> : null}
    </>
  );
};
