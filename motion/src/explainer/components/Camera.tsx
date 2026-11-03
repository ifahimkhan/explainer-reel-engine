import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { ease } from "../motion";
import { EX_WIDTH } from "../theme";
import { SceneTiming, useSceneClock } from "../timeline";

/** Neutral camera target: canvas centre of the content band. */
const HOME = { x: EX_WIDTH / 2, y: 700 } as const;
const DEFAULT_DUR = 0.8;
/** Scene-space y where the caption band starts: zoomed content is clipped above it so it never runs under captions. */
const CLIP_BOTTOM = 1170;

/**
 * Optional `visual.camera`: keyframes that push in on a point (canvas px, before the scene shift)
 * on their cue, pan between points, or pull back with `zoom: 1`.
 */
export const CameraKey = z.object({
  cue: z.string(),
  zoom: z.number().min(1).max(2.5),
  x: z.number().default(HOME.x),
  y: z.number().default(HOME.y),
  dur: z.number().positive().default(DEFAULT_DUR),
});
export const CameraTrack = z.array(CameraKey).max(8);
export type CameraKeyT = z.infer<typeof CameraKey>;

interface Pose {
  zoom: number;
  x: number;
  y: number;
}

const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

/** Pose at time t: each keyframe eases from the pose before it. */
export const poseAt = (keys: (CameraKeyT & { at: number })[], t: number): Pose =>
  keys.reduce<Pose>((pose, k) => {
    const p = ease(t, k.at, k.dur);
    return { zoom: lerp(pose.zoom, k.zoom, p), x: lerp(pose.x, k.x, p), y: lerp(pose.y, k.y, p) };
  }, { zoom: 1, ...HOME });

/** Reads `camera` from the raw visual; returns [] (no camera) when absent, throws on a malformed track. */
const parseTrack = (scene: SceneTiming): CameraKeyT[] => {
  const raw = (scene.visual as { camera?: unknown } | undefined)?.camera;
  if (raw === undefined) return [];
  const result = CameraTrack.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`scene "${scene.id}" has an invalid camera: ${issues}`);
  }
  return result.data;
};

/** Wraps a scene and moves a virtual camera over it; header and captions stay put (they live outside). */
export const Camera: React.FC<{ scene: SceneTiming; children: React.ReactNode }> = ({ scene, children }) => {
  const { t, cue } = useSceneClock(scene);
  const track = parseTrack(scene);
  if (track.length === 0) return <>{children}</>;
  const keys = track.map((k) => ({ ...k, at: cue(k.cue) - 0.15 }));
  const { zoom, x, y } = poseAt(keys, t);
  // The focus point (x, y) is scaled around and moved to where the home point sits.
  return (
    <AbsoluteFill style={{ clipPath: zoom > 1.001 ? `inset(0 0 calc(100% - ${CLIP_BOTTOM}px) 0)` : undefined }}>
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(${HOME.x}px, ${HOME.y}px) scale(${zoom}) translate(${-x}px, ${-y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
    </AbsoluteFill>
  );
};
