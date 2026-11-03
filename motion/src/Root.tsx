import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { reel01 } from "./reels/reel01";
import { reel02 } from "./reels/reel02";
import { reel03 } from "./reels/reel03";
import { Short } from "./Short";
import { AD13_SHORTS } from "./shorts/ad13";
import { FPS, HEIGHT, WIDTH, sec } from "./theme";
import {
  GITHUB_TRICKS,
  GITHUB_TRICKS_EN,
  GITHUB_TRICKS_EN_FAHIM,
  GithubTricksEnFahimReel,
  GithubTricksEnReel,
  GithubTricksReel,
} from "./explainer/githubTricks";
import { EX_FPS, EX_HEIGHT, EX_WIDTH } from "./explainer/theme";

import { SCRIPT_REELS } from "./explainer/scriptReels";
import { SPLIT_REELS } from "./explainer/split/reels";

const EXPLAINERS = [
  { config: GITHUB_TRICKS, component: GithubTricksReel },
  { config: GITHUB_TRICKS_EN, component: GithubTricksEnReel },
  { config: GITHUB_TRICKS_EN_FAHIM, component: GithubTricksEnFahimReel },
  ...SPLIT_REELS,
  ...SCRIPT_REELS,
] as const;

const REELS = [reel01, reel02, reel03] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {REELS.map((config) => (
      <Composition
        key={config.id}
        id={config.id}
        component={Reel}
        durationInFrames={sec(config.durationS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ config }}
      />
    ))}
    {AD13_SHORTS.map((config) => (
      <Composition
        key={config.id}
        id={config.id}
        component={Short}
        durationInFrames={sec(config.durationS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ config }}
      />
    ))}
    {EXPLAINERS.map(({ config, component }) => (
      <Composition
        key={config.id}
        id={config.id}
        component={component}
        durationInFrames={Math.ceil(config.timeline.durationS * EX_FPS)}
        fps={EX_FPS}
        width={EX_WIDTH}
        height={EX_HEIGHT}
      />
    ))}
  </>
);
