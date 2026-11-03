import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, pop } from "../anim";
import { COLORS, FONTS, sec } from "../theme";
import { ChipSpec, Zones } from "../types";
import { Sfx } from "./Sfx";

const CHIP_COLORS = [COLORS.green, COLORS.cyan, COLORS.amber, COLORS.green] as const;

interface KeywordChipsProps {
  items: readonly ChipSpec[];
  /** Reel time (s) at which the parent Sequence starts. */
  from: number;
  band: Zones["calloutBand"];
}

export const KeywordChips: React.FC<KeywordChipsProps> = ({ items, from, band }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = fadeOut(frame, durationInFrames, 12);

  return (
    <div
      style={{
        position: "absolute",
        left: 30,
        right: 30,
        top: band.top,
        height: band.height,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        gap: 18,
        opacity: out,
        fontFamily: FONTS.display,
      }}
    >
      {items.map((chip, i) => {
        const at = sec(chip.at - from);
        const p = pop(frame, at, 9);
        const color = CHIP_COLORS[i % CHIP_COLORS.length];
        return (
          <div
            key={chip.label}
            style={{
              padding: "14px 28px",
              borderRadius: 40,
              background: COLORS.navyGlass,
              border: `3px solid ${color}`,
              color,
              fontSize: 38,
              fontWeight: 800,
              boxShadow: `0 0 24px ${color}55`,
              opacity: p,
              transform: `scale(${p}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
            }}
          >
            <Sfx name="pop" at={at} />
            #{chip.label}
          </div>
        );
      })}
    </div>
  );
};
