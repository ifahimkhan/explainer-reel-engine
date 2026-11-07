"""Unit tests for the OmniVoice engine glue (no model, no worker process).

Run: .venv/Scripts/python -m pytest tts/test_omnivoice_tts.py -q
"""
import sys
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_voiceover as bv  # noqa: E402
import omnivoice_tts as ov  # noqa: E402


@pytest.fixture
def ref(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setattr(ov, "MOTION", tmp_path)
    clip = tmp_path / "voices" / "ref.wav"
    clip.parent.mkdir()
    sf.write(clip, np.zeros(2400, dtype="float32"), 24000)
    clip.with_suffix(".txt").write_text("  Hello   there.\n", encoding="utf-8")
    return clip


def test_reference_defaults_to_sibling_transcript(ref: Path) -> None:
    path, text = ov.resolve_reference({"refAudio": "voices/ref.wav"})
    assert path == ref.resolve()
    assert text == "Hello there."


def test_job_ref_text_wins(ref: Path) -> None:
    _, text = ov.resolve_reference({"refAudio": "voices/ref.wav", "refText": "Other words"})
    assert text == "Other words"


@pytest.mark.parametrize("job, msg", [
    ({}, "refAudio"),
    ({"refAudio": "voices/missing.wav"}, "not found"),
    ({"refAudio": "voices/ref.wav", "omnivoice": {"steps": 8}}, "unknown omnivoice settings"),
])
def test_bad_jobs_fail_clearly(ref: Path, job: dict, msg: str) -> None:
    with pytest.raises(ov.OmniVoiceError, match=msg):
        ov.cache_tag(job)


def test_cache_tag_tracks_clip_text_and_settings(ref: Path) -> None:
    job = {"refAudio": "voices/ref.wav"}
    base = ov.cache_tag(job)
    assert base.startswith("omnivoice|")
    assert ov.cache_tag({**job, "refText": "Different"}) != base
    assert ov.cache_tag({**job, "omnivoice": {"seed": 3}}) != base
    sf.write(ref, np.ones(2400, dtype="float32") * 0.1, 24000)
    assert ov.cache_tag(job) != base


def test_engine_accepts_omnivoice_and_rejects_unknown(ref: Path) -> None:
    engine = bv.Engine({"engine": "omnivoice", "refAudio": "voices/ref.wav"})
    assert engine.cache_tag.startswith("omnivoice|")
    with pytest.raises(SystemExit):
        bv.Engine({"engine": "nope"})


def test_run_omnivoice_trims_and_has_no_tokens() -> None:
    class FakeWorker:
        def synthesize(self, text: str, speed: float) -> np.ndarray:
            return np.concatenate([np.zeros(4800), np.full(2400, 0.5), np.zeros(4800)]).astype("float32")

    audio, tokens = bv.run_omnivoice(FakeWorker(), "hi", 1.0)
    assert tokens is None
    assert len(audio) < 4800  # leading/trailing silence trimmed to EDGE_PAD_S
