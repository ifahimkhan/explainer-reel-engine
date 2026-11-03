import React from "react";
import { Sfx } from "../../../../components/Sfx";
import { Icon } from "../../../components/Icon";
import { NEVER, back, ease, range } from "../../../motion";
import { CONTENT_W, EX_FONTS, LIGHT, SHADOW } from "../../../theme";
import { DiagramProps, NotePill } from "./FlowDiagrams";

const BUBBLE_COLS = 8;
const BUBBLE_W = 96;
const BUBBLE_H = 38;
const BUBBLE_GAP = 10;

/** "hi" bubbles flood a grid, then the monthly bill counts down as each fix lands. */
export const BillView: React.FC<DiagramProps<"bill">> = ({ d, t, start, cue, f }) => {
  const floodAt = Math.max(start, cue(d.bubbles.cue) - 0.1);
  const gridW = BUBBLE_COLS * BUBBLE_W + (BUBBLE_COLS - 1) * BUBBLE_GAP;
  const gridLeft = (CONTENT_W - gridW) / 2;
  const billAt = cue(d.start.cue) - 0.1;
  const stepAts = d.steps.map((s) => cue(s.cue) - 0.1);
  let value = d.start.value;
  d.steps.forEach((s, i) => {
    value += (s.value - value) * ease(t, stepAts[i], 0.9);
  });
  const done = d.steps.length > 0 ? ease(t, stepAts[stepAts.length - 1] + 0.6, 0.3) : 0;
  const billPop = back(t, billAt, 0.5);
  const rows = Math.ceil(d.bubbles.count / BUBBLE_COLS);
  const billTop = rows * (BUBBLE_H + BUBBLE_GAP) + 14;
  return (
    <>
      {Array.from({ length: d.bubbles.count }, (_, i) => {
        const at = floodAt + i * 0.05;
        const p = back(t, at, 0.35);
        const cached = d.steps.length > 0 && i < d.bubbles.count - d.bubbles.keep && t > stepAts[0] + i * 0.02;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: gridLeft + (i % BUBBLE_COLS) * (BUBBLE_W + BUBBLE_GAP), top: Math.floor(i / BUBBLE_COLS) * (BUBBLE_H + BUBBLE_GAP),
              width: BUBBLE_W, height: BUBBLE_H, borderRadius: 19, background: cached ? LIGHT.greenSoft : LIGHT.ink, color: cached ? LIGHT.green : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 20,
              transform: `scale(${p})`, opacity: Math.min(1, p * 2),
            }}
          >
            {cached ? d.bubbles.flip : d.bubbles.text}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: billTop, textAlign: "center", transform: `scale(${billPop})`, opacity: Math.min(1, billPop * 2) }}>
        <div style={{ fontFamily: EX_FONTS.mono, fontSize: 20, letterSpacing: 2, color: LIGHT.sub, textTransform: "uppercase" }}>{d.kicker}</div>
        <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 92, lineHeight: 1.05, letterSpacing: -2, color: done > 0.5 ? LIGHT.green : LIGHT.red }}>
          {d.prefix}
          {Math.round(value).toLocaleString("en-US")}
          {d.suffix}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: billTop + 136, display: "flex", justifyContent: "center", gap: 14 }}>
        {d.steps.map((s, i) => {
          const p = back(t, stepAts[i], 0.45);
          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: LIGHT.greenSoft, border: `2px solid ${LIGHT.greenHl}`,
                fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 22, color: "#14532d", transform: `scale(${p})`, opacity: Math.min(1, p * 2),
              }}
            >
              <Icon name="check" size={20} color={LIGHT.green} stroke={3} />
              {s.chip}
            </div>
          );
        })}
      </div>
      <Sfx name="whoosh" at={f(floodAt)} volume={0.3} />
      <Sfx name="impact" at={f(billAt)} volume={0.3} />
      {stepAts.map((at, i) => <Sfx key={i} name="ding" at={f(at)} volume={0.25} />)}
    </>
  );
};

const BAR_H = 40;
const BAR_GAP = 10;
const BAR_COLORS = [LIGHT.cyan, LIGHT.greenHl, LIGHT.yellow, "#8b7cf6", "#f4966e"];

