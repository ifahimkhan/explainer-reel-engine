import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { back, ease, range } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, EX_WIDTH, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { bob, Burst } from "./fx";
import type { PairVisualT } from "./visuals";

interface PairSceneProps {
  scene: SceneTiming;
  visual: PairVisualT;
}

const TILE = 340;
const GAP = 90;

interface TileProps {
  tile: PairVisualT["left"];
  x: number;
  y: number;
  rotate: number;
  opacity: number;
}

const Tile: React.FC<TileProps> = ({ tile, x, y, rotate, opacity }) => {
  const fg = tile.dark ? "#fff" : LIGHT.ink;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: TILE, height: TILE, borderRadius: 54, boxSizing: "border-box",
        background: tile.dark ? LIGHT.dark : LIGHT.card, border: `3px solid ${tile.dark ? LIGHT.darkLine : LIGHT.line}`,
        boxShadow: SHADOW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
        transform: `rotate(${rotate}deg)`, opacity,
      }}
    >
      <Icon name={tile.icon} size={120} color={tile.dark ? "#f4966e" : LIGHT.green} stroke={1.8} />
      <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 46, letterSpacing: -1, color: fg }}>{tile.title}</div>
      {tile.sub ? <div style={{ fontFamily: EX_FONTS.mono, fontSize: 20, letterSpacing: 3, color: LIGHT.muted }}>{tile.sub}</div> : null}
    </div>
  );
};

/** Two app tiles fly in from the sides and snap together with a "+", then a stamp slams on. */
export const PairScene: React.FC<PairSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const stampAt = cue(visual.stamp.cue) - 0.15;
  const inL = back(t, 0.1, 0.6);
  const inR = back(t, 0.25, 0.6);
  // Tiles nudge toward each other as the stamp hits.
  const hit = Math.sin(Math.PI * range(t, [stampAt, stampAt + 0.25], [0, 1]));
  const y = SPLIT_CONTENT.top + 120;
  const lx = EX_WIDTH / 2 - GAP / 2 - TILE;
  const rx = EX_WIDTH / 2 + GAP / 2;
  const stamp = back(t, stampAt, 0.35);
  const plus = back(t, 0.75, 0.4);

  return (
    <>
      <Tile tile={visual.left} x={lx - (1 - inL) * 600 + hit * 14} y={y + bob(t, 0)} rotate={-6 + 6 * inL - 4} opacity={ease(t, 0.1, 0.3)} />
      <Tile tile={visual.right} x={rx + (1 - inR) * 600 - hit * 14} y={y + bob(t, 1)} rotate={6 - 6 * inR + 4} opacity={ease(t, 0.25, 0.3)} />
      <div
        style={{
          position: "absolute", left: EX_WIDTH / 2 - 38, top: y + TILE / 2 - 38, width: 76, height: 76, borderRadius: 38,
          background: LIGHT.card, border: `3px solid ${LIGHT.line}`, boxShadow: SHADOW, display: "flex", alignItems: "center",
          justifyContent: "center", transform: `scale(${plus}) rotate(${(1 - plus) * -180}deg)`,
        }}
      >
        <Icon name="plus" size={40} color={LIGHT.ink} stroke={2.6} />
      </div>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: y + TILE + 70, display: "flex", justifyContent: "center",
          opacity: ease(t, stampAt, 0.1),
        }}
      >
        <div
          style={{
            padding: "18px 44px", borderRadius: 22, border: `6px solid ${LIGHT.red}`, color: LIGHT.red, background: "rgba(229,72,77,0.08)",
            fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 92, letterSpacing: 2,
            transform: `scale(${2.2 - 1.2 * stamp}) rotate(${-7 * stamp}deg)`,
          }}
        >
          {visual.stamp.text}
        </div>
      </div>
      <Burst t={t} at={stampAt + 0.2} x={EX_WIDTH / 2} y={y + TILE + 140} radius={300} count={18} />
      <Sfx name="whoosh" at={f(0.1)} volume={0.2} />
      <Sfx name="impact" at={f(stampAt + 0.15)} volume={0.35} />
    </>
  );
};
