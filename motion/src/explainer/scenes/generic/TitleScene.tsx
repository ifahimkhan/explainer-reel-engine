import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { TitleVisualT } from "./visuals";

interface TitleSceneProps {
  scene: SceneTiming;
  visual: TitleVisualT;
}

/** Kicker pill, big headline with an optional highlighted word, optional sub pill on a cue. */
export const TitleScene: React.FC<TitleSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const words = visual.headline.split(" ");
  const subAt = visual.sub ? cue(visual.sub.cue) - 0.15 : 0;
  const iconP = back(t, 0.15, 0.6);

  return (
    <>
      {visual.icon ? (
        <Centered top={SPLIT_CONTENT.top + 10}>
          <div
            style={{
              width: 150, height: 150, borderRadius: 40, background: LIGHT.card, border: `3px solid ${LIGHT.line}`,
              boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center",
              opacity: ease(t, 0.1, 0.4), transform: `scale(${0.7 + 0.3 * iconP}) rotate(${(1 - iconP) * -12}deg)`,
            }}
          >
            <Icon name={visual.icon} size={84} color={LIGHT.green} stroke={1.8} />
          </div>
        </Centered>
      ) : null}
      <Centered top={SPLIT_CONTENT.top + 210} style={enter(t, 0.2)}>
        <Pill icon="sparkle" text={visual.kicker} mono />
      </Centered>
      <div
        style={{
          position: "absolute", top: SPLIT_CONTENT.top + 320, left: GUTTER, width: CONTENT_W, textAlign: "center",
          fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 96, lineHeight: 1.12, letterSpacing: -3, color: LIGHT.ink,
        }}
      >
        {words.map((w, i) => {
          const p = ease(t, 0.35 + i * 0.09, 0.45);
          const hl = visual.highlight !== undefined && w.replace(/[^\w]/g, "") === visual.highlight;
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 22, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
              <span
                style={{
                  display: "inline-block", padding: hl ? "0 18px" : 0, borderRadius: 18,
                  background: hl ? LIGHT.greenHl : "transparent", color: hl ? "#fff" : LIGHT.ink,
                }}
              >
                {w}
              </span>
            </span>
          );
        })}
      </div>
      {visual.sub ? (
        <Centered top={SPLIT_CONTENT.top + 600} style={enter(t, subAt)}>
          <Pill icon="arrowRight" text={visual.sub.text} tone="dark" />
        </Centered>
      ) : null}
      <Sfx name="impact" at={f(0.3)} volume={0.2} />
      {visual.sub ? <Sfx name="pop" at={f(subAt)} /> : null}
    </>
  );
};
