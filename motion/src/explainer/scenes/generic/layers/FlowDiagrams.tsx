import React from "react";
import { Sfx } from "../../../../components/Sfx";
import { Icon } from "../../../components/Icon";
import { back, ease, typed } from "../../../motion";
import { CONTENT_W, EX_FONTS, LIGHT, SHADOW } from "../../../theme";
import { Headline } from "../fx";
import type { DiagramT, NodeT, NoteT } from "./schema";

/** Shared props for every diagram: scene time, its start, and cue lookup (scene-relative seconds). */
export interface DiagramProps<K extends DiagramT["kind"]> {
  d: Extract<DiagramT, { kind: K }>;
  t: number;
  start: number;
  cue: (tag: string) => number;
  f: (s: number) => number;
}

const TONE = {
  good: { border: LIGHT.greenHl, bg: LIGHT.greenSoft, ink: "#14532d" },
  bad: { border: LIGHT.red, bg: "#fde8e8", ink: "#9b1c1f" },
  neutral: { border: LIGHT.line, bg: LIGHT.card, ink: LIGHT.ink },
} as const;

/** Time a cued element appears: its cue, else staggered after the diagram start. */
export const atOf = (cue: (tag: string) => number, start: number, tag: string | undefined, i: number): number =>
  tag ? Math.max(start, cue(tag) - 0.1) : start + 0.15 + i * 0.12;

export const NotePill: React.FC<{ note: NoteT; t: number; at: number; top: number; f: (s: number) => number }> = ({ note, t, at, top, f }) => {
  const p = back(t, at, 0.45);
  const tone = TONE[note.tone ?? "neutral"];
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: CONTENT_W, top, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            padding: "12px 28px", borderRadius: 999, background: note.tone ? tone.border : LIGHT.ink, color: "#fff",
            fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30, transform: `scale(${p})`, opacity: Math.min(1, p * 2), whiteSpace: "nowrap",
          }}
        >
          {note.text}
        </div>
      </div>
      <Sfx name={note.tone === "bad" ? "alert" : "ding"} at={f(at)} volume={0.25} />
    </>
  );
};

const NodeBox: React.FC<{ node: NodeT; t: number; at: number; x: number; y: number; w: number; h: number }> = ({ node, t, at, x, y, w, h }) => {
  const p = back(t, at, 0.5);
  const tone = TONE[node.tone ?? "neutral"];
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, boxSizing: "border-box",
        background: tone.bg, border: `2.5px solid ${tone.border}`, boxShadow: SHADOW,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        transform: `scale(${p})`, opacity: Math.min(1, p * 2),
      }}
    >
      {node.icon ? <Icon name={node.icon} size={34} color={node.tone ? tone.border : LIGHT.ink} stroke={2.2} /> : null}
      <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 25, color: tone.ink, textAlign: "center", lineHeight: 1.1 }}>{node.text}</div>
      {node.sub ? <div style={{ fontFamily: EX_FONTS.mono, fontSize: 17, color: LIGHT.sub, textAlign: "center" }}>{node.sub}</div> : null}
    </div>
  );
};

/** Horizontal arrow that draws from (x1) to (x2) at height y. */
const Arrow: React.FC<{ x1: number; x2: number; y: number; p: number; bad?: boolean }> = ({ x1, x2, y, p, bad }) => {
  const color = bad ? LIGHT.red : LIGHT.sub;
  const len = (x2 - x1) * p;
  return (
    <>
      <div style={{ position: "absolute", left: x1, top: y - 2, width: len, height: 4, borderRadius: 2, background: color }} />
      {p > 0.9 ? (
        <div style={{ position: "absolute", left: x2 - 12, top: y - 9, width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: `14px solid ${color}` }} />
      ) : null}
    </>
  );
};

export const BigView: React.FC<DiagramProps<"big">> = ({ d, t, start, f }) => {
  const bad = d.tone === "bad";
  const p = back(t, start, 0.55);
  const shake = bad && t > start + 0.3 && t < start + 0.7 ? Math.sin((t - start) * 60) * 10 : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: 40, transform: `translateX(${shake}px)` }}>
        {d.highlight || !bad ? (
          <Headline text={d.text} highlight={d.highlight} t={t} at={start} fontSize={84} />
        ) : (
          <div
            style={{
              textAlign: "center", fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 104, letterSpacing: -3, color: LIGHT.red,
              fontStyle: "italic", transform: `scale(${p})`, opacity: Math.min(1, p * 2),
            }}
          >
            {d.text}
          </div>
        )}
        {d.sub ? (
          <div style={{ marginTop: 18, textAlign: "center", fontFamily: EX_FONTS.sans, fontWeight: 600, fontSize: 32, color: LIGHT.sub, opacity: ease(t, start + 0.4, 0.4) }}>
            {d.sub}
          </div>
        ) : null}
      </div>
      <Sfx name={bad ? "impact" : "whoosh"} at={f(start)} volume={0.3} />
    </>
  );
};

