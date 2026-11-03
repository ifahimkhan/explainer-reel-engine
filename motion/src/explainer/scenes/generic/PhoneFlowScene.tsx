import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { Centered, Pill } from "../../components/Primitives";
import { back, ease, enter } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, EX_WIDTH, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import type { PhoneFlowScreenT, PhoneFlowVisualT } from "./visuals";

interface PhoneFlowSceneProps {
  scene: SceneTiming;
  visual: PhoneFlowVisualT;
}

const PHONE_W = 400;
const PHONE_H = 720;
const PHONE_GAP = 80;
const BEZEL = 14;
const OWNER_H = 84;
const SWAP_S = 0.3;
const PIN_DOTS = 6;
const PIN_STEP_S = 0.16;
const PRESS_DELAY_S = 0.5;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;

const toneColor = (tone: PhoneFlowScreenT["tone"]): string => (tone === "bad" ? LIGHT.red : tone === "good" ? LIGHT.greenHl : LIGHT.ink);

/** Pay screen: payee avatar + name, big amount, Pay button that gets pressed shortly after the cue. */
const PayScreen: React.FC<{ s: PhoneFlowScreenT; t: number; at: number }> = ({ s, t, at }) => {
  const press = s.press === false ? 0 : ease(t, at + PRESS_DELAY_S, 0.12) - ease(t, at + PRESS_DELAY_S + 0.12, 0.12);
  const initials = (s.to ?? "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 28px 36px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: EX_FONTS.mono, fontSize: 20, color: LIGHT.sub, letterSpacing: 2 }}>PAYING</div>
      <div
        style={{
          marginTop: 26, width: 110, height: 110, borderRadius: 55, background: LIGHT.greenSoft, color: LIGHT.green, display: "flex",
          alignItems: "center", justifyContent: "center", fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 44,
        }}
      >
        {initials}
      </div>
      <div style={{ marginTop: 18, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 32, color: LIGHT.ink, textAlign: "center" }}>{s.to}</div>
      <div style={{ marginTop: 40, fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 84, color: LIGHT.ink }}>{s.amount}</div>
      <div
        style={{
          marginTop: "auto", width: "100%", height: 84, borderRadius: 22, background: LIGHT.greenHl, color: "#fff", display: "flex",
          alignItems: "center", justifyContent: "center", fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 32, transform: `scale(${1 - 0.06 * press})`,
        }}
      >
        {s.button ?? "Pay"}
      </div>
    </div>
  );
};

