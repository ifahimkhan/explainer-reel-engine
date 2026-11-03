import React from "react";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { Sfx } from "../../components/Sfx";
import { Icon, IconName } from "../components/Icon";
import { Centered, Pill } from "../components/Primitives";
import { TrickChip, UrlBar } from "../components/UrlBar";
import { ease, enter } from "../motion";
import { EX_FONTS, LIGHT, SHADOW } from "../theme";
import { SceneTiming, useCopy, useSceneClock } from "../timeline";

interface SceneProps {
  scene: SceneTiming;
}

const NODE_W = 230;
const NODE_H = 140;

interface DiagramNode {
  id: string;
  label: string;
  sub: string;
  icon: IconName;
  x: number;
  y: number;
}

/** Node centers on the 1080x1920 canvas. */
const NODES: readonly DiagramNode[] = [
  { id: "fe", label: "Frontend", sub: "app/ · components/", icon: "grid", x: 540, y: 500 },
  { id: "auth", label: "Auth", sub: "lib/auth.ts", icon: "auth", x: 190, y: 730 },
  { id: "api", label: "API routes", sub: "app/api/", icon: "layers", x: 540, y: 730 },
  { id: "jobs", label: "Workers", sub: "jobs/", icon: "cloud", x: 890, y: 730 },
  { id: "db", label: "Database", sub: "prisma/", icon: "db", x: 370, y: 970 },
  { id: "ext", label: "External APIs", sub: "stripe · openai", icon: "send", x: 710, y: 970 },
];

const EDGES: readonly string[] = [
  `M 540 ${500 + NODE_H / 2} L 540 ${730 - NODE_H / 2}`,
  `M ${540 - NODE_W / 2} 730 L ${190 + NODE_W / 2} 730`,
  `M ${540 + NODE_W / 2} 730 L ${890 - NODE_W / 2} 730`,
  `M 500 ${730 + NODE_H / 2} L 400 ${970 - NODE_H / 2}`,
  `M 580 ${730 + NODE_H / 2} L 680 ${970 - NODE_H / 2}`,
];

const PULSE_PERIOD = 1.1;

export const DiagramScene: React.FC<SceneProps> = ({ scene }) => {
  const { t, cue, f } = useSceneClock(scene);
  const copy = useCopy();
  const morphAt = cue("morph") + 0.1;
  const nodesAt = cue("nodes") - 0.2;
  const edgesAt = cue("edges") - 0.3;
  const pulseAt = cue("pulse");

  return (
    <>
      <TrickChip t={t} text="TRICK 2/5 · GitDiagram" />
      <UrlBar t={t} morphAt={morphAt} prefix="git" from="hub" to="diagram" markAt={cue("morph") - 0.3} enterAt={0.05} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {EDGES.map((d, i) => {
          const p = ease(t, edgesAt + i * 0.15, 0.5);
          const evolved = evolvePath(p, d);
          const len = getLength(d);
          const phase = (((t - pulseAt) / PULSE_PERIOD + i * 0.2) % 1 + 1) % 1;
          const dot = getPointAtLength(d, phase * len);
          return (
            <g key={i}>
              <path d={d} stroke={LIGHT.ink} strokeWidth={3} fill="none"
                strokeDasharray={evolved.strokeDasharray} strokeDashoffset={evolved.strokeDashoffset} strokeLinecap="round" />
              {t >= pulseAt && dot ? <circle cx={dot.x} cy={dot.y} r={9} fill={LIGHT.greenHl} /> : null}
            </g>
          );
        })}
      </svg>

      {NODES.map((n, i) => {
        const hot = n.id === "api" && t >= cue("hot");
        return (
          <div
            key={n.id}
            style={{
              position: "absolute", left: n.x - NODE_W / 2, top: n.y - NODE_H / 2, width: NODE_W, height: NODE_H,
              borderRadius: 22, background: LIGHT.card, border: `3px solid ${hot ? LIGHT.greenHl : LIGHT.line}`,
              boxShadow: hot ? `${SHADOW}, 0 0 0 10px ${LIGHT.greenGlow}` : SHADOW,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
              ...enter(t, nodesAt + i * 0.15, 24),
            }}
          >
            <Icon name={n.icon} size={36} color={LIGHT.green} />
            <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 28, color: LIGHT.ink }}>{n.label}</div>
            <div style={{ fontFamily: EX_FONTS.mono, fontSize: 18, color: LIGHT.muted }}>{n.sub}</div>
          </div>
        );
      })}

      <Centered top={1110} style={enter(t, cue("pill") - 0.1)}>
        <Pill icon="eyeOff" text={copy("diagram.pill")} />
      </Centered>

      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="type" at={f(morphAt)} volume={0.3} />
      <Sfx name="pop" at={f(nodesAt)} />
      <Sfx name="whoosh" at={f(edgesAt)} volume={0.2} />
      <Sfx name="pop" at={f(cue("pill") - 0.1)} />
    </>
  );
};
