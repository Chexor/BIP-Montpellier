#!/usr/bin/env python3
"""Generate a short Dosi TTS sample with Pocket TTS."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import scipy.io.wavfile
from pocket_tts import TTSModel


DEFAULT_TEXT = (
    "Hi, I'm Dosi! I'll guide you step by step when it is time for your medication."
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--text", default=DEFAULT_TEXT)
    parser.add_argument("--voice", default="mary")
    parser.add_argument(
        "--temperature",
        type=float,
        help="Sampling temperature. Higher values can sound more expressive.",
    )
    parser.add_argument(
        "--voices",
        nargs="+",
        help="Generate one file per voice. Overrides --voice when provided.",
    )
    parser.add_argument(
        "--output",
        default="assets/generated/tts/dosi_intro.wav",
        help="Path for the generated wav file, or an output directory with --voices.",
    )
    return parser.parse_args()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def main() -> None:
    args = parse_args()
    output_path = Path(args.output)
    voices = args.voices or [args.voice]

    temperature = args.temperature if args.temperature is not None else 0.45
    tts_model = TTSModel.load_model(language="english", temp=temperature)
    for voice in voices:
        if args.voices:
            if output_path.suffix:
                target_path = output_path.with_name(
                    f"{output_path.stem}_{slugify(voice)}{output_path.suffix}"
                )
            else:
                target_path = output_path / f"dosi_intro_{slugify(voice)}.wav"
        else:
            target_path = output_path

        target_path.parent.mkdir(parents=True, exist_ok=True)
        voice_state = tts_model.get_state_for_audio_prompt(voice)
        audio = tts_model.generate_audio(voice_state, args.text)
        scipy.io.wavfile.write(target_path, tts_model.sample_rate, audio.numpy())
        print(f"Wrote {target_path}")


if __name__ == "__main__":
    main()
