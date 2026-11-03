import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { ReceiptVisualT } from "./visuals";

interface ReceiptSceneProps {
  scene: SceneTiming;
  visual: ReceiptVisualT;
}

const ROW_H = 104;
const PAD = 30;
const TOTAL_H = 110;
const STAMP_DELAY = 0.35;

const priceText = (currency: string, n: number): string => `${currency}${Math.round(n)}`;

/** Receipt card: rows slide in, price tags stamp on, total ticks up as each price lands. */
export const ReceiptScene: React.FC<ReceiptSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 100 : 20);
  const ats = visual.rows.map((r) => cue(r.cue) - 0.2);
  const total = visual.rows.reduce((sum, r, i) => sum + r.price * ease(t, ats[i] + STAMP_DELAY, 0.5), visual.startTotal);
  const cardH = PAD * 2 + visual.rows.length * ROW_H + TOTAL_H;
  const lastStamp = ats[ats.length - 1] + STAMP_DELAY;
  const totalPop = 1 + 0.08 * Math.sin(Math.PI * ease(t, lastStamp, 0.4));

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="file" text={visual.title} mono />
        </Centered>
      ) : null}
      <div
        style={{
          position: "absolute", left: GUTTER, top, width: CONTENT_W, height: cardH, boxSizing: "border-box", padding: PAD,
          borderRadius: 34, background: LIGHT.card, border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, ...enter(t, 0.05, 40),
        }}
      >
        {visual.rows.map((row, i) => {
          const at = ats[i];
          const slide = ease(t, at, 0.45);
          const stamp = back(t, at + STAMP_DELAY, 0.4);
          const free = row.price === 0;
          return (
            <div
              key={row.name}
              style={{
                height: ROW_H, display: "flex", alignItems: "center", gap: 22, borderBottom: `2px dashed ${LIGHT.line}`,
                opacity: slide, transform: `translateX(${(1 - slide) * 120}px)`,
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 20, background: LIGHT.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={row.icon ?? "sparkle"} size={36} color={LIGHT.green} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 42, letterSpacing: -1, color: LIGHT.ink }}>{row.name}</div>
                {row.role ? <div style={{ fontFamily: EX_FONTS.mono, fontSize: 22, color: LIGHT.sub }}>{row.role}</div> : null}
              </div>
              <div
                style={{
                  padding: "8px 22px", borderRadius: 16, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 40,
                  color: free ? LIGHT.green : "#7a4b00", background: free ? LIGHT.greenSoft : LIGHT.yellowSoft,
                  border: `3px solid ${free ? LIGHT.greenHl : LIGHT.yellow}`, opacity: ease(t, at + STAMP_DELAY, 0.15),
                  transform: `scale(${1.8 - 0.8 * stamp}) rotate(${-8 * stamp}deg)`,
                }}
              >
                {priceText(visual.currency, row.price)}
              </div>
            </div>
          );
        })}
        <div style={{ height: TOTAL_H, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10 }}>
          <div style={{ fontFamily: EX_FONTS.mono, fontSize: 28, letterSpacing: 4, color: LIGHT.sub }}>TOTAL / MONTH</div>
          <div
            style={{
              fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 72, letterSpacing: -2, color: LIGHT.ink,
              transform: `scale(${totalPop})`, transformOrigin: "100% 50%",
            }}
          >
            {priceText(visual.currency, total)}
          </div>
        </div>
      </div>
      {ats.map((at, i) => (
        <React.Fragment key={i}>
          <Sfx name="whoosh" at={f(Math.max(0, at))} volume={0.12} />
          <Sfx name="impact" at={f(at + STAMP_DELAY)} volume={0.22} />
        </React.Fragment>
      ))}
    </>
  );
};
