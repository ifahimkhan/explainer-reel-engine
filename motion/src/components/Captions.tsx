import React from "react";
import { useCurrentFrame } from "remotion";
import { pop } from "../anim";
import { COLORS, FONTS, FPS, sec } from "../theme";
import { Word } from "../types";

const MAX_WORDS = 4;
const MAX_GAP_S = 0.6;
const HOLD_S = 0.4;

type Chunk = { start: number; end: number; words: readonly Word[] };

/** Group words into short lines, breaking on pauses and sentence ends. */
export const chunkWords = (words: readonly Word[]): Chunk[] =>
  words.reduce<Chunk[]>((chunks, word) => {
    const last = chunks[chunks.length - 1];
    const startsNew =
      !last ||
      last.words.length >= MAX_WORDS ||
      word[0] - last.end > MAX_GAP_S ||
      /[.?!,]$/.test(last.words[last.words.length - 1][2]);
    if (startsNew) return [...chunks, { start: word[0], end: word[1], words: [word] }];
    return [...chunks.slice(0, -1), { ...last, end: word[1], words: [...last.words, word] }];
  }, []);

interface CaptionsProps {
  words: readonly Word[];
  top: number;
  height: number;
}

export const Captions: React.FC<CaptionsProps> = ({ words, top, height }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunks = React.useMemo(() => chunkWords(words), [words]);
  const chunk = chunks.find((c, i) => t >= c.start && t < Math.min(c.end + HOLD_S, chunks[i + 1]?.start ?? Infinity));
  if (!chunk) return null;
  const enter = pop(frame, sec(chunk.start), 12);

  return (
    <div
      style={{
        position: "absolute",
        left: 30,
        right: 30,
        top,
        height,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        columnGap: 18,
        fontFamily: FONTS.display,
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.1,
        textTransform: "uppercase",
        transform: `scale(${0.85 + 0.15 * enter})`,
      }}
    >
      {chunk.words.map(([s, , text], i) => {
        const active = t >= s;
        return (
          <span
            key={`${s}-${i}`}
            style={{
              color: active ? COLORS.green : COLORS.white,
              textShadow: "0 4px 0 #000, 0 0 18px rgba(0,0,0,0.9)",
              WebkitTextStroke: "2px #000",
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};
