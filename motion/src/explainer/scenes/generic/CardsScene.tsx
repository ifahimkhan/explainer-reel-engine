import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { bob } from "./fx";
import type { CardsVisualT } from "./visuals";

interface CardsSceneProps {
  scene: SceneTiming;
  visual: CardsVisualT;
}

const GAP = 30;
const CARD_W = (CONTENT_W - GAP) / 2;
const CARD_H = 290;

/** Cards flip up into a 2-column grid on their cues; the newest one glows. */
export const CardsScene: React.FC<CardsSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 110 : 40);
  const ats = visual.cards.map((c) => cue(c.cue) - 0.25);
  const newest = ats.reduce((acc, at, i) => (t >= at ? i : acc), -1);
  const odd = visual.cards.length % 2 === 1;

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="grid" text={visual.title} mono />
        </Centered>
      ) : null}
      {visual.cards.map((card, i) => {
        const at = ats[i];
        const flip = back(t, at, 0.6);
        const lastAlone = odd && i === visual.cards.length - 1;
        const left = lastAlone ? GUTTER + (CONTENT_W - CARD_W) / 2 : GUTTER + (i % 2) * (CARD_W + GAP);
        const active = i === newest;
        const iconPop = back(t, at + 0.2, 0.5);
        return (
          <div key={card.title} style={{ position: "absolute", left, top: top + Math.floor(i / 2) * (CARD_H + GAP), width: CARD_W, height: CARD_H, perspective: 1200 }}>
            <div
              style={{
                width: "100%", height: "100%", boxSizing: "border-box", padding: 34, borderRadius: 34, background: LIGHT.card,
                border: `3px solid ${active ? LIGHT.greenHl : LIGHT.line}`,
                boxShadow: active ? `0 0 0 10px ${LIGHT.greenGlow}, ${SHADOW}` : SHADOW,
                opacity: ease(t, at, 0.25), transformOrigin: "50% 100%",
                transform: `rotateX(${(1 - flip) * 70}deg) translateY(${t >= at + 0.6 ? bob(t, i, 5) : 0}px) scale(${active ? 1.03 : 1})`,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: 96, height: 96, borderRadius: 28, background: active ? LIGHT.greenHl : LIGHT.greenSoft,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: `scale(${iconPop}) rotate(${(1 - iconPop) * -20}deg)`,
                }}
              >
                <Icon name={card.icon} size={54} color={active ? "#fff" : LIGHT.green} stroke={2} />
              </div>
              <div>
                <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 50, letterSpacing: -1.5, color: LIGHT.ink }}>{card.title}</div>
                {card.sub ? (
                  <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, color: LIGHT.sub, marginTop: 6, opacity: ease(t, at + 0.35, 0.3) }}>{card.sub}</div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      {ats.map((at, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, at))} />
      ))}
    </>
  );
};
