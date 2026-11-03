import React from "react";
import { Sfx } from "../../components/Sfx";
import { Icon } from "../components/Icon";
import { Card, CardLabel, Centered, Pill } from "../components/Primitives";
import { TrickChip, UrlBar, morphDuration } from "../components/UrlBar";
import { ease, enter, range, typed } from "../motion";
import { EX_FONTS, GUTTER, LIGHT } from "../theme";
import { SceneTiming, useCopy, useSceneClock } from "../timeline";

interface SceneProps {
  scene: SceneTiming;
}

interface KeyLine {
  key?: string;
  text: string;
}

/** Monospace lines typed one after another starting at `at`. */
const TypedLines: React.FC<{ lines: readonly KeyLine[]; t: number; at: number; size?: number }> = ({
  lines, t, at, size = 26,
}) => {
  const cps = 55;
  const starts = lines.reduce<number[]>(
    (acc, l, i) => [...acc, i === 0 ? at : acc[i - 1] + ((lines[i - 1].key ?? "").length + lines[i - 1].text.length) / cps],
    [],
  );
  return (
    <div style={{ fontFamily: EX_FONTS.mono, fontSize: size, lineHeight: 1.65, color: LIGHT.ink }}>
      {lines.map((l, i) => {
        const full = `${l.key ? `${l.key} ` : ""}${l.text}`;
        const shown = typed(full, t, starts[i], cps);
        const keyPart = l.key ? shown.slice(0, l.key.length) : "";
        return (
          <div key={i} style={{ minHeight: size * 1.65, whiteSpace: "pre" }}>
            <span style={{ fontWeight: 700, color: LIGHT.green }}>{keyPart}</span>
            {shown.slice(keyPart.length)}
          </div>
        );
      })}
    </div>
  );
};

const PROMPT_MD: readonly KeyLine[] = [
  { key: "Build", text: "a full-stack React app with server" },
  { text: "file-based routing, image optimisation" },
  { key: "Structure:", text: "app/, components/, lib/ ..." },
];

export const HookScene: React.FC<SceneProps> = ({ scene }) => {
  const { t, cue, f, sentence } = useSceneClock(scene);
  const copy = useCopy();
  const morphAt = cue("morph") - 0.1;
  const morphEnd = morphAt + morphDuration("hub", "reverse");

  return (
    <>
      <UrlBar t={t} morphAt={morphAt} prefix="git" from="hub" to="reverse" markAt={cue("mark")} />
      <Centered top={420} style={enter(t, morphEnd)}>
        <Pill icon="wand" text={copy("hook.badge")} />
      </Centered>
      <Card style={{ top: 540, left: GUTTER + 20, right: GUTTER + 20, height: 250, padding: "28px 34px", ...enter(t, sentence(1)) }}>
        <CardLabel icon="file" text="PROMPT.md" color={LIGHT.green} />
        <div style={{ marginTop: 16 }}>
          <TypedLines lines={PROMPT_MD} t={t} at={cue("prompt") - 0.5} />
        </div>
      </Card>
      <Sfx name="impact" at={0} volume={0.25} />
      <Sfx name="type" at={f(morphAt)} volume={0.3} />
      <Sfx name="pop" at={f(morphEnd)} />
      <Sfx name="whoosh" at={f(sentence(1))} volume={0.25} />
    </>
  );
};

const TREE = ["app/", "components/", "lib/", "public/", "README.md"] as const;
const CLEAN_PROMPT: readonly KeyLine[] = [
  { key: "Goal:", text: "rebuild this app" },
  { key: "Stack:", text: "Next.js, React" },
  { key: "Features:", text: "routing, auth" },
  { key: "Structure:", text: "app/ lib/ ..." },
];
const TERMINAL = ["> paste PROMPT.md", "✓ planning 12 files", "✓ building app/", "✓ done"] as const;

const LEFT_W = 450;
const RIGHT_W = 420;
const ROW1 = 410;
const ROW2 = 860;
const CARD_H = 380;

