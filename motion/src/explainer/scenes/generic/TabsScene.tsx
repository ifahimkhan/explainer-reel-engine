import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { TabsVisualT } from "./visuals";

interface TabsSceneProps {
  scene: SceneTiming;
  visual: TabsVisualT;
}

const BAR_W = 760;
const BAR_H = 96;
const SLIDE_S = 0.4;

/** Segmented control: the active pill slides to each tab on its cue and swaps the value card + tree. */
export const TabsScene: React.FC<TabsSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const ats = visual.tabs.map((tab) => cue(tab.cue) - 0.2);
  const top = SPLIT_CONTENT.top + (visual.title ? 110 : 20);
  const tabW = (BAR_W - 16) / visual.tabs.length;
  // Continuous position of the active pill: 0 before/at first cue, slides to i at each later cue.
  const pos = ats.slice(1).reduce((p, at) => p + ease(t, at, SLIDE_S), 0);
  const shown = ease(t, ats[0], 0.3);
  const cardTop = top + BAR_H + 60;

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="file" text={visual.title} mono />
        </Centered>
      ) : null}
      <Centered top={top} style={enter(t, 0.15)}>
        <div style={{ position: "relative", width: BAR_W, height: BAR_H, borderRadius: 999, background: "#e9e7e1", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06)" }}>
          <div
            style={{
              position: "absolute", top: 8, left: 8 + pos * tabW, width: tabW, height: BAR_H - 16, borderRadius: 999,
              background: LIGHT.dark, boxShadow: SHADOW, opacity: shown,
            }}
          />
          {visual.tabs.map((tab, i) => {
            const active = 1 - Math.min(1, Math.abs(pos - i));
            return (
              <div
                key={tab.name}
                style={{
                  position: "absolute", top: 8, left: 8 + i * tabW, width: tabW, height: BAR_H - 16, display: "flex",
                  alignItems: "center", justifyContent: "center", fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 30,
                  letterSpacing: 3, color: active * shown > 0.5 ? "#fff" : LIGHT.sub,
                }}
              >
                {tab.name.toUpperCase()}
              </div>
            );
          })}
        </div>
      </Centered>
      {visual.tabs.map((tab, i) => {
        const inP = ease(t, ats[i], SLIDE_S);
        const outP = i + 1 < ats.length ? ease(t, ats[i + 1], SLIDE_S) : 0;
        const x = (1 - inP) * 700 - outP * 700;
        return (
          <div
            key={tab.name}
            style={{ position: "absolute", left: GUTTER, top: cardTop, width: CONTENT_W, opacity: inP * (1 - outP), transform: `translateX(${x}px)` }}
          >
            <div
              style={{
                borderRadius: 28, background: LIGHT.dark, boxShadow: SHADOW, padding: "26px 34px",
                border: `2px solid ${LIGHT.darkLine}`,
              }}
            >
              <div style={{ fontFamily: EX_FONTS.mono, fontSize: 22, letterSpacing: 4, color: LIGHT.muted }}>{tab.name.toUpperCase()}</div>
              <div style={{ fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 46, color: "#fff", marginTop: 8 }}>{tab.value}</div>
            </div>
            {tab.tree ? (
              <div
                style={{
                  marginTop: 34, marginLeft: 60, display: "inline-block", padding: "24px 34px", borderRadius: 24, background: LIGHT.card,
                  border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW,
                }}
              >
                {tab.tree.map((row, j) => {
                  const p = ease(t, ats[i] + 0.35 + j * 0.15, 0.3);
                  const leaf = j === tab.tree!.length - 1;
                  return (
                    <div
                      key={j}
                      style={{
                        display: "flex", alignItems: "center", gap: 14, fontFamily: EX_FONTS.mono, fontSize: 34, lineHeight: 1.6,
                        whiteSpace: "pre", color: leaf ? LIGHT.green : LIGHT.ink, fontWeight: leaf ? 700 : 400,
                        opacity: p, transform: `translateX(${(1 - p) * -30}px)`,
                      }}
                    >
                      <Icon name={leaf ? "file" : "folder"} size={30} color={leaf ? LIGHT.green : LIGHT.sub} />
                      {row}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
      {ats.map((at, i) => (
        <Sfx key={i} name={i === 0 ? "pop" : "whoosh"} at={f(Math.max(0, at))} volume={0.25} />
      ))}
    </>
  );
};
