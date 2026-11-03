import React from "react";
import { Sfx } from "../../components/Sfx";
import { Icon } from "../components/Icon";
import { Centered, Pill } from "../components/Primitives";
import { back, ease, enter, range } from "../motion";
import { EX_FONTS, GUTTER, LIGHT, SHADOW } from "../theme";
import { SceneTiming, useCopy, useSceneClock } from "../timeline";

interface SceneProps {
  scene: SceneTiming;
}

const TILE_W = 172;
const TILE_H = 260;
const TILE_GAP = 16;

type TileState = "done" | "unlocking" | "locked";

const Tile: React.FC<{ n: number; state: TileState; p: number; bump: number }> = ({ n, state, p, bump }) => {
  const look = {
    done: { bg: LIGHT.greenSoft, border: LIGHT.greenHl, fg: LIGHT.green, icon: "check" as const, label: "REVERSE" },
    unlocking: { bg: LIGHT.yellow, border: LIGHT.yellow, fg: "#4a2f00", icon: "unlock" as const, label: "NEXT" },
    locked: { bg: LIGHT.dark, border: LIGHT.dark, fg: "#ffffff", icon: "lock" as const, label: "LOCKED" },
  }[state];
  return (
    <div
      style={{
        width: TILE_W, height: TILE_H, borderRadius: 22, background: look.bg, border: `3px solid ${look.border}`,
        color: look.fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: SHADOW, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${1 + 0.08 * bump})`,
      }}
    >
      <Icon name={look.icon} size={44} stroke={2.4} />
      <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 40 }}>{n}</div>
      <div style={{ fontFamily: EX_FONTS.mono, fontSize: 17, letterSpacing: 2, opacity: 0.85 }}>{look.label}</div>
    </div>
  );
};

export const TeaserScene: React.FC<SceneProps> = ({ scene }) => {
  const { t, cue, f } = useSceneClock(scene);
  const copy = useCopy();
  const unlockAt = cue("unlock");
  const bump = Math.sin(Math.PI * range(t, [unlockAt, unlockAt + 0.4], [0, 1]));

  return (
    <>
      <Centered top={300} style={enter(t, 0.05)}>
        <Pill icon="sparkle" text={copy("teaser.title")} mono />
      </Centered>
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", gap: TILE_GAP }}>
        {[1, 2, 3, 4, 5].map((n, i) => {
          const state: TileState = n === 1 ? "done" : n === 2 && t >= unlockAt ? "unlocking" : "locked";
          return <Tile key={n} n={n} state={state} p={ease(t, 0.1 + i * 0.07, 0.4)} bump={n === 2 ? bump : 0} />;
        })}
      </div>
      <Centered top={780} style={enter(t, cue("pill") - 0.2)}>
        <Pill icon="flame" text={copy("teaser.pill")} tone="yellow" />
      </Centered>
      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="ding" at={f(unlockAt)} />
      <Sfx name="pop" at={f(cue("pill") - 0.2)} />
    </>
  );
};

const RECAP = [
  { domain: "gitreverse.com", note: "repo → prompt" },
  { domain: "gitdiagram.com", note: "architecture map" },
  { domain: "deepwiki.com", note: "docs + chat" },
  { domain: "", note: "" },
  { domain: "", note: "" },
] as const;

const ROW_H = 104;
const ROW_GAP = 22;

export const RecapScene: React.FC<SceneProps> = ({ scene }) => {
  const { t, cue, f } = useSceneClock(scene);
  const copy = useCopy();
  return (
    <>
      {RECAP.map((row, i) => {
        const locked = row.domain === "";
        const at = 0.1 + i * 0.12;
        return (
          <div
            key={i}
            style={{
              position: "absolute", top: 330 + i * (ROW_H + ROW_GAP), left: GUTTER, right: GUTTER, height: ROW_H,
              display: "flex", alignItems: "center", gap: 22, padding: "0 28px", borderRadius: 22,
              background: locked ? LIGHT.dark : LIGHT.card, border: `2px solid ${locked ? LIGHT.dark : LIGHT.line}`,
              boxShadow: SHADOW, ...enter(t, at, 24),
            }}
          >
            <div
              style={{
                width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                background: locked ? "#2b3038" : LIGHT.greenHl, color: "#fff",
                fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30,
              }}
            >
              {i + 1}
            </div>
            {locked ? (
              <div style={{ width: 230, height: 26, borderRadius: 8, background: "#3a404a", filter: "blur(4px)" }} />
            ) : (
              <div style={{ fontFamily: EX_FONTS.mono, fontSize: 34, color: LIGHT.ink }}>{row.domain}</div>
            )}
            <div
              style={{
                marginLeft: "auto", fontFamily: EX_FONTS.sans, fontWeight: locked ? 700 : 500, fontSize: 24,
                color: locked ? "#4ade80" : LIGHT.muted, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {locked ? <Icon name="lock" size={22} /> : null}
              {locked ? copy("recap.locked") : row.note}
            </div>
          </div>
        );
      })}
      <Centered top={1010} style={{ opacity: ease(t, cue("pill") - 0.2, 0.35), transform: `scale(${0.9 + 0.1 * back(t, cue("pill") - 0.2)})` }}>
        <Pill icon="github" text={copy("recap.pill")} />
      </Centered>
      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="pop" at={f(cue("pill") - 0.2)} />
    </>
  );
};
