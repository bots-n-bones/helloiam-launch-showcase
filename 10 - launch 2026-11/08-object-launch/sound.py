"""Original sound textures for the Object Launch films."""

from array import array
from math import exp, pi, sin, tanh
from random import Random
import sys
import wave

film, destination = sys.argv[1:]
rate = 48000
duration = 15
rng = Random({"jug": 42, "backpack": 43, "fountains": 46}[film])
frequencies = {"jug": (68, 152, 414), "backpack": (54, 182, 830), "fountains": (62, 238, 684)}
low, mid, high = frequencies[film]
hits = [(0.06, .6), (1.2, 1.0), (3.5, .86), (3.67, .55), (5.2, .75),
        (5.51, .65), (5.83, .59), (6.14, .44), (6.45, .52), (7.4, .77),
        (9.5, 1.0), (12.0, .25)]
sweeps = (0.88, 3.19, 5.0, 7.15, 9.15)
samples = array("h")
filtered = 0.0
wash = 0.0
for sample in range(rate * duration):
    t = sample / rate
    grain = rng.uniform(-1, 1)
    filtered += .034 * (grain - filtered)
    wash += .26 * (grain - wash)
    fade = min(1.0, t * 12, (duration - t) * 2.0)
    pressure = .24 + .76 * sin(pi * min(t / 12, 1)) ** 2
    bass = .046 * pressure * (sin(2 * pi * low * t) + .34 * sin(2 * pi * 2 * low * t))
    surface = .032 * filtered
    if film == "fountains":
        surface += wash * (.025 + .027 * sin(2 * pi * .7 * t) ** 2)
    if film == "backpack":
        surface += wash * .04 * max(0.0, sin(2 * pi * 1.1 * t)) ** 3
    if film == "jug":
        surface += .018 * filtered * sin(2 * pi * .59 * t)
    tick = 0.0
    for onset, amount in hits:
        dt = t - onset
        if 0 <= dt < .49:
            knock = .16 * sin(2 * pi * (low * 1.37 - 14 * dt) * dt) * exp(-18 * dt)
            resonator = .071 * sin(2 * pi * (mid + 45 * exp(-30 * dt)) * dt) * exp(-34 * dt)
            attack = (.038 * grain + .033 * sin(2 * pi * high * dt)) * exp(-91 * dt)
            tick += amount * (knock + resonator + attack)
    swipe = 0.0
    for onset in sweeps:
        dt = (t - onset) / .33
        if 0 <= dt <= 1:
            swipe += .076 * wash * sin(pi * dt) ** 1.2
    mono = bass + tick
    side = surface + swipe
    samples.append(round(32767 * fade * tanh((mono + side) * 1.42)))
    samples.append(round(32767 * fade * tanh((mono - .58 * side + .27 * filtered * .04) * 1.42)))
with wave.open(destination, "wb") as output:
    output.setparams((2, 2, rate, 0, "NONE", "not compressed"))
    output.writeframes(samples.tobytes())
