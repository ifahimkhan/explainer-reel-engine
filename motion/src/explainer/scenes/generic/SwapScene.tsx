import React from "react";
import { Sfx } from "../../../components/Sfx";
import { Icon } from "../../components/Icon";
import { back, ease, range } from "../../motion";
import { SPLIT_CONTENT } from "../../split/layout";
import { EX_FONTS, EX_WIDTH, LIGHT, SHADOW } from "../../theme";
import { SceneTiming, useSceneClock } from "../../timeline";
import { bob, Burst } from "./fx";
import type { SwapVisualT } from "./visuals";

interface SwapSceneProps {
  scene: SceneTiming;
  visual: SwapVisualT;
}

const SIDE = 80;
const CARD_W = EX_WIDTH - SIDE * 2;
const TRACK_Y = SPLIT_CONTENT.top + 10;
const PAID_Y = SPLIT_CONTENT.top + 100;
const PAID_H = 130;
const ARROW_Y = PAID_Y + PAID_H + 26;
const CARD_Y = ARROW_Y + 74;
const CARD_H = 360;
const STAR_TICK_S = 0.9;

/** 48256 -> "48.3k", 209732 -> "210k". */
export const formatStars = (n: number): string => {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
};

interface TrackerProps {
  step: number;
  total: number;
  t: number;
}

/** "3/9" pill plus one square per item; done items are filled, the current one pops in. */
const Tracker: React.FC<TrackerProps> = ({ step, total, t }) => (
  <div style={{ position: "absolute", left: SIDE, right: SIDE, top: TRACK_Y, display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 28, padding: "6px 16px", borderRadius: 12,
        border: `3px solid ${LIGHT.ink}`, color: LIGHT.ink, background: LIGHT.card, marginRight: 8,
      }}
    >
      {step}/{total}
    </div>
    {Array.from({ length: total }, (_, i) => {
      const current = i === step - 1;
      const filled = i < step - 1 || (current && t > 0.2);
      const pop = current ? back(t, 0.2, 0.4) : 1;
      return (
        <div
          key={i}
          style={{
            width: 46, height: 46, borderRadius: 10, boxSizing: "border-box", border: `3px solid ${LIGHT.ink}`,
            background: filled ? LIGHT.greenHl : LIGHT.card, transform: `scale(${current ? 0.7 + 0.3 * pop : 1})`,
          }}
        />
      );
    })}
  </div>
);

interface PaidRowProps {
  visual: SwapVisualT;
  t: number;
  strikeAt: number;
}

/** The paid app: slides in, then a red line strikes through it and the row fades back. */
const PaidRow: React.FC<PaidRowProps> = ({ visual, t, strikeAt }) => {
  const enter = ease(t, 0.1, 0.45);
  const strike = ease(t, strikeAt, 0.35);
  const dim = range(t, [strikeAt + 0.2, strikeAt + 0.6], [1, 0.5]);
  return (
    <div
      style={{
        position: "absolute", left: SIDE, top: PAID_Y, width: CARD_W, height: PAID_H, boxSizing: "border-box",
        borderRadius: 28, background: LIGHT.card, border: `3px solid ${LIGHT.line}`, boxShadow: SHADOW,
        display: "flex", alignItems: "center", gap: 22, padding: "0 34px", opacity: enter * dim,
        transform: `translateX(${(1 - enter) * -120}px) scale(${1 - 0.04 * strike})`,
      }}
    >
      <div
        style={{
          fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: LIGHT.red,
          border: `2px solid ${LIGHT.red}`, borderRadius: 8, padding: "4px 10px",
        }}
      >
        PAID
      </div>
      <Icon name={visual.paid.icon} size={50} color={LIGHT.sub} stroke={2} />
      <div style={{ position: "relative", fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 56, letterSpacing: -1.5, color: LIGHT.ink }}>
        {visual.paid.name}
        <div
          style={{
            position: "absolute", left: -6, top: "52%", height: 7, borderRadius: 4, background: LIGHT.red,
            width: `calc(${strike * 100}% + ${strike * 12}px)`,
          }}
        />
      </div>
      <div style={{ marginLeft: "auto", fontFamily: EX_FONTS.mono, fontSize: 28, color: LIGHT.muted }}>$ / month</div>
    </div>
  );
};

interface RepoCardProps {
  visual: SwapVisualT;
  t: number;
  inAt: number;
  featureAt: number[];
}

