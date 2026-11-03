import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { PhonesVisualT } from "./visuals";

interface PhonesSceneProps {
  scene: SceneTiming;
  visual: PhonesVisualT;
}

const PHONE_W = 280;
const PHONE_H = 560;
const PHONE_GAP = 40;

/** Mock app screen: status bar, app bar, content skeleton that builds in, CTA button. */
const Phone: React.FC<{ title: string; t: number; at: number; locked: boolean }> = ({ title, t, at, locked }) => {
  const build = (i: number) => ease(t, at + 0.25 + i * 0.12, 0.35);
  return (
    <div
      style={{
        width: PHONE_W, height: PHONE_H, borderRadius: 44, background: LIGHT.dark, padding: 12, boxShadow: SHADOW,
        position: "relative", ...enter(t, at, 50),
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 34, background: LIGHT.card, overflow: "hidden", position: "relative" }}>
        <div style={{ height: 34, display: "flex", justifyContent: "space-between", padding: "8px 22px", fontFamily: EX_FONTS.mono, fontSize: 15, color: LIGHT.sub }}>
          <span>9:41</span>
          <span>●●●</span>
        </div>
        <div style={{ padding: "10px 20px", background: LIGHT.greenSoft, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 24, color: LIGHT.green }}>
          {title}
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ height: 120, borderRadius: 18, background: "#eef1ee", opacity: build(0) }} />
          {[0.9, 0.7, 0.8].map((w, i) => (
            <div key={i} style={{ height: 16, width: `${w * 100}%`, borderRadius: 8, background: LIGHT.line, opacity: build(i + 1) }} />
          ))}
          <div style={{ display: "flex", gap: 12, opacity: build(4) }}>
            <div style={{ flex: 1, height: 70, borderRadius: 14, background: "#eef1f5" }} />
            <div style={{ flex: 1, height: 70, borderRadius: 14, background: "#eef1f5" }} />
          </div>
        </div>
        <div
          style={{
            position: "absolute", left: 20, right: 20, bottom: 24, height: 56, borderRadius: 16, background: LIGHT.greenHl,
            opacity: build(5), display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 22,
          }}
        >
          Continue
        </div>
        {locked ? (
          <div
            style={{
              position: "absolute", inset: 0, background: "rgba(13,15,18,0.55)", display: "flex", alignItems: "center",
              justifyContent: "center", opacity: ease(t, at + 0.9, 0.3),
            }}
          >
            <div style={{ width: 90, height: 90, borderRadius: 45, background: LIGHT.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="lock" size={44} color="#fff" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const PhonesScene: React.FC<PhonesSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const ats = visual.phones.map((p, i) => cue(p.cue) - 0.2 + i * 0.12);
  const noteAt = visual.note ? cue(visual.note.cue) - 0.1 : 0;

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="sparkle" text={visual.title} mono />
        </Centered>
      ) : null}
      <Centered top={SPLIT_CONTENT.top + 110} style={{ gap: PHONE_GAP }}>
        {visual.phones.map((p, i) => (
          <Phone key={p.title} title={p.title} t={t} at={ats[i]} locked={Boolean(p.locked)} />
        ))}
      </Centered>
      {visual.note ? (
        <Centered top={SPLIT_CONTENT.top + 700} style={enter(t, noteAt)}>
          <Pill icon="lock" text={visual.note.text} tone="yellow" />
        </Centered>
      ) : null}
      {ats.map((at, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, at))} />
      ))}
      {visual.note ? <Sfx name="alert" at={f(noteAt)} volume={0.2} /> : null}
    </>
  );
};
