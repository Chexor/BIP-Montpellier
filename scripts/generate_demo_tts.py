#!/usr/bin/env python3
"""Generate Mary Pocket TTS clips for Paul’s live demo dashboard."""

from __future__ import annotations

from pathlib import Path

import scipy.io.wavfile
from pocket_tts import TTSModel


LINES = {
    "dispense_0": "Hi John. It is time for your evening medication. Your dose is ready.",
    "dispense_1": "John, I can still see one tablet in the cup. Please take the last tablet.",
    "dispense_2": "Thank you John. The cup is empty and your dose is complete.",
    "missed_0": "Hi John. Your evening medication is ready when you are.",
    "missed_1": "John, this is a gentle reminder. Your evening medication is still ready.",
    "missed_3": "Thank you John. I have marked this dose as taken.",
}


def main() -> None:
    output_dir = Path("public/assets/audio/demo")
    output_dir.mkdir(parents=True, exist_ok=True)

    tts_model = TTSModel.load_model(language="english", temp=0.45)
    voice_state = tts_model.get_state_for_audio_prompt("mary")

    for name, text in LINES.items():
        output_path = output_dir / f"{name}.wav"
        audio = tts_model.generate_audio(voice_state, text)
        scipy.io.wavfile.write(output_path, tts_model.sample_rate, audio.numpy())
        print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
