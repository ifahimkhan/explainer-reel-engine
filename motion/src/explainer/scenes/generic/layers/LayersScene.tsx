import React from "react";
import { ease } from "../../../motion";
import { CONTENT_W, GUTTER } from "../../../theme";
import { SceneTiming, useSceneClock } from "../../../timeline";
import { Chat } from "./Chat";
import { BigView, CodeView, FlowView, HubView } from "./FlowDiagrams";
import { BadgesView, BillView, TraceView } from "./MetricDiagrams";
import type { DiagramT, LayersVisualT } from "./schema";
import { TRACKER_H, TRACKER_TOP, Tracker } from "./Tracker";

const DIAGRAM_TOP = TRACKER_TOP + TRACKER_H + 30;
const DIAGRAM_H = 300;
const SWAP_S = 0.3;

interface LayersSceneProps {
  scene: SceneTiming;
  visual: LayersVisualT;
}

interface ViewProps {
  d: DiagramT;
  t: number;
  start: number;
  cue: (tag: string) => number;
  f: (s: number) => number;
}

const DiagramView: React.FC<ViewProps> = ({ d, ...rest }) => {
  switch (d.kind) {
    case "big":
      return <BigView d={d} {...rest} />;
    case "flow":
      return <FlowView d={d} {...rest} />;
    case "hub":
      return <HubView d={d} {...rest} />;
    case "code":
      return <CodeView d={d} {...rest} />;
    case "bill":
      return <BillView d={d} {...rest} />;
    case "trace":
      return <TraceView d={d} {...rest} />;
    case "badges":
      return <BadgesView d={d} {...rest} />;
  }
};

/** Persistent chat + layer tracker; the diagram area below swaps to the latest cued diagram. */
export const LayersScene: React.FC<LayersSceneProps> = ({ scene, visual }) => {
  const { t, cue, f } = useSceneClock(scene);
  const starts = visual.diagrams.map((d) => (d.cue ? cue(d.cue) - 0.1 : 0.3));
  const current = starts.reduce((acc, s, i) => (t >= s ? i : acc), -1);

  return (
    <>
      <Chat t={t} app={visual.app} status={visual.status} messages={visual.chat} cue={cue} f={f} />
      <Tracker t={t} layers={visual.layers} warn={visual.warn} cue={cue} f={f} />
      {visual.diagrams.map((d, i) => {
        // Render the current diagram plus the one fading out behind it.
        if (i !== current && i !== current - 1) return null;
        const next = starts[i + 1];
        const out = next !== undefined ? ease(t, next - SWAP_S / 2, SWAP_S) : 0;
        if (out >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: GUTTER, top: DIAGRAM_TOP, width: CONTENT_W, height: DIAGRAM_H,
              opacity: 1 - out, transform: `translateY(${-out * 30}px)`,
            }}
          >
            <DiagramView d={d} t={t} start={starts[i]} cue={cue} f={f} />
          </div>
        );
      })}
    </>
  );
};
