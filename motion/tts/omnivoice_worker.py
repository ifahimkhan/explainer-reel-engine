"""OmniVoice TTS worker. Runs inside motion/.venv-omnivoice (torch/transformers kept apart
from the main venv). Spawned by omnivoice_tts.py; do not run by hand.

Protocol (one JSON object per line):
  stdout  {"ready": true, "sr": 24000}                 once, after the model is loaded
  stdin   {"text", "out", "ref_audio", "ref_text", "speed", "num_step", "guidance_scale", "seed"}
  stdout  {"ok": true, "seconds": 3.2}  or  {"ok": false, "error": "..."}
Logs and progress go to stderr so stdout stays a clean protocol channel.
"""
import json
import sys
import time

MODEL_ID = "k2-fsa/OmniVoice"
OUT_RATE = 24000  # build_voiceover.py SAMPLE_RATE


def log(msg: str) -> None:
    print(f"[omnivoice] {msg}", file=sys.stderr, flush=True)


def reply(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


def load_model():
    import os

    import torch
    from omnivoice import OmniVoice

    torch.set_num_threads(os.cpu_count() or 4)  # torch defaults to physical cores; all threads measured ~10% faster
    t0 = time.time()
    model = OmniVoice.from_pretrained(MODEL_ID, device_map="cpu", dtype=torch.float32)
    log(f"model loaded in {time.time() - t0:.0f}s")
    return model


_PROMPTS: dict = {}  # (ref_audio, ref_text) -> encoded voice-clone prompt, reused per build


def clone_prompt(model, ref_audio: str, ref_text: str):
    key = (ref_audio, ref_text)
    if key not in _PROMPTS:
        _PROMPTS[key] = model.create_voice_clone_prompt(ref_audio=ref_audio, ref_text=ref_text)
        log(f"encoded reference {ref_audio}")
    return _PROMPTS[key]


def synthesize(model, req: dict) -> float:
    import soundfile as sf
    import torch
    import torchaudio.functional as AF

    for key in ("text", "out", "ref_audio", "ref_text"):
        if not str(req.get(key, "")).strip():
            raise ValueError(f"missing {key}")
    if req.get("seed") is not None:
        torch.manual_seed(int(req["seed"]))
    t0 = time.time()
    audio = model.generate(
        text=req["text"], language=req.get("language", "en"),
        voice_clone_prompt=clone_prompt(model, req["ref_audio"], req["ref_text"]),
        speed=float(req.get("speed", 1.0)),
        num_step=int(req.get("num_step", 16)), guidance_scale=float(req.get("guidance_scale", 2.0)),
    )[0]
    wav = torch.as_tensor(audio, dtype=torch.float32).reshape(1, -1)
    if model.sampling_rate != OUT_RATE:
        wav = AF.resample(wav, model.sampling_rate, OUT_RATE)
    wav = wav.squeeze(0)
    sf.write(req["out"], wav.numpy(), OUT_RATE, subtype="FLOAT")
    seconds = wav.numel() / OUT_RATE
    log(f"{seconds:.1f}s audio in {time.time() - t0:.0f}s: {req['text'][:60]}")
    return seconds


def main() -> None:
    model = load_model()
    reply({"ready": True, "sr": OUT_RATE})
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            reply({"ok": True, "seconds": synthesize(model, json.loads(line))})
        except Exception as exc:  # noqa: BLE001 - report per request; keep the worker alive
            log(f"error: {exc!r}")
            reply({"ok": False, "error": f"{type(exc).__name__}: {exc}"})


if __name__ == "__main__":
    main()
