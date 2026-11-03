import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Centered, Pill } from "../../components/Primitives";
import { NEVER, ease, enter, typed } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { DiffVisualT } from "./visuals";

interface DiffSceneProps {
  scene: SceneTiming;
  visual: DiffVisualT;
}

const FONT = 30;
const LINE_H = 52;
const HEADER_H = 70;
const CPS = 30;
const GROW_S = 0.25;

const KIND = {
  ctx: { mark: " ", bg: "transparent", ink: "#d7dae0" },
  del: { mark: "-", bg: "rgba(229,72,77,0.22)", ink: "#ff8a8d" },
  add: { mark: "+", bg: "rgba(34,163,90,0.24)", ink: "#7ee2a8" },
} as const;

/** Code diff: removed lines turn red and strike through on their cue, added lines grow in green and type. */
export const DiffScene: React.FC<DiffSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top + 30;
  const adds = visual.lines.filter((l) => l.kind === "add").length;
  const dels = visual.lines.filter((l) => l.kind === "del").length;

  return (
    <>
      <div
        style={{
          position: "absolute", left: GUTTER, top, width: CONTENT_W, borderRadius: 28, overflow: "hidden", background: "#16181d",
          border: `2px solid ${LIGHT.darkLine}`, boxShadow: SHADOW, ...enter(t, 0.05, 40),
        }}
      >
        <div style={{ height: HEADER_H, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", background: "#1f2228" }}>
          <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, color: "#9aa0a8" }}>{visual.file}</div>
          <div style={{ marginLeft: "auto", fontFamily: EX_FONTS.mono, fontSize: 24, fontWeight: 700 }}>
            <span style={{ color: "#7ee2a8" }}>+{adds}</span> <span style={{ color: "#ff8a8d" }}>-{dels}</span>
          </div>
        </div>
        <div style={{ padding: "18px 0 24px", fontFamily: EX_FONTS.mono, fontSize: FONT, whiteSpace: "pre" }}>
          {visual.lines.map((line, i) => {
            const at = line.cue ? cue(line.cue) - 0.1 : NEVER;
            const k = KIND[line.kind];
            const grow = line.kind === "add" ? ease(t, at, GROW_S) : 1;
            const marked = line.kind === "del" ? ease(t, at, 0.3) : line.kind === "add" ? grow : 0;
            const text = line.kind === "add" ? typed(line.text, t, at + GROW_S * 0.6, CPS) : line.text;
            if (line.kind === "add" && grow <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: "relative", height: LINE_H * grow, overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 26,
                  color: marked > 0.5 || line.kind === "ctx" ? k.ink : KIND.ctx.ink,
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${marked * 100}%`, background: k.bg }} />
                <span style={{ position: "relative", width: 34, color: marked > 0.5 ? k.ink : "#5b616b" }}>{marked > 0.5 ? k.mark : " "}</span>
                <span style={{ position: "relative", textDecoration: line.kind === "del" && marked > 0.5 ? "line-through" : "none" }}>{text || " "}</span>
              </div>
            );
          })}
        </div>
      </div>
      {visual.note ? (
        <Centered top={top + HEADER_H + 60 + visual.lines.length * LINE_H} style={enter(t, cue(visual.note.cue) - 0.2)}>
          <Pill icon="check" text={visual.note.text} tone="dark" />
        </Centered>
      ) : null}
      {visual.lines.map((line, i) =>
        line.cue ? <Sfx key={i} name={line.kind === "del" ? "alert" : "type"} at={f(Math.max(0, cue(line.cue) - 0.1))} volume={0.22} /> : null,
      )}
      {visual.note ? <Sfx name="ding" at={f(Math.max(0, cue(visual.note.cue) - 0.2))} volume={0.25} /> : null}
    </>
  );
};
