import React from "react";
import { Sfx } from "../../components/Sfx";
import { Card } from "../components/Primitives";
import { TrickChip, UrlBar } from "../components/UrlBar";
import { ease, enter, typed } from "../motion";
import { EX_FONTS, GUTTER, LIGHT } from "../theme";
import { SceneTiming, useCopy, useSceneClock } from "../timeline";

interface SceneProps {
  scene: SceneTiming;
}

const SIDEBAR = ["Overview", "Architecture", "Routing", "API", "Setup"] as const;
const ACTIVE = "Architecture";
const SOURCES = ["lib/auth.ts", "middleware.ts"] as const;

const DOC_TOP = 410;
const DOC_H = 500;
const SIDEBAR_W = 250;

export const WikiScene: React.FC<SceneProps> = ({ scene }) => {
  const { t, cue, f } = useSceneClock(scene);
  const copy = useCopy();
  const morphAt = cue("morph") - 0.45;
  const docAt = cue("doc") - 0.5;
  const askAt = cue("ask") - 0.1;
  const answerAt = cue("answer") - 0.2;
  const [pre, file, post] = [copy("wiki.answerPre"), copy("wiki.answerFile"), copy("wiki.answerPost")];
  const answer = typed(pre + file + post, t, answerAt, 60);
  const preLen = pre.length;
  const fileLen = file.length;

  return (
    <>
      <TrickChip t={t} text="TRICK 3/5 · DeepWiki" />
      <UrlBar t={t} morphAt={morphAt} prefix="" from="github" to="deepwiki" enterAt={0.05} />

      <Card style={{ top: DOC_TOP, left: GUTTER, right: GUTTER, height: DOC_H, ...enter(t, docAt) }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDEBAR_W, background: "#f3f5f2", borderRight: `2px solid ${LIGHT.line}`, padding: "30px 24px" }}>
          {SIDEBAR.map((item, i) => (
            <div
              key={item}
              style={{
                fontFamily: EX_FONTS.sans, fontWeight: item === ACTIVE ? 700 : 500, fontSize: 24, padding: "10px 14px",
                borderRadius: 10, marginBottom: 4, color: item === ACTIVE ? LIGHT.green : LIGHT.sub,
                background: item === ACTIVE ? LIGHT.greenSoft : "transparent", opacity: ease(t, docAt + 0.2 + i * 0.08, 0.3),
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 34, left: SIDEBAR_W + 36, right: 36 }}>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 42, color: LIGHT.ink, opacity: ease(t, docAt + 0.3, 0.3) }}>
            Architecture
          </div>
          {[1, 0.92, 0.7].map((w, i) => (
            <div
              key={i}
              style={{ marginTop: i === 0 ? 24 : 14, height: 16, borderRadius: 8, background: LIGHT.line, width: `${w * 100 * ease(t, docAt + 0.4 + i * 0.1, 0.5)}%` }}
            />
          ))}
          <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{ height: 70, borderRadius: 12, background: i % 3 === 0 ? LIGHT.greenSoft : "#eef1f5", opacity: ease(t, docAt + 0.6 + i * 0.05, 0.3) }} />
            ))}
          </div>
        </div>
      </Card>

      <div
        style={{
          position: "absolute", top: 945, right: GUTTER, padding: "16px 26px", borderRadius: "24px 24px 6px 24px",
          background: LIGHT.dark, color: "#fff", fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 28, ...enter(t, askAt, 16),
        }}
      >
        {copy("wiki.question")}
      </div>

      <Card style={{ top: 1035, left: GUTTER, width: 780, height: 190, padding: "22px 28px", ...enter(t, answerAt, 16) }}>
        <div style={{ fontFamily: EX_FONTS.sans, fontSize: 26, lineHeight: 1.45, color: LIGHT.ink, fontWeight: 500 }}>
          {answer.slice(0, preLen)}
          <span style={{ fontFamily: EX_FONTS.mono, fontWeight: 700 }}>{answer.slice(preLen, preLen + fileLen)}</span>
          {answer.slice(preLen + fileLen)}
        </div>
        <div style={{ position: "absolute", left: 28, bottom: 18, display: "flex", gap: 10 }}>
          {SOURCES.map((s, i) => (
            <div key={s} style={{ fontFamily: EX_FONTS.mono, fontSize: 18, padding: "4px 12px", borderRadius: 8, background: LIGHT.greenSoft, color: LIGHT.green, opacity: ease(t, answerAt + 1.4 + i * 0.1, 0.3) }}>
              {s}
            </div>
          ))}
        </div>
      </Card>

      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="type" at={f(morphAt)} volume={0.3} />
      <Sfx name="pop" at={f(docAt)} />
      <Sfx name="pop" at={f(askAt)} />
      <Sfx name="type" at={f(answerAt)} volume={0.2} />
    </>
  );
};
