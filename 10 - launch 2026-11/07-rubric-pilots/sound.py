"""Original synthesized textures for the editorial pilots."""
from array import array
from math import exp, pi, sin
from random import Random
import sys
import wave

kind, duration, destination = sys.argv[1:]
duration = float(duration)
rate = 48000
samples = array("h")
rng = Random(721)
smooth = 0.0
beats = {
    "market-mountain": (0.07, 0.68, 1.12, 1.72, 2.18, 2.48, 2.9, 3.24, 3.55, 4.0),
    "love-lavash": (0.03, 2.30, 2.90, 3.50, 5.60),
    "say-hello-wine": (0.06, 2.50, 5.20),
    "apricot-season": (0.03, 3.0, 5.0, 7.0),
    "lavash-teaser": (0.04, 2.0, 2.25, 2.5, 4.0),
    "pomegranate-trailer": (0.06, 3.0, 3.36, 4.28, 6.0, 9.22, 11.0, 14.6),
    "four-dots": (0.05, 1.5, 3.0, 4.5),
}
onsets = beats[kind]
for i in range(round(duration * rate)):
    t = i / rate
    noise = rng.uniform(-1, 1)
    smooth += 0.025 * (noise - smooth)
    attack = min(1.0, t * 20, (duration - t) * 6)
    active = kind == "market-mountain" and t < 5.0
    level = 0.15 if active else 0.04
    base = level * smooth
    if kind == "market-mountain":
        base += (0.032 if active else 0.011) * sin(2 * pi * (91 if active else 53) * t)
    if kind == "pomegranate-trailer":
        base += 0.042 * sin(2 * pi * 61 * t) * (0.6 + 0.4 * sin(2.1 * t))
    if kind == "love-lavash" and 3.5 < t < 4.9:
        base += noise * 0.10 * exp(-2.7 * (t - 3.5)) * (0.7 + 0.3 * sin(75 * t))
    hits = 0
    for onset in onsets:
        delta = t - onset
        if 0 <= delta < 0.25:
            hits += (0.15 * sin(2 * pi * 96 * delta) + 0.055 * noise) * exp(-24 * delta)
    samples.append(round(32767 * attack * (base + hits)))
with wave.open(destination, "wb") as track:
    track.setparams((1, 2, rate, 0, "NONE", "not compressed"))
    track.writeframes(samples.tobytes())