/** The free alternative: icon tile, name, owner/repo, license chip, ticking stars and feature chips. */
const RepoCard: React.FC<RepoCardProps> = ({ visual, t, inAt, featureAt }) => {
  const { repo } = visual;
  const enter = back(t, inAt, 0.55);
  const stars = Math.round(repo.stars * ease(t, inAt + 0.3, STAR_TICK_S));
  return (
    <div
      style={{
        position: "absolute", left: SIDE, top: CARD_Y + (1 - enter) * 160 + bob(t, 2, 4), width: CARD_W, height: CARD_H,
        boxSizing: "border-box", borderRadius: 34, background: LIGHT.card, border: `4px solid ${LIGHT.ink}`,
        boxShadow: `10px 12px 0 ${LIGHT.ink}`, padding: "34px 38px", opacity: ease(t, inAt, 0.2),
        transform: `scale(${0.85 + 0.15 * enter})`, display: "flex", flexDirection: "column", gap: 22,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <div
          style={{
            width: 104, height: 104, borderRadius: 26, background: LIGHT.greenHl, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Icon name={repo.icon} size={60} color="#fff" stroke={2.2} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 70, letterSpacing: -2, lineHeight: 1, color: LIGHT.ink }}>
            {repo.name}
          </div>
          <div style={{ fontFamily: EX_FONTS.mono, fontSize: 28, color: LIGHT.sub }}>{repo.path}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Icon name="github" size={38} color={LIGHT.ink} stroke={2} />
        <div
          style={{
            fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 24, letterSpacing: 1, color: LIGHT.green,
            border: `2px solid ${LIGHT.green}`, background: LIGHT.greenSoft, borderRadius: 8, padding: "5px 12px",
          }}
        >
          {repo.license.toUpperCase()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 32, color: LIGHT.ink }}>
          <Icon name="star" size={32} color={LIGHT.yellow} stroke={2.4} />
          {formatStars(stars)}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {visual.features.map((feat, i) => {
          const pop = back(t, featureAt[i], 0.35);
          return (
            <div
              key={feat.text}
              style={{
                fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 34, color: "#fff", background: LIGHT.ink,
                borderRadius: 14, padding: "10px 22px", opacity: ease(t, featureAt[i], 0.15), transform: `scale(${pop})`,
              }}
            >
              {feat.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Paid app struck through, free GitHub alternative slides up, FREE stamp slams on. */
export const SwapScene: React.FC<SwapSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const repoAt = cue(visual.repo.cue) - 0.1;
  const featureAt = visual.features.map((feat) => cue(feat.cue) - 0.1);
  const stampAt = Math.max(cue(visual.stamp.cue) - 0.1, repoAt + 0.6);
  const arrow = ease(t, repoAt, 0.3);
  const stamp = back(t, stampAt, 0.35);
  const stampX = SIDE + CARD_W - 250;
  const stampY = CARD_Y + CARD_H - 70;

  return (
    <>
      <Tracker step={visual.step} total={visual.total} t={t} />
      <PaidRow visual={visual} t={t} strikeAt={repoAt} />
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: ARROW_Y, display: "flex", justifyContent: "center", alignItems: "center",
          gap: 12, fontFamily: EX_FONTS.mono, fontWeight: 700, fontSize: 30, color: LIGHT.green, opacity: arrow,
          transform: `translateY(${(1 - arrow) * -16}px)`,
        }}
      >
        <Icon name="arrowDown" size={34} color={LIGHT.green} stroke={2.6} />
        free on GitHub
      </div>
      <RepoCard visual={visual} t={t} inAt={repoAt} featureAt={featureAt} />
      <div
        style={{
          position: "absolute", left: stampX, top: stampY, opacity: ease(t, stampAt, 0.08),
          transform: `scale(${2.4 - 1.4 * stamp}) rotate(${-10 * stamp}deg)`,
        }}
      >
        <div
          style={{
            padding: "10px 30px", borderRadius: 16, border: `6px solid ${LIGHT.green}`, color: LIGHT.green,
            background: "rgba(220,252,231,0.92)", fontFamily: EX_FONTS.sans, fontWeight: 900, fontSize: 72, letterSpacing: 3,
          }}
        >
          {visual.stamp.text}
        </div>
      </div>
      <Burst t={t} at={stampAt + 0.2} x={stampX + 120} y={stampY + 50} radius={260} count={16} />
      <Sfx name="whoosh" at={f(Math.max(0, repoAt))} volume={0.22} />
      {featureAt.map((at, i) => (
        <Sfx key={i} name="pop" at={f(Math.max(0, at))} volume={0.25} />
      ))}
      <Sfx name="impact" at={f(stampAt + 0.12)} volume={0.32} />
    </>
  );
};
