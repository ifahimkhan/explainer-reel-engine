import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter, range } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { ChartVisualT } from "./visuals";

interface ChartSceneProps {
  scene: SceneTiming;
  visual: ChartVisualT;
}

const W = CONTENT_W;
const H = 620;
const PAD = { left: 84, right: 34, top: 40, bottom: 46 } as const;
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const GRID_LINES = 4;
const DROP_FLASH_S = 0.6;

/** Live line chart: a pen draws the series between two cues; big drops flash a label (e.g. "GC"). */
export const ChartScene: React.FC<ChartSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 100 : 20);
  const { points, yMax } = visual;
  const n = points.length;
  const startAt = visual.start ? cue(visual.start) - 0.1 : 0.4;
  const endAt = cue(visual.end);
  const pen = range(t, [startAt, endAt], [0, n - 1]);
  const xOf = (i: number): number => PAD.left + (i / (n - 1)) * PLOT_W;
  const yOf = (v: number): number => PAD.top + PLOT_H * (1 - Math.min(v, yMax) / yMax);
  const timeOf = (i: number): number => startAt + (i / (n - 1)) * (endAt - startAt);

  const whole = Math.floor(pen);
  const frac = pen - whole;
  const drawn = points.slice(0, whole + 1).map((v, i) => [xOf(i), yOf(v)] as const);
  const tipValue = whole < n - 1 ? points[whole] + (points[whole + 1] - points[whole]) * frac : points[n - 1];
  const tip = [xOf(pen), yOf(tipValue)] as const;
  const line = [...drawn, tip].map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${tip[0].toFixed(1)},${PAD.top + PLOT_H} L${PAD.left},${PAD.top + PLOT_H} Z`;

  const dropMin = visual.dropMin ?? yMax * 0.15;
  const drops = points.flatMap((v, i) => (i > 0 && points[i - 1] - v >= dropMin ? [i] : []));
  const limitHit = visual.limit !== undefined && tipValue >= visual.limit.value;
  const accent = limitHit ? LIGHT.red : LIGHT.greenHl;

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="signal" text={visual.title} mono />
        </Centered>
      ) : null}
      <div
        style={{
          position: "absolute", left: GUTTER, top, width: W, height: H, borderRadius: 30, background: LIGHT.card,
          border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, overflow: "hidden", ...enter(t, 0.1, 40),
        }}
      >
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const v = (yMax / GRID_LINES) * i;
            const y = yOf(v);
            return (
              <g key={i}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={LIGHT.line} strokeWidth={2} />
                <text x={PAD.left - 14} y={y + 8} textAnchor="end" fontFamily={EX_FONTS.mono} fontSize={22} fill={LIGHT.muted}>
                  {Math.round(v)}
                </text>
              </g>
            );
          })}
          {visual.limit ? (
            <g opacity={ease(t, startAt, 0.4)}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yOf(visual.limit.value)} y2={yOf(visual.limit.value)} stroke={LIGHT.red} strokeWidth={3} strokeDasharray="14 10" />
              <text x={W - PAD.right - 6} y={yOf(visual.limit.value) - 12} textAnchor="end" fontFamily={EX_FONTS.mono} fontSize={22} fontWeight={700} fill={LIGHT.red}>
                {visual.limit.label}
              </text>
            </g>
          ) : null}
          {pen > 0 ? <path d={area} fill="url(#chartFill)" /> : null}
          {pen > 0 ? <path d={line} fill="none" stroke={accent} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" /> : null}
          {drops.map((i) => {
            const flash = range(t, [timeOf(i), timeOf(i) + DROP_FLASH_S], [1, 0]);
            return flash > 0 && t >= timeOf(i) ? (
              <rect key={i} x={xOf(i) - 14} y={PAD.top} width={28} height={PLOT_H} rx={14} fill={LIGHT.greenHl} opacity={0.25 * flash} />
            ) : null;
          })}
          {pen > 0 ? <circle cx={tip[0]} cy={tip[1]} r={12} fill={accent} stroke="#fff" strokeWidth={4} /> : null}
        </svg>
        {drops.map((i) => {
          const p = back(t, timeOf(i), 0.4);
          if (t < timeOf(i)) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: xOf(i) - 100, top: yOf(points[i]) + 18, width: 200, textAlign: "center", whiteSpace: "nowrap",
                transform: `scale(${p})`, opacity: Math.min(1, p * 2),
              }}
            >
              <span style={{ padding: "4px 14px", borderRadius: 999, background: LIGHT.ink, color: "#fff", fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 24 }}>
                {visual.dropLabel}
              </span>
            </div>
          );
        })}
        {pen > 0 ? (
          <div
            style={{
              position: "absolute", left: Math.min(tip[0] + 20, W - 190), top: Math.max(8, tip[1] - 64), padding: "6px 16px", borderRadius: 14,
              background: accent, color: "#fff", fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 28, whiteSpace: "nowrap",
            }}
          >
            {tipValue.toFixed(visual.decimals)} {visual.unit}
          </div>
        ) : null}
      </div>
      {visual.note ? (
        <Centered top={top + H + 34} style={enter(t, cue(visual.note.cue) - 0.2)}>
          <Pill icon="check" text={visual.note.text} tone="dark" />
        </Centered>
      ) : null}
      <Sfx name="type" at={f(startAt)} volume={0.12} />
      {drops.map((i) => <Sfx key={i} name="pop" at={f(timeOf(i))} volume={0.28} />)}
      {visual.note ? <Sfx name="ding" at={f(Math.max(0, cue(visual.note.cue) - 0.2))} volume={0.25} /> : null}
    </>
  );
};