/** Request trace: bars slide in at their offsets like a waterfall, then evals tick to passed/total. */
export const TraceView: React.FC<DiagramProps<"trace">> = ({ d, t, start, cue, f }) => {
  const evalsAt = d.evals ? cue(d.evals.cue) - 0.1 : NEVER;
  const evalsTop = d.bars.length * (BAR_H + BAR_GAP) + 50;
  const passed = d.evals ? Math.round(range(t, [evalsAt, evalsAt + 1.2], [0, d.evals.passed])) : 0;
  const dots = 10;
  return (
    <>
      <div style={{ position: "absolute", left: 30, top: 0, fontFamily: EX_FONTS.mono, fontSize: 20, color: LIGHT.sub, opacity: ease(t, start, 0.3) }}>
        TRACE · request #48213
      </div>
      {d.bars.map((b, i) => {
        const at = Math.max(start, cue(b.cue) - 0.1);
        const p = ease(t, at, 0.5);
        const span = CONTENT_W - 60;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute", left: 30 + b.from * span, top: 36 + i * (BAR_H + BAR_GAP), width: Math.max(140, (b.to - b.from) * span) * p, height: BAR_H,
                borderRadius: 10, background: BAR_COLORS[i % BAR_COLORS.length], overflow: "hidden", whiteSpace: "nowrap",
                fontFamily: EX_FONTS.mono, fontSize: 20, fontWeight: 700, color: LIGHT.ink, display: "flex", alignItems: "center", paddingLeft: 12, boxSizing: "border-box",
              }}
            >
              {b.text}
            </div>
            <Sfx name="pop" at={f(at)} volume={0.2} />
          </React.Fragment>
        );
      })}
      {d.evals ? (
        <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: evalsTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: ease(t, evalsAt, 0.3) }}>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30, color: LIGHT.ink, marginRight: 6 }}>evals</div>
          {Array.from({ length: dots }, (_, i) => {
            const p = back(t, evalsAt + 0.1 + i * 0.1, 0.35);
            return (
              <div key={i} style={{ width: 30, height: 30, borderRadius: 15, background: LIGHT.greenHl, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p})` }}>
                <Icon name="check" size={18} color="#fff" stroke={3.5} />
              </div>
            );
          })}
          <div style={{ fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 26, color: LIGHT.green, marginLeft: 6 }}>
            {passed}/{d.evals.total} passed
          </div>
        </div>
      ) : null}
      {d.evals ? <Sfx name="ding" at={f(evalsAt + 1.2)} volume={0.3} /> : null}
    </>
  );
};

/** Quality chips light up; then they fade, a model swap lands, and a warning note pops. */
export const BadgesView: React.FC<DiagramProps<"badges">> = ({ d, t, start, cue, f }) => {
  const fadeAt = d.fade ? cue(d.fade.cue) - 0.1 : NEVER;
  const faded = ease(t, fadeAt, 0.6);
  const swapAt = d.swap ? cue(d.swap.cue) - 0.1 : NEVER;
  const swap = back(t, swapAt, 0.5);
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: 10, display: "flex", justifyContent: "center", gap: 14 }}>
        {d.chips.map((c, i) => {
          const at = Math.max(start, cue(c.cue) - 0.1);
          const p = back(t, at, 0.45);
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, boxShadow: SHADOW,
                  background: faded > 0.5 ? "#eceae5" : LIGHT.greenSoft, border: `2px solid ${faded > 0.5 ? LIGHT.muted : LIGHT.greenHl}`,
                  fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 27, color: faded > 0.5 ? LIGHT.muted : "#14532d",
                  transform: `scale(${p})`, opacity: Math.min(1, p * 2) * (1 - 0.4 * faded),
                }}
              >
                <Icon name="check" size={22} color={faded > 0.5 ? LIGHT.muted : LIGHT.green} stroke={3} />
                {c.text}
              </div>
              <Sfx name="pop" at={f(at)} volume={0.22} />
            </React.Fragment>
          );
        })}
      </div>
      {d.swap ? (
        <div style={{ position: "absolute", left: 0, width: CONTENT_W, top: 110, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, transform: `scale(${swap})`, opacity: Math.min(1, swap * 2) }}>
          <div style={{ padding: "14px 26px", borderRadius: 16, border: `2px solid ${LIGHT.ink}`, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 28, color: LIGHT.ink, background: LIGHT.card }}>
            {d.swap.from}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 44, height: 5, borderRadius: 3, background: LIGHT.red }} />
            <div style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: `16px solid ${LIGHT.red}` }} />
          </div>
          <div style={{ padding: "14px 26px", borderRadius: 16, border: `2px solid ${LIGHT.red}`, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 28, color: "#9b1c1f", background: "#fde8e8" }}>
            {d.swap.to}
          </div>
        </div>
      ) : null}
      {d.swap ? <Sfx name="whoosh" at={f(swapAt)} volume={0.3} /> : null}
      {d.note ? <NotePill note={d.note} t={t} at={cue(d.note.cue) - 0.1} top={220} f={f} /> : null}
    </>
  );
};
