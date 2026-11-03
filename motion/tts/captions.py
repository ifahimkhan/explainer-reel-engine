"""Caption markup parsing and word timing shared by the voiceover and recording pipelines.

Markup: `*word*` highlights, `word#tag` marks a cue the scenes animate on,
`|` splits a sentence into caption chunks.
"""
import re

import numpy as np

COMMA_WEIGHT = 1.2

# (start s, end s) for one caption word
Span = tuple


def norm(text: str) -> str:
    return re.sub(r"[^\w]", "", text.lower())


def plain_caption(caption: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"#\w+|[*|]", "", caption)).strip()


def syllables(word: str) -> float:
    bare = norm(word)
    if bare.isdigit() or re.fullmatch(r"\d+k", bare):
        return 2.0
    return float(max(1, len(re.findall(r"[aeiouy]+", bare))))


def parse_word(raw: str) -> dict:
    tag = re.search(r"#(\w+)", raw)
    clean = re.sub(r"#\w+", "", raw)
    hl = clean.startswith("*")
    clean = clean.replace("*", "")
    match = re.fullmatch(r"(.*?)([,.:;!?]*)", clean)
    word = {"text": match.group(1), "tail": match.group(2), "hl": hl}
    return {**word, "cue": tag.group(1)} if tag else word


def parse_caption(caption: str) -> list:
    """Caption -> list of chunks, each a list of word dicts."""
    return [[parse_word(w) for w in part.split()] for part in caption.split("|") if part.strip()]


def weight(word: dict) -> float:
    return syllables(word["text"]) + (COMMA_WEIGHT if word["tail"] else 0)


def estimate(words: list, start: float, duration: float) -> list:
    """Spread words over [start, start + duration] by syllable weight."""
    weights = [weight(w) for w in words]
    unit = duration / sum(weights)
    starts = start + np.cumsum([0.0] + weights[:-1]) * unit
    return [(float(s), float(s + wt * unit)) for s, wt in zip(starts, weights)]


def timed_chunks(chunks: list, spans: list) -> list:
    """Attach absolute (start, end) spans (flat, in reading order) to parsed chunks."""
    timed, k = [], 0
    for chunk in chunks:
        words = []
        for word in chunk:
            s, e = spans[k]
            words.append({**word, "start": round(s, 3), "end": round(e, 3)})
            k += 1
        timed.append({"start": words[0]["start"], "end": words[-1]["end"], "words": words})
    return timed
