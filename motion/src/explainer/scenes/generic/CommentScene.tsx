import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter, range, typed } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Burst, Headline } from "./fx";
import type { CommentVisualT } from "./visuals";

interface CommentSceneProps {
  scene: SceneTiming;
  visual: CommentVisualT;
}

const CPS = 9;
const BOX_H = 130;

/** Comment box types the keyword, the send button presses, the comment posts and gets a heart. */
export const CommentScene: React.FC<CommentSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const typeAt = cue(visual.cue) - 0.3;
  const typedText = typed(visual.keyword, t, typeAt, CPS);
  const sendAt = typeAt + visual.keyword.length / CPS + 0.2;
  const sent = t >= sendAt + 0.15;
  const press = 1 - 0.15 * Math.sin(Math.PI * range(t, [sendAt, sendAt + 0.25], [0, 1]));
  const post = back(t, sendAt + 0.15, 0.55);
  const heart = back(t, sendAt + 0.7, 0.45);
  const boxTop = top + 300;
  const cursorOn = Math.floor(t * 2.5) % 2 === 0;

  return (
    <>
      <Headline
        text={visual.headline} highlight={visual.highlight} t={t} at={0.1} fontSize={86}
        style={{ position: "absolute", left: GUTTER, top: top + 20, width: CONTENT_W }}
      />
      <div
        style={{
          position: "absolute", left: GUTTER, top: boxTop, width: CONTENT_W, height: BOX_H, boxSizing: "border-box", borderRadius: 999,
          background: LIGHT.card, border: `3px solid ${t >= typeAt && !sent ? LIGHT.greenHl : LIGHT.line}`, boxShadow: SHADOW,
          display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 30px", ...enter(t, 0.4),
        }}
      >
        <div style={{ width: 70, height: 70, borderRadius: 35, background: LIGHT.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="user" size={40} color={LIGHT.green} />
        </div>
        <div style={{ flex: 1, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 48, color: sent || typedText ? LIGHT.ink : LIGHT.muted }}>
          {sent ? "" : typedText || "Add a comment..."}
          {!sent && t >= typeAt && cursorOn ? <span style={{ color: LIGHT.greenHl }}>|</span> : null}
        </div>
        <div
          style={{
            width: 94, height: 94, borderRadius: 47, background: typedText ? LIGHT.greenHl : LIGHT.line, display: "flex",
            alignItems: "center", justifyContent: "center", transform: `scale(${press})`,
          }}
        >
          <Icon name="send" size={46} color="#fff" stroke={2.4} />
        </div>
      </div>
      <div
        style={{
          position: "absolute", left: GUTTER, top: boxTop + BOX_H + 40, width: CONTENT_W, boxSizing: "border-box", padding: "26px 30px",
          borderRadius: 32, background: LIGHT.card, border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, display: "flex",
          alignItems: "center", gap: 22, opacity: ease(t, sendAt + 0.15, 0.25), transform: `translateY(${(1 - post) * -60}px) scale(${0.9 + 0.1 * post})`,
        }}
      >
        <div style={{ width: 70, height: 70, borderRadius: 35, background: LIGHT.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="user" size={40} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, color: LIGHT.muted }}>you · just now</div>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 52, color: LIGHT.ink }}>{visual.keyword}</div>
        </div>
        <div style={{ transform: `scale(${heart})`, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="heart" size={56} color="#ff3b5c" stroke={2.4} />
        </div>
      </div>
      <Burst t={t} at={sendAt + 0.7} x={GUTTER + CONTENT_W - 50} y={boxTop + BOX_H + 105} radius={160} count={12} />
      {visual.sub ? (
        <Centered top={boxTop + BOX_H + 260} style={enter(t, cue(visual.sub.cue) - 0.2)}>
          <Pill icon="bell" text={visual.sub.text} tone="dark" />
        </Centered>
      ) : null}
      <Sfx name="type" at={f(Math.max(0, typeAt))} volume={0.25} />
      <Sfx name="whoosh" at={f(sendAt)} volume={0.25} />
      <Sfx name="pop" at={f(sendAt + 0.7)} />
    </>
  );
};