export const FlowView: React.FC<DiagramProps<"flow">> = ({ d, t, start, cue, f }) => {
  const n = d.nodes.length;
  const gap = n > 3 ? 34 : 70;
  const w = Math.min(260, (CONTENT_W - gap * (n - 1)) / n);
  const total = w * n + gap * (n - 1);
  const left = (CONTENT_W - total) / 2;
  const top = d.title ? 56 : 30;
  const h = 130;
  const ats = d.nodes.map((node, i) => atOf(cue, start, node.cue, i));
  return (
    <>
      {d.title ? (
        <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: 0, textAlign: "center", fontFamily: EX_FONTS.mono, fontSize: 24, letterSpacing: 2, color: LIGHT.sub, textTransform: "uppercase", opacity: ease(t, start, 0.4) }}>
          {d.title}
        </div>
      ) : null}
      {d.nodes.map((node, i) => {
        const x = left + i * (w + gap);
        return (
          <React.Fragment key={i}>
            {i > 0 ? <Arrow x1={x - gap + 4} x2={x - 4} y={top + h / 2} p={ease(t, ats[i] - 0.15, 0.3)} bad={node.tone === "bad"} /> : null}
            <NodeBox node={node} t={t} at={ats[i]} x={x} y={top} w={w} h={h} />
            {node.cue ? <Sfx name="pop" at={f(ats[i])} volume={0.25} /> : null}
          </React.Fragment>
        );
      })}
      {d.note ? <NotePill note={d.note} t={t} at={cue(d.note.cue) - 0.1} top={top + h + 34} f={f} /> : null}
    </>
  );
};

export const HubView: React.FC<DiagramProps<"hub">> = ({ d, t, start, cue, f }) => {
  const cw = 280;
  const ch = 96;
  const cAt = atOf(cue, start, d.center.cue, 0);
  const n = d.spokes.length;
  const sw = 200;
  const sGap = (CONTENT_W - sw * n) / (n + 1);
  const sTop = 140;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={CONTENT_W} height={sTop}>
        {d.spokes.map((s, i) => {
          const at = atOf(cue, start, s.cue, i + 1);
          const x = sGap + i * (sw + sGap) + sw / 2;
          const p = ease(t, at - 0.2, 0.3);
          const x0 = CONTENT_W / 2;
          return <line key={i} x1={x0} y1={ch} x2={x0 + (x - x0) * p} y2={ch + (sTop - ch) * p} stroke={LIGHT.greenHl} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-t * 40} />;
        })}
      </svg>
      <NodeBox node={d.center} t={t} at={cAt} x={(CONTENT_W - cw) / 2} y={0} w={cw} h={ch} />
      {d.spokes.map((s, i) => {
        const at = atOf(cue, start, s.cue, i + 1);
        return (
          <React.Fragment key={i}>
            <NodeBox node={s} t={t} at={at} x={sGap + i * (sw + sGap)} y={sTop} w={sw} h={90} />
            {s.cue ? <Sfx name="pop" at={f(at)} volume={0.25} /> : null}
          </React.Fragment>
        );
      })}
      {d.note ? <NotePill note={d.note} t={t} at={cue(d.note.cue) - 0.1} top={sTop + 106} f={f} /> : null}
    </>
  );
};

export const CodeView: React.FC<DiagramProps<"code">> = ({ d, t, start, cue, f }) => (
  <>
    <div
      style={{
        position: "absolute", left: 40, width: CONTENT_W - 80, top: 10, borderRadius: 22, padding: "24px 30px", boxSizing: "border-box",
        background: "#16181d", fontFamily: EX_FONTS.mono, fontSize: 26, lineHeight: 1.5, color: "#d7dae0", whiteSpace: "pre-wrap",
        boxShadow: SHADOW, opacity: ease(t, start, 0.3), transform: `translateY(${(1 - ease(t, start, 0.4)) * 30}px)`,
      }}
    >
      <span style={{ color: LIGHT.greenHl }}>system: </span>
      {typed(d.text, t, start + 0.3, 40)}
    </div>
    <Sfx name="type" at={f(start + 0.3)} volume={0.2} />
    {d.note ? <NotePill note={d.note} t={t} at={cue(d.note.cue) - 0.1} top={200} f={f} /> : null}
  </>
);
