import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SFX_VOLUME } from "../theme";

export type SfxName = "whoosh" | "impact" | "pop" | "ding" | "alert" | "type";

interface SfxProps {
  name: SfxName;
  /** Frame offset relative to the enclosing Sequence. */
  at?: number;
  volume?: number;
}

export const Sfx: React.FC<SfxProps> = ({ name, at = 0, volume = SFX_VOLUME }) => (
  <Sequence from={at} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
