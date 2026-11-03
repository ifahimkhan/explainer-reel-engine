import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandBadge } from "./components/BrandBadge";
import { Callout } from "./components/Callout";
import { EndCard } from "./components/EndCard";
import { HookCard } from "./components/HookCard";
import { KeywordChips } from "./components/KeywordChips";
import { StepTracker } from "./components/StepTracker";
import { COLORS, sec } from "./theme";
import { ReelConfig } from "./types";

const span = (from: number, to: number) => ({ from: sec(from), durationInFrames: sec(to) - sec(from) });

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 8,
        width: `${(frame / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.cyan})`,
        boxShadow: `0 0 14px ${COLORS.green}`,
      }}
    />
  );
};

/** Motion-graphics layer shared by reels and shorts. */
export const Overlays: React.FC<{ config: ReelConfig }> = ({ config }) => {
  const { zones, hook, tracker, callouts, chips, endCardFrom } = config;
  return (
    <>
      <Sequence {...span(0, hook.to)} name="Hook">
        <HookCard hook={hook} overlayBottom={zones.overlayBottom} />
      </Sequence>

      {tracker && zones.sidePanel && (
        <Sequence {...span(tracker.from, tracker.to)} name="StepTracker">
          <StepTracker steps={tracker.steps} from={tracker.from} panel={zones.sidePanel} />
        </Sequence>
      )}

      {callouts.map((c) => (
        <Sequence key={c.text} {...span(c.from, c.to)} name={`Callout: ${c.text}`}>
          <Callout spec={c} band={zones.calloutBand} />
        </Sequence>
      ))}

      {chips && (
        <Sequence {...span(chips.from, chips.to)} name="Keywords">
          <KeywordChips items={chips.items} from={chips.from} band={zones.calloutBand} />
        </Sequence>
      )}

      <Sequence {...span(hook.to, endCardFrom)} name="Brand">
        <BrandBadge />
      </Sequence>

      <Sequence from={sec(endCardFrom)} name="EndCard">
        <EndCard overlayBottom={zones.overlayBottom} />
      </Sequence>

      <ProgressBar />
    </>
  );
};
