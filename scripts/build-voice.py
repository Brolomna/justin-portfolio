#!/usr/bin/env python3
"""Record Terminal Academy's narration with Kokoro TTS (Apache-2.0).

Usage (from the repository root):
    node scripts/voice-lines.mjs > /tmp/voice-lines.json
    python3 scripts/build-voice.py /tmp/voice-lines.json --model kokoro/model.onnx --voice kokoro/af_heart.bin

Needs: pip install kokoro-onnx soundfile, and ffmpeg. The model and voice come from
https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX (onnx/model.onnx, voices/af_heart.bin).

Writes public/interactive-learning/audio/<key>.mp3 (mono, loudness-normalised) and
audio/manifest.json. Lines whose text and voice haven't changed are skipped; pass
--all to re-record everything (e.g. after switching voice).
"""
import argparse, hashlib, json, os, subprocess, sys, tempfile

OUT = os.path.join('public', 'interactive-learning', 'audio')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('lines', help='JSON from scripts/voice-lines.mjs')
    ap.add_argument('--model', required=True)
    ap.add_argument('--voice', required=True, help='a Kokoro voice .bin file, e.g. af_heart.bin')
    ap.add_argument('--speed', type=float, default=1.0)
    ap.add_argument('--all', action='store_true')
    args = ap.parse_args()

    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro

    lines = json.load(open(args.lines))
    voice_name = os.path.splitext(os.path.basename(args.voice))[0]
    os.makedirs(OUT, exist_ok=True)
    manifest_path = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

    with tempfile.TemporaryDirectory() as tmp:
        voices = os.path.join(tmp, 'voices.npz')
        np.savez(voices, **{voice_name: np.fromfile(args.voice, dtype=np.float32).reshape(-1, 1, 256)})
        kokoro = Kokoro(args.model, voices)
        lang = 'en-gb' if voice_name.startswith('b') else 'en-us'
        made = 0
        for key, text in lines.items():
            digest = hashlib.sha256(f'{voice_name}|{args.speed}|{text}'.encode()).hexdigest()[:16]
            mp3 = os.path.join(OUT, f'{key}.mp3')
            if not args.all and manifest.get(key, {}).get('hash') == digest and os.path.exists(mp3):
                continue
            samples, rate = kokoro.create(text, voice=voice_name, speed=args.speed, lang=lang)
            wav = os.path.join(tmp, f'{key}.wav')
            sf.write(wav, samples, rate)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav,
                            '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-18:TP=-2:LRA=7',
                            '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', mp3], check=True)
            manifest[key] = {'hash': digest, 'seconds': round(len(samples) / rate, 1), 'text': text}
            made += 1
            print(f'{key:28} {manifest[key]["seconds"]:5.1f}s  {text[:60]}')
        for key in list(manifest):
            if key not in lines:
                del manifest[key]
                if os.path.exists(os.path.join(OUT, f'{key}.mp3')):
                    os.remove(os.path.join(OUT, f'{key}.mp3'))
        manifest = dict(sorted(manifest.items()))
        json.dump(manifest, open(manifest_path, 'w'), indent=1)
    print(f'{made} clip(s) recorded with {voice_name}; {len(lines)} total.', file=sys.stderr)


if __name__ == '__main__':
    main()
