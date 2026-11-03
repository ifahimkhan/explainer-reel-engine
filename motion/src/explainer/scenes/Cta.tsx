import React from "react";
import { Img, staticFile } from "remotion";
import { Sfx } from "../../components/Sfx";
import { Icon } from "../components/Icon";
import { Card, Centered, Pill } from "../components/Primitives";
import { back, ease, enter, range, typed } from "../motion";
import { EX_FONTS, GUTTER, LIGHT } from "../theme";
import { SceneTiming, useCopy, useSceneClock } from "../timeline";

interface CtaSceneProps {
  scene: SceneTiming;
  brand: string;
}

const KEYWORD_CPS = 10;
const ROAD_PROGRESS = 0.62;

const SendButton: React.FC<{ bump: number; done?: boolean }> = ({ bump, done = false }) => (
  <div
    style={{
      width: 72, height: 72, borderRadius: 36, background: LIGHT.greenHl, display: "flex", alignItems: "center",
      justifyContent: "center", transform: `scale(${1 + 0.15 * bump})`, flexShrink: 0,
    }}
  >
    <Icon name={done ? "check" : "send"} size={34} color="#fff" stroke={2.4} />
  </div>
);

const rowStyle: React.CSSProperties = {
  left: GUTTER, right: GUTTER, display: "flex", alignItems: "center", gap: 22, padding: "0 26px",
};

export const CtaScene: React.FC<CtaSceneProps> = ({ scene, brand }) => {
  const { t, cue, f } = useSceneClock(scene);
  const copy = useCopy();
  const keyword = copy("cta.keyword");
  const typeAt = cue("type") - 0.3;
  const sentAt = typeAt + keyword.length / KEYWORD_CPS + 0.25;
  const dmAt = cue("dm") - 0.1;
  const shareAt = cue("share") - 0.2;
  const shareSentAt = cue("sent");
  const followAt = cue("follow") - 0.25;
  const subscribedAt = cue("follow") + 0.5;
  const roadAt = cue("road") - 0.2;
  const subscribed = t >= subscribedAt;
  const typedWord = typed(keyword, t, typeAt, KEYWORD_CPS);
  const caretOn = Math.floor(t * 3) % 2 === 0;
  const pulse = (at: number) => Math.sin(Math.PI * range(t, [at, at + 0.35], [0, 1]));

  return (
    <>
      <Centered top={290} style={enter(t, 0.05)}>
        <Pill icon="chat" text={copy("cta.title")} mono />
      </Centered>

      <Card style={{ top: 400, height: 130, ...rowStyle, ...enter(t, 0.15) }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: "#eef0ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="user" size={32} color={LIGHT.muted} />
        </div>
        <div style={{ flex: 1, height: 80, borderRadius: 40, border: `2px solid ${LIGHT.line}`, display: "flex", alignItems: "center", padding: "0 28px", fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 44, color: LIGHT.green, letterSpacing: 1 }}>
          {typedWord}
          <span style={{ width: 3, height: 44, marginLeft: 4, background: caretOn ? LIGHT.ink : "transparent" }} />
        </div>
        <SendButton bump={pulse(sentAt)} />
      </Card>

      <Card style={{ top: 560, height: 210, padding: "22px 26px", left: GUTTER, right: GUTTER, ...enter(t, dmAt) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={staticFile("logo.png")} style={{ width: 60, height: 60, borderRadius: 14 }} />
          <div>
            <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30, color: LIGHT.ink }}>{brand}</div>
            <div style={{ fontFamily: EX_FONTS.sans, fontSize: 22, color: LIGHT.muted }}>sent you a message</div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "14px 20px", borderRadius: 16, background: LIGHT.greenSoft }}>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 28, color: LIGHT.ink }}>{copy("cta.dmTitle")}</div>
          <div style={{ fontFamily: EX_FONTS.sans, fontSize: 22, color: LIGHT.sub }}>{copy("cta.dmSub")}</div>
        </div>
      </Card>

      <Card style={{ top: 795, height: 150, ...rowStyle, ...enter(t, shareAt) }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "#eef0ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="share" size={30} color={LIGHT.sub} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: EX_FONTS.sans, fontSize: 21, color: LIGHT.muted }}>{copy("cta.sendTo")}</div>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 28, color: LIGHT.ink, lineHeight: 1.2 }}>
            {copy("cta.share")}
          </div>
        </div>
        <SendButton bump={pulse(shareSentAt)} done={t >= shareSentAt} />
      </Card>

      <Card style={{ top: 970, height: 130, ...rowStyle, ...enter(t, followAt) }}>
        <div style={{ width: 64, height: 46, borderRadius: 12, background: LIGHT.youtube, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: "18px solid #fff", marginLeft: 4 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 30, color: LIGHT.ink }}>{brand}</div>
          <div style={{ fontFamily: EX_FONTS.sans, fontSize: 21, color: LIGHT.muted }}>YouTube</div>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 999,
            background: subscribed ? "#eef0ee" : LIGHT.youtube, color: subscribed ? LIGHT.ink : "#fff",
            fontFamily: EX_FONTS.sans, fontWeight: 800, fontSize: 26, transform: `scale(${1 + 0.1 * pulse(subscribedAt)})`,
          }}
        >
          {subscribed ? <Icon name="bell" size={24} /> : null}
          {subscribed ? "Subscribed" : "Subscribe"}
        </div>
      </Card>

      <div style={{ position: "absolute", top: 1135, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: ease(t, roadAt, 0.35) }}>
        <div style={{ fontFamily: EX_FONTS.sans, fontWeight: 700, fontSize: 30, color: LIGHT.sub, display: "flex", alignItems: "baseline", gap: 12 }}>
          Road to
          <span style={{ fontWeight: 800, fontSize: 52, color: LIGHT.red, transform: `scale(${0.8 + 0.2 * back(t, roadAt)})`, display: "inline-block" }}>10K</span>
        </div>
        <div style={{ width: 520, height: 14, borderRadius: 7, background: "rgba(15,17,21,0.08)" }}>
          <div style={{ width: `${ROAD_PROGRESS * 100 * ease(t, roadAt + 0.1, 0.9)}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg, ${LIGHT.red}, ${LIGHT.yellow})` }} />
        </div>
      </div>

      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="type" at={f(typeAt)} volume={0.3} />
      <Sfx name="ding" at={f(sentAt)} />
      <Sfx name="pop" at={f(dmAt)} />
      <Sfx name="pop" at={f(shareAt)} />
      <Sfx name="ding" at={f(shareSentAt)} volume={0.25} />
      <Sfx name="pop" at={f(subscribedAt)} />
      <Sfx name="impact" at={f(roadAt)} volume={0.2} />
    </>
  );
};
