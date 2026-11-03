import React from "react";
import { Img, staticFile } from "remotion";
import { Sfx } from "../../../components/Sfx";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { ScreenshotVisualT } from "./visuals";

interface ScreenshotSceneProps {
  scene: SceneTiming;
  visual: ScreenshotVisualT;
}

const VIEW_W = CONTENT_W;
const DEFAULT_VIEW_H = 620;
const ZOOM_S = 0.9;
const FOCUS_FILL = 0.88;
const DIM = 0.5;

const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

interface CamStop { s: number; cx: number; cy: number; at: number }

/** Real screenshot in a frame: zooms into `focus`, glides along `pans`, then highlight boxes draw on and spotlight their regions. */
export const ScreenshotScene: React.FC<ScreenshotSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + (visual.title ? 110 : 30);
  const VIEW_H = visual.viewH ?? DEFAULT_VIEW_H;
  const { width: iw, height: ih, focus } = visual;
  const fitScale = Math.min(VIEW_W / iw, VIEW_H / ih);
  const boxes = [...(focus ? [focus] : []), ...visual.pans];
  const stops: CamStop[] = boxes.map((b) => ({
    s: Math.min((VIEW_W * FOCUS_FILL) / b.w, (VIEW_H * FOCUS_FILL) / b.h),
    cx: b.x + b.w / 2,
    cy: b.y + b.h / 2,
    at: cue(b.cue) - 0.2,
  }));
  const cam = stops.reduce<Omit<CamStop, "at">>(
    (prev, st) => {
      const p = ease(t, st.at, ZOOM_S);
      return { s: lerp(prev.s, st.s, p), cx: lerp(prev.cx, st.cx, p), cy: lerp(prev.cy, st.cy, p) };
    },
    { s: fitScale, cx: iw / 2, cy: ih / 2 },
  );
  const { s, cx, cy } = cam;
  const hls = visual.highlights.map((h) => ({ ...h, at: cue(h.cue) - 0.15 }));
  const dim = hls.length ? ease(t, hls[0].at, 0.4) * DIM : 0;

  return (
    <>
      {visual.title ? (
        <Centered top={SPLIT_CONTENT.top} style={enter(t, 0.05)}>
          <Pill icon="file" text={visual.title} mono />
        </Centered>
      ) : null}
      <div
        style={{
          position: "absolute", left: GUTTER, top, width: VIEW_W, height: VIEW_H, borderRadius: 28, overflow: "hidden",
          background: "#1e1e1e", border: `3px solid ${LIGHT.darkLine}`, boxShadow: SHADOW, ...enter(t, 0.05, 50),
        }}
      >
        <div
          style={{
            position: "absolute", left: 0, top: 0, width: iw, height: ih, transformOrigin: "0 0",
            transform: `translate(${VIEW_W / 2 - cx * s}px, ${VIEW_H / 2 - cy * s}px) scale(${s})`,
          }}
        >
          <Img src={staticFile(visual.src)} style={{ width: iw, height: ih, display: "block" }} />
          <svg width={iw} height={ih} style={{ position: "absolute", left: 0, top: 0 }}>
            <defs>
              <mask id={`spot-${scene.id}`}>
                <rect width={iw} height={ih} fill="#fff" />
                {hls.map((h, i) => (
                  <rect key={i} x={h.x} y={h.y} width={h.w} height={h.h} rx={10 / s} fill="#000" opacity={ease(t, h.at, 0.3)} />
                ))}
              </mask>
            </defs>
            <rect width={iw} height={ih} fill="#000" opacity={dim} mask={`url(#spot-${scene.id})`} />
            {hls.map((h, i) => {
              const per = 2 * (h.w + h.h);
              const draw = ease(t, h.at, 0.5);
              return (
                <rect
                  key={i} x={h.x} y={h.y} width={h.w} height={h.h} rx={10 / s} fill="none" stroke={LIGHT.greenHl}
                  strokeWidth={5 / s} strokeDasharray={per} strokeDashoffset={per * (1 - draw)}
                  style={{ filter: `drop-shadow(0 0 ${8 / s}px ${LIGHT.greenHl})` }}
                />
              );
            })}
          </svg>
          {hls.map((h, i) =>
            h.label ? (
              <div
                key={i}
                style={{
                  position: "absolute", left: h.x + h.w + 14 / s, top: h.y + h.h / 2, transformOrigin: "0 50%",
                  transform: `translateY(-50%) scale(${back(t, h.at + 0.3, 0.4) / s})`, whiteSpace: "nowrap",
                  padding: "8px 20px", borderRadius: 999, background: LIGHT.greenHl, color: "#fff",
                  fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 34,
                }}
              >
                ← {h.label}
              </div>
            ) : null,
          )}
        </div>
      </div>
      {stops.map((st, i) => (
        <Sfx key={`z${i}`} name="whoosh" at={f(Math.max(0, st.at))} volume={0.25} />
      ))}
      {hls.map((h, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, h.at))} volume={0.3} />
      ))}
    </>
  );
};