/** Secure PIN pad: dots fill one by one; a lock badge says the screen is protected. */
const PinScreen: React.FC<{ s: PhoneFlowScreenT; t: number; at: number }> = ({ s, t, at }) => {
  const filled = Math.max(0, Math.min(PIN_DOTS, Math.floor((t - at - 0.3) / PIN_STEP_S) + 1));
  // tone "bad" = a scam prompt: same pad, red accents.
  const accent = s.tone === "bad" ? "#ff8a8d" : "#7ee2a8";
  const accentBg = s.tone === "bad" ? "rgba(229,72,77,0.22)" : "rgba(34,163,90,0.2)";
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 30px 30px", boxSizing: "border-box", background: LIGHT.dark }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, background: accentBg, color: accent, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 20 }}>
        <Icon name="lock" size={22} color={accent} stroke={2.6} />
        {s.sub ?? "SECURE SCREEN"}
      </div>
      <div style={{ marginTop: 30, fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 34, color: "#fff", textAlign: "center", lineHeight: 1.15 }}>{s.title ?? "Enter UPI PIN"}</div>
      <div style={{ marginTop: 30, display: "flex", gap: 18 }}>
        {Array.from({ length: PIN_DOTS }, (_, i) => (
          <div key={i} style={{ width: 22, height: 22, borderRadius: 11, border: `3px solid ${accent}`, background: i < filled ? accent : "transparent" }} />
        ))}
      </div>
      <div style={{ marginTop: "auto", width: "100%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 14 }}>
        {KEYS.map((k, i) => {
          const hit = k !== "" && i === (filled * 5) % 10 && filled > 0 && filled < PIN_DOTS;
          return (
            <div
              key={i}
              style={{
                height: 74, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 37, margin: "0 14px",
                background: hit ? accentBg : "transparent", fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 36, color: "#fff",
              }}
            >
              {k}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Result screen: big icon disc (green check / red lock) with title and sub. */
const StatusScreen: React.FC<{ s: PhoneFlowScreenT; t: number; at: number }> = ({ s, t, at }) => {
  const color = toneColor(s.tone);
  const pop = back(t, at + 0.05, 0.45);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", boxSizing: "border-box" }}>
      <div style={{ width: 180, height: 180, borderRadius: 90, background: color, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop})`, boxShadow: SHADOW }}>
        <Icon name={s.icon ?? (s.tone === "bad" ? "lock" : "check")} size={96} color="#fff" stroke={3.2} />
      </div>
      <div style={{ marginTop: 40, fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 44, color, textAlign: "center", lineHeight: 1.1 }}>{s.title}</div>
      {s.sub ? <div style={{ marginTop: 16, fontFamily: EX_FONTS.sans, fontSize: 28, color: LIGHT.sub, textAlign: "center", lineHeight: 1.3 }}>{s.sub}</div> : null}
    </div>
  );
};

const SCREENS = { pay: PayScreen, pin: PinScreen, status: StatusScreen } as const;

/** 1-2 phones whose screens swap on cues: pay -> PIN pad -> paid / blocked. Good for any "what the user sees" flow. */
export const PhoneFlowScene: React.FC<PhoneFlowSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const top = SPLIT_CONTENT.top;
  const n = visual.phones.length;
  const left0 = (EX_WIDTH - (n * PHONE_W + (n - 1) * PHONE_GAP)) / 2;
  const noteAt = visual.note ? cue(visual.note.cue) - 0.1 : 0;
  // A later phone joins: phones before it start centred, then slide aside to make room.
  const appearAt = visual.phones.map((p) => cue(p.screens[0].cue) - 0.35);
  const slotShift = (pi: number): number =>
    visual.phones.slice(pi + 1).reduce((acc, _, k) => acc + (1 - ease(t, appearAt[pi + 1 + k], 0.5)) * ((PHONE_W + PHONE_GAP) / 2), 0);

  return (
    <>
      {visual.phones.map((phone, pi) => {
        const ats = phone.screens.map((s) => cue(s.cue) - 0.1);
        const appear = ats[0] - 0.25;
        const idx = ats.reduce((acc, at, i) => (t >= at ? i : acc), 0);
        const bad = phone.tone === "bad";
        const live = phone.screens[idx];
        const liveTone = t >= ats[idx] ? live.tone : undefined;
        return (
          <div key={pi} style={{ position: "absolute", left: left0 + pi * (PHONE_W + PHONE_GAP) + slotShift(pi), top, width: PHONE_W, ...enter(t, appear, 50) }}>
            <div style={{ height: OWNER_H, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              <Pill icon={bad ? "user" : "phone"} text={phone.owner} tone={bad ? "light" : "dark"} style={bad ? { color: LIGHT.red, border: `2px solid ${LIGHT.red}` } : undefined} />
            </div>
            <div
              style={{
                width: PHONE_W, height: PHONE_H, borderRadius: 60, background: "#16181d", padding: BEZEL, boxSizing: "border-box", boxShadow: SHADOW,
                outline: liveTone === "bad" ? `6px solid ${LIGHT.red}` : liveTone === "good" ? `6px solid ${LIGHT.greenHl}` : "none", outlineOffset: 4,
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 48, overflow: "hidden", background: LIGHT.card }}>
                {phone.screens.map((s, si) => {
                  if (si !== idx && si !== idx - 1) return null;
                  const at = ats[si];
                  const inP = si === 0 ? 1 : ease(t, at, SWAP_S);
                  const outP = si < idx ? ease(t, ats[idx], SWAP_S) : 0;
                  if (outP >= 1) return null;
                  const Screen = SCREENS[s.kind];
                  return (
                    <div key={si} style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - inP) * 100 - outP * 30}%)`, opacity: 1 - outP * 0.6 }}>
                      <Screen s={s} t={t} at={at} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      {visual.note ? (
        <Centered top={top + OWNER_H + PHONE_H + 30} style={enter(t, noteAt)}>
          <Pill icon="check" text={visual.note.text} tone="dark" />
        </Centered>
      ) : null}
      {visual.phones.flatMap((phone, pi) =>
        phone.screens.map((s, si) => {
          const at = Math.max(0, cue(s.cue) - 0.1);
          const name = s.kind === "status" ? (s.tone === "bad" ? "alert" : "ding") : si === 0 ? "pop" : "whoosh";
          return <Sfx key={`${pi}-${si}`} name={name} at={f(at)} volume={0.25} />;
        }),
      )}
    </>
  );
};
