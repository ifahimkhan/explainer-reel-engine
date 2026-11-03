import React from "react";
import type { SceneTiming } from "../../timeline";
import { CardsScene } from "./CardsScene";
import { ChipsScene } from "./ChipsScene";
import { CommentScene } from "./CommentScene";
import { CompareScene } from "./CompareScene";
import { EditorScene } from "./EditorScene";
import { FollowScene } from "./FollowScene";
import { MergeScene } from "./MergeScene";
import { PairScene } from "./PairScene";
import { PhonesScene } from "./PhonesScene";
import { PhoneFlowScene } from "./PhoneFlowScene";
import { ReasonScene } from "./ReasonScene";
import { ReceiptScene } from "./ReceiptScene";
import { ScreenshotScene } from "./ScreenshotScene";
import { StatScene } from "./StatScene";
import { StepsScene } from "./StepsScene";
import { TabsScene } from "./TabsScene";
import { TerminalScene } from "./TerminalScene";
import { TitleScene } from "./TitleScene";
import { TrioScene } from "./TrioScene";
import { JourneyScene } from "./JourneyScene";
import { LayersScene } from "./layers/LayersScene";
import { ChartScene } from "./ChartScene";
import { PunchScene } from "./PunchScene";
import { DiffScene } from "./DiffScene";
import { PhoneAppScene } from "./PhoneAppScene";
import { QuizScene } from "./QuizScene";
import { SequenceScene } from "./SequenceScene";
import { parseVisual } from "./visuals";

/** Renders a scene from its job-declared `visual`. Throws on a missing or invalid visual. */
export const renderVisual = (scene: SceneTiming): React.ReactNode => {
  const visual = parseVisual(scene.id, scene.visual);
  switch (visual.type) {
    case "title":
      return <TitleScene scene={scene} visual={visual} />;
    case "phoneflow":
      return <PhoneFlowScene scene={scene} visual={visual} />;
    case "phones":
      return <PhonesScene scene={scene} visual={visual} />;
    case "steps":
      return <StepsScene scene={scene} visual={visual} />;
    case "compare":
      return <CompareScene scene={scene} visual={visual} />;
    case "stat":
      return <StatScene scene={scene} visual={visual} />;
    case "cards":
      return <CardsScene scene={scene} visual={visual} />;
    case "trio":
      return <TrioScene scene={scene} visual={visual} />;
    case "journey":
      return <JourneyScene scene={scene} visual={visual} />;
    case "chips":
      return <ChipsScene scene={scene} visual={visual} />;
    case "reason":
      return <ReasonScene scene={scene} visual={visual} />;
    case "receipt":
      return <ReceiptScene scene={scene} visual={visual} />;
    case "comment":
      return <CommentScene scene={scene} visual={visual} />;
    case "pair":
      return <PairScene scene={scene} visual={visual} />;
    case "terminal":
      return <TerminalScene scene={scene} visual={visual} />;
    case "editor":
      return <EditorScene scene={scene} visual={visual} />;
    case "tabs":
      return <TabsScene scene={scene} visual={visual} />;
    case "screenshot":
      return <ScreenshotScene scene={scene} visual={visual} />;
    case "merge":
      return <MergeScene scene={scene} visual={visual} />;
    case "follow":
      return <FollowScene scene={scene} visual={visual} />;
    case "layers":
      return <LayersScene scene={scene} visual={visual} />;
    case "punch":
      return <PunchScene scene={scene} visual={visual} />;
    case "chart":
      return <ChartScene scene={scene} visual={visual} />;
    case "sequence":
      return <SequenceScene scene={scene} visual={visual} />;
    case "diff":
      return <DiffScene scene={scene} visual={visual} />;
    case "quiz":
      return <QuizScene scene={scene} visual={visual} />;
    case "phoneapp":
      return <PhoneAppScene scene={scene} visual={visual} />;
  }
};

/** Header label for a scene: the visual's `label`, else the scene id. */
export const visualLabel = (scene: SceneTiming): string => {
  const raw = scene.visual as { label?: unknown } | undefined;
  return typeof raw?.label === "string" ? raw.label : scene.id.toUpperCase();
};
