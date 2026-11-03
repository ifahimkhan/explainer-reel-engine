import React from "react";
import { Sfx } from "../../../../components/Sfx";
import { Icon } from "../../../components/Icon";
import { NEVER, back, ease } from "../../../motion";
import { CONTENT_W, EX_FONTS, GUTTER, LIGHT, SHADOW } from "../../../theme";
import type { ChatMessageT } from "./schema";

export const CHAT_TOP = 160;
export const CHAT_H = 470;
const HEAD_H = 76;
const BODY_H = CHAT_H - HEAD_H;
const PAD = 22;
const FONT = 30;
const LINE_H = 40;
const BUBBLE_MAX = 700;
const CHARS_PER_LINE = 38;
const TAG_H = 32;
const GAP = 16;

type Tone = "good" | "bad" | undefined;

const BUBBLE_STYLE = {
  user: { background: LIGHT.ink, color: "#fff", border: "2px solid transparent" },
  neutral: { background: "#f1f2ee", color: LIGHT.ink, border: `2px solid ${LIGHT.line}` },
  good: { background: LIGHT.greenSoft, color: "#14532d", border: `2px solid ${LIGHT.greenHl}` },
  bad: { background: "#fde8e8", color: "#9b1c1f", border: `2px solid ${LIGHT.red}` },
} as const;

const TAG_COLOR = { neutral: LIGHT.muted, good: LIGHT.green, bad: LIGHT.red } as const;

const linesOf = (text: string): number => Math.max(1, Math.ceil(text.length / CHARS_PER_LINE));

/** Fixed height per message (sized for its longest state) so the stack never jumps on an update. */
const heightOf = (m: ChatMessageT): number => {
  const lines = Math.max(linesOf(m.text), m.update ? linesOf(m.update.text) : 0);
  const tagged = m.tag !== undefined || m.update?.tag !== undefined;
  return lines * LINE_H + 32 + (tagged ? TAG_H : 0);
};

interface BubbleProps {
  from: "user" | "ai";
  text: string;
  tone: Tone;
  tag?: string;
  opacity: number;
}

const Bubble: React.FC<BubbleProps> = ({ from, text, tone, tag, opacity }) => {
  const style = from === "user" ? BUBBLE_STYLE.user : BUBBLE_STYLE[tone ?? "neutral"];
  return (
    <div style={{ position: "absolute", inset: 0, opacity, display: "flex", flexDirection: "column", alignItems: from === "user" ? "flex-end" : "flex-start" }}>
      <div
        style={{
          ...style, maxWidth: BUBBLE_MAX, padding: "14px 24px", borderRadius: 26,
          borderBottomRightRadius: from === "user" ? 8 : 26, borderBottomLeftRadius: from === "ai" ? 8 : 26,
          fontFamily: EX_FONTS.sans, fontWeight: 600, fontSize: FONT, lineHeight: `${LINE_H}px`,
        }}
      >
        {text}
      </div>
      {tag ? (
        <div
          style={{
            marginTop: 6, display: "flex", alignItems: "center", gap: 6, fontFamily: EX_FONTS.mono, fontSize: 19,
            letterSpacing: 1, textTransform: "uppercase", color: TAG_COLOR[tone ?? "neutral"],
          }}
        >
          {tone === "good" ? <Icon name="check" size={20} color={LIGHT.green} stroke={3} /> : null}
          {tag}
        </div>
      ) : null}
    </div>
  );
};

interface ChatProps {
  t: number;
  app: string;
  status?: string;
  messages: ChatMessageT[];
  cue: (tag: string) => number;
  f: (s: number) => number;
}

/** Chat window that stays put; messages arrive at the bottom and push older ones up and out. */
export const Chat: React.FC<ChatProps> = ({ t, app, status, messages, cue, f }) => {
  const timed = messages.map((m) => ({
    m,
    at: m.cue ? cue(m.cue) - 0.1 : -10,
    updateAt: m.update ? cue(m.update.cue) - 0.1 : NEVER,
    h: heightOf(m),
  }));

  // Lay out bottom-up: each message's slot grows in as it arrives.
  let offset = 0;
  const placed = [...timed].reverse().map((item) => {
    const grow = ease(t, item.at, 0.4);
    offset += (item.h + GAP) * grow;
    return { ...item, top: BODY_H - PAD - offset + GAP, grow };
  });

  return (
    <div
      style={{
        position: "absolute", left: GUTTER, top: CHAT_TOP, width: CONTENT_W, height: CHAT_H, borderRadius: 32,
        background: LIGHT.card, border: `2px solid ${LIGHT.line}`, boxShadow: SHADOW, overflow: "hidden",
        opacity: ease(t, 0, 0.4), transform: `translateY(${(1 - ease(t, 0, 0.5)) * 40}px)`,
      }}
    >
      <div style={{ height: HEAD_H, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", borderBottom: `2px solid ${LIGHT.line}` }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: LIGHT.greenHl, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="sparkle" size={28} color="#fff" stroke={2.5} />
        </div>
        <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 32, color: LIGHT.ink }}>{app}</div>
        {status ? <div style={{ marginLeft: "auto", fontFamily: EX_FONTS.mono, fontSize: 19, color: LIGHT.muted }}>{status}</div> : null}
      </div>
      <div style={{ position: "relative", height: BODY_H, overflow: "hidden" }}>
        {placed.map(({ m, at, updateAt, h, top, grow }, i) => {
          if (grow <= 0 || top + h < 0) return null;
          const pop = back(t, at, 0.45);
          const swap = ease(t, updateAt, 0.35);
          const fresh = m.update && swap > 0 ? m.update : m;
          const toneNow: Tone = fresh.tone;
          const shakeAt = toneNow === "bad" ? (swap > 0 ? updateAt : at) : NEVER;
          const shake = t > shakeAt + 0.2 && t < shakeAt + 0.6 ? Math.sin((t - shakeAt) * 60) * 8 * (1 - (t - shakeAt - 0.2) / 0.4) : 0;
          const flash = m.update ? Math.max(0, 1 - Math.abs(t - updateAt - 0.15) / 0.3) : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: PAD, right: PAD, top, height: h,
                transform: `translateX(${shake}px) scale(${(0.9 + 0.1 * pop) * (1 + 0.05 * flash)})`, transformOrigin: m.from === "user" ? "right bottom" : "left bottom",
                opacity: Math.min(1, pop * 1.5),
              }}
            >
              <Bubble from={m.from} text={m.text} tone={m.tone} tag={m.tag} opacity={1 - swap} />
              {m.update ? <Bubble from={m.from} text={m.update.text} tone={m.update.tone} tag={m.update.tag} opacity={swap} /> : null}
            </div>
          );
        })}
      </div>
      {timed.map(({ m, at, updateAt }, i) => (
        <React.Fragment key={i}>
          {at > 0 ? <Sfx name={m.tone === "bad" ? "alert" : "pop"} at={f(at)} volume={m.tone === "bad" ? 0.22 : 0.3} /> : null}
          {updateAt < NEVER ? <Sfx name={m.update?.tone === "bad" ? "alert" : "ding"} at={f(updateAt)} volume={0.25} /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};
