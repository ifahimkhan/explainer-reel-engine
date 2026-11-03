import React from "react";
import { Img, staticFile } from "remotion";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter, range, typed } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { CONTENT_W, EX_FONTS, EX_WIDTH, GUTTER, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { Burst, Headline } from "./fx";
import type { FollowVisualT } from "./visuals";

interface FollowSceneProps {
  scene: SceneTiming;
  visual: FollowVisualT;
}

const CARD_W = 760;
const AVATAR = 170;
const BTN_W = 380;
const BTN_H = 100;
const LOGO = "logo.png";
const NAME_MAX_W = 680;
const NAME_FONT = 56;

const URL_CPS = 24;
const URL_FONT = 30;

interface UrlTypingProps {
  t: number;
  at: number;
  text: string;
  top: number;
  f: (s: number) => number;
}

/** Address bar that types a URL, then glows green once it is complete. */
const UrlTyping: React.FC<UrlTypingProps> = ({ t, at, text, top, f }) => {
  const shown = typed(text, t, at + 0.3, URL_CPS);
  const doneAt = at + 0.3 + text.length / URL_CPS;
  const done = ease(t, doneAt, 0.3);
  const caretOn = t < doneAt + 0.3 && Math.floor(t * 4) % 2 === 0;
  return (
    <>
      <div
        style={{
          position: "absolute", left: GUTTER, width: CONTENT_W, top, height: 92, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14,
          padding: "0 28px", borderRadius: 24, background: LIGHT.card, border: `3px solid ${done > 0 ? LIGHT.greenHl : LIGHT.line}`,
          boxShadow: `${SHADOW}, 0 0 0 ${10 * done}px ${LIGHT.greenGlow}`, fontFamily: EX_FONTS.mono, fontSize: URL_FONT, fontWeight: 700,
          color: LIGHT.ink, whiteSpace: "pre", ...enter(t, at),
        }}
      >
        <Icon name="github" size={34} color={done > 0 ? LIGHT.green : LIGHT.ink} />
        <span>
          {shown}
          {caretOn ? <span style={{ color: LIGHT.greenHl }}>|</span> : null}
        </span>
      </div>
      <Sfx name="type" at={f(Math.max(0, at + 0.3))} volume={0.25} />
      <Sfx name="ding" at={f(doneAt)} volume={0.25} />
    </>
  );
};

/** Profile card with the channel logo; a cursor glides to the button, taps it, and it flips to its done state. */
export const FollowScene: React.FC<FollowSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const tapAt = cue(visual.cue);
  const cardTop = top + 230;
  const btnTop = cardTop + 360;
  const btnCx = EX_WIDTH / 2;
  const btnCy = btnTop + BTN_H / 2;
  const glide = ease(t, tapAt - 0.9, 0.8);
  const press = 1 - 0.12 * Math.sin(Math.PI * range(t, [tapAt, tapAt + 0.22], [0, 1]));
  const followed = t >= tapAt + 0.12;
  const avatar = back(t, 0.35, 0.6);
  // Long names (e.g. a skill slug) shrink to fit the card.
  const nameFont = Math.min(NAME_FONT, NAME_MAX_W / (visual.name.length * (visual.mono ? 0.6 : 0.55)));

  return (
    <>
      <Headline
        text={visual.headline} highlight={visual.highlight} t={t} at={0.1} fontSize={82}
        style={{ position: "absolute", left: GUTTER, top: top + 10, width: CONTENT_W }}
      />
      <div
        style={{
          position: "absolute", left: EX_WIDTH / 2 - CARD_W / 2, top: cardTop, width: CARD_W, height: 520, boxSizing: "border-box",
          borderRadius: 44, background: LIGHT.card, border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, ...enter(t, 0.25, 50),
        }}
      >
        <div
          style={{
            position: "absolute", left: CARD_W / 2 - AVATAR / 2, top: 40, width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2,
            overflow: "hidden", border: `5px solid ${followed ? LIGHT.greenHl : LIGHT.line}`, background: LIGHT.paper,
            transform: `scale(${avatar})`,
          }}
        >
          <Img src={staticFile(LOGO)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center" }}>
          <div
            style={{
              fontFamily: visual.mono ? EX_FONTS.mono : EX_FONTS.sans, fontWeight: visual.mono ? 700 : 900, fontSize: nameFont,
              letterSpacing: visual.mono ? 0 : -1.5, color: LIGHT.ink, whiteSpace: "nowrap",
            }}
          >
            {visual.name}
          </div>
          {visual.tagline ? <div style={{ fontFamily: EX_FONTS.mono, fontSize: 24, letterSpacing: 3, color: LIGHT.muted, marginTop: 6 }}>{visual.tagline}</div> : null}
        </div>
      </div>
      <div
        style={{
          position: "absolute", left: btnCx - BTN_W / 2, top: btnTop, width: BTN_W, height: BTN_H, borderRadius: 999,
          background: followed ? LIGHT.greenSoft : LIGHT.dark, color: followed ? LIGHT.green : "#fff",
          border: `3px solid ${followed ? LIGHT.greenHl : LIGHT.dark}`, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 14, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 42, transform: `scale(${press})`, ...enter(t, 0.45),
        }}
      >
        {followed ? <Icon name="check" size={42} color={LIGHT.green} stroke={3} /> : <Icon name={visual.actionIcon} size={42} color="#fff" stroke={3} />}
        {followed ? visual.done : visual.action}
      </div>
      <svg
        width={70} height={84} viewBox="0 0 24 28"
        style={{
          position: "absolute", left: btnCx + 80 + (1 - glide) * 260, top: btnCy - 10 + (1 - glide) * 380,
          opacity: ease(t, tapAt - 1, 0.2) * (1 - ease(t, tapAt + 0.8, 0.3)), transform: `scale(${press})`,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
        }}
      >
        <path d="M2 1 L2 22 L7.5 17 L11 26 L15 24.3 L11.5 15.5 L19 15.5 Z" fill="#fff" stroke={LIGHT.ink} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
      <Burst t={t} at={tapAt + 0.12} x={btnCx} y={btnCy} radius={300} count={18} />
      {visual.sub ? (
        <Centered top={btnTop + BTN_H + 90} style={enter(t, cue(visual.sub.cue) - 0.2)}>
          <Pill icon="bell" text={visual.sub.text} tone="dark" />
        </Centered>
      ) : null}
      {visual.url ? <UrlTyping t={t} at={cue(visual.url.cue) - 0.1} text={visual.url.text} top={btnTop + BTN_H + 70} f={f} /> : null}
      <Sfx name="pop" at={f(Math.max(0, tapAt))} volume={0.35} />
      <Sfx name="ding" at={f(tapAt + 0.15)} volume={0.3} />
    </>
  );
};