const Arrow: React.FC<{ name: "arrowRight" | "arrowDown" | "arrowLeft"; left: number; top: number; p: number }> = ({
  name, left, top, p,
}) => (
  <div style={{ position: "absolute", left, top, opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>
    <Icon name={name} size={44} color={LIGHT.ink} stroke={2.4} />
  </div>
);

export const ReverseScene: React.FC<SceneProps> = ({ scene }) => {
  const { t, cue, f } = useSceneClock(scene);
  const morphAt = cue("morph") - 0.35;
  const repoAt = cue("repo") - 0.4;
  const promptAt = cue("clean") - 0.3;
  const claudeAt = cue("claude") - 0.3;
  const versionAt = cue("version") - 0.25;
  const scan = ((t - repoAt) % 1.4) / 1.4;
  const rightX = 1080 - GUTTER - RIGHT_W;

  return (
    <>
      <TrickChip t={t} text="TRICK 1/5 · GitReverse" />
      <UrlBar t={t} morphAt={morphAt} prefix="git" from="hub" to="reverse" enterAt={0.05} />

      <Card style={{ top: ROW1, left: GUTTER, width: LEFT_W, height: CARD_H, padding: 28, ...enter(t, repoAt) }}>
        <CardLabel icon="github" text="Repo" />
        <div style={{ marginTop: 14, fontFamily: EX_FONTS.mono, fontSize: 30, lineHeight: 1.6 }}>
          {TREE.map((item, i) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, opacity: ease(t, repoAt + 0.15 + i * 0.08, 0.3) }}>
              <Icon name={item.endsWith("/") ? "folder" : "file"} size={26} color={item.endsWith("/") ? LIGHT.cyan : LIGHT.muted} />
              {item}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: 60 + scan * (CARD_H - 80), height: 50,
            background: `linear-gradient(180deg, transparent, ${LIGHT.greenGlow}, transparent)`,
            opacity: t > repoAt + 0.3 && t < claudeAt ? 1 : 0,
          }}
        />
      </Card>

      <Arrow name="arrowRight" left={GUTTER + LEFT_W + 18} top={ROW1 + CARD_H / 2 - 22} p={ease(t, promptAt, 0.3)} />
      <Card style={{ top: ROW1, left: rightX, width: RIGHT_W, height: CARD_H, padding: 28, ...enter(t, promptAt) }}>
        <CardLabel icon="file" text="Clean prompt" />
        <div style={{ marginTop: 14 }}>
          <TypedLines lines={CLEAN_PROMPT} t={t} at={cue("prompt") - 0.2} size={24} />
        </div>
      </Card>

      <Arrow name="arrowDown" left={rightX + RIGHT_W / 2 - 22} top={ROW1 + CARD_H + 12} p={ease(t, claudeAt, 0.3)} />
      <Card dark style={{ top: ROW2, left: rightX, width: RIGHT_W, height: CARD_H, padding: 28, ...enter(t, claudeAt) }}>
        <CardLabel icon="terminal" text="Claude Code" color="#8b93a1" />
        <div style={{ marginTop: 18, fontFamily: EX_FONTS.mono, fontSize: 26, lineHeight: 1.8 }}>
          {TERMINAL.map((line, i) => {
            const at = cue("paste") - 0.1 + i * 0.4;
            return (
              <div key={line} style={{ color: i === 0 ? "#e6e8eb" : "#4ade80", opacity: ease(t, at, 0.2) }}>{line}</div>
            );
          })}
        </div>
      </Card>

      <Arrow name="arrowLeft" left={GUTTER + LEFT_W + 18} top={ROW2 + CARD_H / 2 - 22} p={ease(t, versionAt, 0.3)} />
      <Card style={{ top: ROW2, left: GUTTER, width: LEFT_W, height: CARD_H, padding: 28, ...enter(t, versionAt) }}>
        <CardLabel icon="sparkle" text="Your version" color={LIGHT.green} />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {[90, 60, 60].map((w, i) => (
            <div key={i} style={{ width: w, height: 14, borderRadius: 7, background: LIGHT.line }} />
          ))}
        </div>
        <div style={{ marginTop: 18, height: 110, borderRadius: 16, background: LIGHT.greenSoft, transformOrigin: "left", transform: `scaleX(${ease(t, versionAt + 0.2, 0.5)})` }} />
        <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1, height: 60, borderRadius: 14, background: "#eef1ee", opacity: ease(t, versionAt + 0.35 + i * 0.1, 0.3) }} />
          ))}
        </div>
        <div
          style={{
            position: "absolute", right: 24, bottom: 22, display: "flex", alignItems: "center", gap: 6,
            padding: "8px 18px", borderRadius: 999, background: LIGHT.greenHl, color: "#fff",
            fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 24, transform: `scale(${range(t, [versionAt + 0.6, versionAt + 0.9], [0, 1])})`,
          }}
        >
          <Icon name="check" size={22} color="#fff" stroke={3} /> Live
        </div>
      </Card>

      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="type" at={f(morphAt)} volume={0.3} />
      <Sfx name="pop" at={f(repoAt)} />
      <Sfx name="pop" at={f(promptAt)} />
      <Sfx name="type" at={f(cue("paste"))} volume={0.25} />
      <Sfx name="ding" at={f(versionAt + 0.6)} />
    </>
  );
};
