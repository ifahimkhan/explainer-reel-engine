import React from "react";
import { Sfx } from "../../../components/Sfx";
import { NEVER, back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { PhoneAppVisualT } from "./visuals";

interface PhoneAppSceneProps {
  scene: SceneTiming;
  visual: PhoneAppVisualT;
}

const PHONE_W = 480;
const PHONE_H = 880;
const BEZEL = 16;
const SCREEN_W = PHONE_W - BEZEL * 2;
const APPBAR_H = 96;
const ROW_H = 168;
const JANK_STEP_S = 0.28;
const METER_H = 300;
const BARS = 14;
const BAR_SLICE_S = 0.12;
const FRAME_OK_MS = 16;
const METER_MAX_MS = 120;
const PASTELS = ["#cfe8dc", "#f7dcc9", "#d6e4f5", "#efe0f2", "#f5eec8"] as const;

/** Frame time (ms) of the slice starting at time s: smooth ~10-15 ms, janky 45-115 ms. */
const frameMs = (s: number, janky: boolean): number => {
  const n = Math.abs(Math.sin(s * 37.1) * Math.cos(s * 13.7));
  return janky ? 45 + 70 * n : 10 + 5 * n;
};

/** Phone running a feed that scrolls; during `jank` it stutters and the frame meter spikes; `dialog` pops an ANR/crash box. */
export const PhoneAppScene: React.FC<PhoneAppSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const phoneX = GUTTER + 10;
  const scrollAt = visual.scroll ? cue(visual.scroll) - 0.1 : 0.5;
  const jankFrom = visual.jank ? cue(visual.jank.cue) - 0.1 : NEVER;
  const jankTo = visual.jank?.end ? cue(visual.jank.end) - 0.1 : NEVER;
  const dialogAt = visual.dialog ? cue(visual.dialog.cue) - 0.1 : NEVER;
  const isJanky = (s: number): boolean => s >= jankFrom && s < jankTo;
  // Janky time advances in steps (held frames); a dialog freezes the list entirely.
  const frozenT = Math.min(t, dialogAt);
  const scrollT = isJanky(frozenT) ? jankFrom + Math.floor((frozenT - jankFrom) / JANK_STEP_S) * JANK_STEP_S : frozenT;
  const offset = Math.max(0, scrollT - scrollAt) * visual.speed;
  const listH = visual.rows * ROW_H;
  const shift = offset % listH;
  const janky = isJanky(t) || t >= dialogAt;
  const fps = janky ? Math.round(1000 / frameMs(Math.floor(t / BAR_SLICE_S), true)) : 60;
  const dialog = back(t, dialogAt, 0.45);

  return (
    <>
      <div
        style={{
          position: "absolute", left: phoneX, top, width: PHONE_W, height: PHONE_H, borderRadius: 64, background: "#16181d", boxShadow: SHADOW,
          padding: BEZEL, boxSizing: "border-box", ...enter(t, 0.05, 50),
        }}
      >
        <div style={{ position: "relative", width: SCREEN_W, height: PHONE_H - BEZEL * 2, borderRadius: 50, overflow: "hidden", background: LIGHT.paper }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: APPBAR_H, zIndex: 2, background: LIGHT.card, borderBottom: `2px solid ${LIGHT.line}`, display: "flex", alignItems: "flex-end", padding: "0 26px 16px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30, color: LIGHT.ink }}>{visual.title}</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: APPBAR_H - shift }}>
            {Array.from({ length: visual.rows * 2 }, (_, i) => (
              <div key={i} style={{ height: ROW_H, display: "flex", gap: 18, padding: "18px 22px", boxSizing: "border-box" }}>
                <div style={{ width: 132, height: 132, borderRadius: 20, background: PASTELS[i % PASTELS.length] }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, paddingTop: 14 }}>
                  <div style={{ height: 20, width: "85%", borderRadius: 10, background: "#d9dbd5" }} />
                  <div style={{ height: 16, width: "60%", borderRadius: 8, background: "#e6e7e2" }} />
                  <div style={{ height: 16, width: "40%", borderRadius: 8, background: "#e6e7e2" }} />
                </div>
              </div>
            ))}
          </div>
          {dialog > 0 ? (
            <>
              <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "rgba(15,17,21,0.45)", opacity: Math.min(1, dialog) }} />
              <div
                style={{
                  position: "absolute", zIndex: 4, left: 28, right: 28, top: 300, padding: "30px 30px 22px", borderRadius: 28, background: LIGHT.card,
                  boxShadow: SHADOW, transform: `scale(${dialog})`,
                }}
              >
                <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30, color: LIGHT.ink, lineHeight: 1.2 }}>{visual.dialog?.title}</div>
                <div style={{ marginTop: 12, fontFamily: EX_FONTS.sans, fontSize: 24, color: LIGHT.sub, lineHeight: 1.35 }}>{visual.dialog?.body}</div>
                <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 30 }}>
                  {visual.dialog?.buttons.map((b) => (
                    <div key={b} style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 24, color: LIGHT.green, textTransform: "uppercase" }}>{b}</div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      {visual.meter ? (
        <div style={{ position: "absolute", left: phoneX + PHONE_W + 30, top: top + 120, width: GUTTER + CONTENT_W - (phoneX + PHONE_W + 30), ...enter(t, 0.3) }}>
          <div
            style={{
              display: "inline-block", padding: "10px 22px", borderRadius: 999, background: janky ? LIGHT.red : LIGHT.greenHl, color: "#fff",
              fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 34,
            }}
          >
            {fps} fps
          </div>
          <div style={{ position: "relative", marginTop: 20, height: METER_H, borderRadius: 22, background: LIGHT.card, border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: (FRAME_OK_MS / METER_MAX_MS) * (METER_H - 30) + 10, borderTop: `3px dashed ${LIGHT.green}` }} />
            <div style={{ position: "absolute", left: 14, right: 14, bottom: 10, top: 20, display: "flex", alignItems: "flex-end", gap: 5 }}>
              {Array.from({ length: BARS }, (_, i) => {
                const slice = Math.floor(t / BAR_SLICE_S) - (BARS - 1 - i);
                const s = slice * BAR_SLICE_S;
                const bad = isJanky(s) || s >= dialogAt;
                const ms = s < 0 ? 0 : frameMs(slice, bad);
                return <div key={i} style={{ flex: 1, height: `${(Math.min(ms, METER_MAX_MS) / METER_MAX_MS) * 100}%`, borderRadius: 4, background: bad ? LIGHT.red : LIGHT.greenHl }} />;
              })}
            </div>
          </div>
          <div style={{ marginTop: 10, fontFamily: EX_FONTS.mono, fontSize: 20, color: LIGHT.muted }}>frame time · 16 ms line</div>
        </div>
      ) : null}
      {visual.jank ? <Sfx name="alert" at={f(Math.max(0, jankFrom))} volume={0.25} /> : null}
      {visual.dialog ? <Sfx name="impact" at={f(Math.max(0, dialogAt))} volume={0.35} /> : null}
    </>
  );
};
