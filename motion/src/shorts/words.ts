import { Word } from "../types";

const isWord = (w: unknown): w is Word =>
  Array.isArray(w) && w.length === 3 && typeof w[0] === "number" && typeof w[1] === "number" && typeof w[2] === "string";

/** Validate word timings produced by scripts/prep-shorts.mjs. */
export const toWords = (json: unknown, name: string): readonly Word[] => {
  if (!Array.isArray(json) || !json.every(isWord)) {
    throw new Error(`Invalid word timings in ${name}. Re-run scripts/prep-shorts.mjs.`);
  }
  return json;
};
