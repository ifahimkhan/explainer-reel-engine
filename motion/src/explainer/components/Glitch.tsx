import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Sfx } from "../../components/Sfx";
import { ease, range } from "../motion";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT } from "../theme";
import { SceneTiming, useSceneClock } from "../timeline";

const GLITCH_S = 0.55;
const SPLIT_PX = 14;
const JITTER_PX = 22;
const STRIP_TOP = 1010;
const STRIP_HOLD_S = 2.2;

/** Optional `visual.glitch`: error moments. At each cue the scene jolts with an RGB split + red flash,
 *  and `text` (e.g. "FATAL EXCEPTION: OutOfMemoryError") slides in as a stack-trace strip. */
export const GlitchHit = z.object({ cue: z.string(), text: z.string().min(1).max(48).optional() });
export const GlitchTrack = z.array(GlitchHit).max(4);
type GlitchHitT = z.infer<typeof GlitchHit>;

const parseHits = (scene: SceneTiming): GlitchHitT[] => {
  const raw = (scene.visual as { glitch?: unknown } | undefined)?.glitch;
  if (raw === undefined) return [];
  const result = GlitchTrack.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`scene "${scene.id}" has an invalid glitch: ${issues}`);
  }
  return result.data;
};

/** Deterministic pseudo-noise in [-1, 1] for frame-stable jitter. */
const noise = (t: number, seed: number): number => Math.sin(t * 173.3 + seed * 12.9) * Math.cos(t * 91.7 + seed * 4.1);

export const Glitch: React.FC<{ scene: SceneTiming; children: React.ReactNode }> = ({ scene, children }) => {
  const { t, cue, f } = useSceneClock(scene);
  const hits = parseHits(scene).map((h) => ({ ...h, at: cue(h.cue) - 0.05 }));
  if (hits.length === 0) return <>{children}</>;
  const live = hits.find((h) => t >= h.at && t < h.at + GLITCH_S);
  const k = live ? 1 - (t - live.at) / GLITCH_S : 0;
  const strip = [...hits].reverse().find((h) => h.text && t >= h.at && t < h.at + STRIP_HOLD_S);
  const dx = noise(t, 1) * JITTER_PX * k;
  const dy = noise(t, 2) * JITTER_PX * 0.4 * k;
  const split = SPLIT_PX * k;

  return (
    <>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>
        {children}
        {k > 0 ? (
          <>
            {/* Colour fringes: tinted copies offset left/right fake an RGB split without re-rendering the scene. */}
            <AbsoluteFill style={{ boxShadow: `inset ${split}px 0 0 rgba(255,0,60,0.35), inset ${-split}px 0 0 rgba(0,200,255,0.35)` }} />
            <AbsoluteFill style={{ background: LIGHT.red, opacity: 0.18 * k, mixBlendMode: "multiply" }} />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute", left: 0, right: 0, top: 300 + ((noise(t, 5 + i) + 1) / 2) * 800, height: 10 + i * 8,
                  background: i % 2 ? "rgba(0,200,255,0.35)" : "rgba(255,0,60,0.35)", transform: `translateX(${noise(t, 9 + i) * 60}px)`,
                }}
              />
            ))}
          </>
        ) : null}
      </AbsoluteFill>
      {strip ? (
        <div
          style={{
            position: "absolute", left: GUTTER, width: CONTENT_W, top: STRIP_TOP, padding: "16px 24px", boxSizing: "border-box", borderRadius: 18,
            background: "#16181d", border: `2px solid ${LIGHT.red}`, fontFamily: EX_FONTS.mono, fontSize: 26, fontWeight: 700, color: "#ff8a8d",
            whiteSpace: "nowrap", overflow: "hidden",
            transform: `translateX(${(1 - ease(t, strip.at, 0.3)) * -1200}px)`, opacity: range(t, [strip.at + STRIP_HOLD_S - 0.3, strip.at + STRIP_HOLD_S], [1, 0]),
          }}
        >
          {strip.text}
        </div>
      ) : null}
      {hits.map((h, i) => <Sfx key={i} name="alert" at={f(Math.max(0, h.at))} volume={0.35} />)}
    </>
  );
};
