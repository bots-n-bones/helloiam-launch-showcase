"""Generate the 25-second stereo soundtracks from the cues in DESIGN.md."""

import argparse
from array import array
from math import exp, pi, sin, sqrt, tanh
from random import Random
import sys
import wave

RATE = 48_000
DURATION = 25
TAU = 2 * pi


class Mix:
    def __init__(self):
        self.left = array("f", [0]) * (RATE * DURATION)
        self.right = array("f", [0]) * (RATE * DURATION)
        self.random = Random(42)

    def add(self, start, length, signal, gain, pan=0):
        offset = round(start * RATE)
        frames = min(round(length * RATE), len(self.left) - offset)
        left_gain = gain * sqrt((1 - pan) / 2)
        right_gain = gain * sqrt((1 + pan) / 2)
        for index in range(frames):
            time = index / RATE
            edge = min(1, time / .004, (frames - index) / (RATE * .018))
            sample = edge * signal(time)
            self.left[offset + index] += left_gain * sample
            self.right[offset + index] += right_gain * sample

    def noise(self, highpass):
        previous = 0.0

        def signal(_):
            nonlocal previous
            raw = self.random.uniform(-1, 1)
            previous += (raw - previous) * .075
            return raw - previous if highpass else 3.4 * previous

        return signal

    def grain(self, start, length, gain, decay, pan=0, highpass=True):
        noise = self.noise(highpass)
        self.add(start, length, lambda t: noise(t) * exp(-decay * t), gain, pan)

    def hit(self, start, gain, frequency=45):
        self.add(
            start, .85,
            lambda t: exp(-6 * t) * (
                sin(TAU * (frequency * t + 2 * (1 - exp(-9 * t))))
                + .2 * sin(TAU * 2.4 * frequency * t)
            ),
            gain,
        )

    def drone(self, start, length, gain):
        self.add(
            start, length,
            lambda t: min(1, t / .65, (length - t) / .1) * (
                .6 * sin(TAU * 53 * t)
                + .3 * sin(TAU * 54.7 * t)
                + .18 * sin(TAU * 106 * t + .32 * sin(TAU * .5 * t))
            ),
            gain,
        )

    def breath(self, start, length, gain):
        noise = self.noise(False)
        self.add(start, length, lambda t: sin(pi * t / length) * noise(t), gain)

    def laugh(self, start, frequency, gain, pan=0):
        noise = self.noise(False)

        def voice(t):
            phase = TAU * frequency * (t - .45 * t * t) + .17 * sin(TAU * 19 * t)
            vowel = (
                .44 * sin(phase) + .35 * sin(2 * phase) + .2 * sin(3 * phase)
                + .16 * sin(5 * phase) + .11 * sin(6 * phase)
            )
            return min(1, t / .025) * exp(-11 * t) * (vowel + .52 * noise(t))

        self.add(start, .18, voice, gain, pan)

    def crunch(self, start, gain):
        for delay, decay, pan in [(0, 41, -.22), (.036, 24, .08), (.093, 34, .2), (.17, 20, -.13)]:
            self.grain(start + delay, .19, gain, decay, pan)
        self.hit(start + .012, gain * .54, 91)

    def glass(self, start, gain, pan):
        self.add(
            start, .69,
            lambda t: exp(-8.5 * t) * (
                .55 * sin(TAU * 1567 * t) + .28 * sin(TAU * 2189 * t) + .17 * sin(TAU * 3107 * t)
            ),
            gain, pan,
        )
        self.grain(start, .055, gain * .24, 55, pan)

    def mallet(self, start, note, gain, pan=0):
        frequency = 440 * 2 ** ((note - 69) / 12)
        self.add(
            start, .36,
            lambda t: exp(-9.8 * t) * (
                sin(TAU * frequency * t) + .25 * exp(-9 * t) * sin(TAU * 2.01 * frequency * t)
            ),
            gain, pan,
        )

    def music(self, start, end, gain):
        melody = (72, 76, 79, 76, 74, 77, 81, 77, 76, 79, 84, 79, 74, 77, 79, 71)
        bass = (48, 50, 45, 43)
        beats = int((end - start) / .4)
        for beat in range(beats):
            time = start + beat * .4
            self.mallet(time, melody[beat % len(melody)], gain, -.2 if beat % 2 else .2)
            if beat % 2 == 0:
                self.mallet(time, bass[(beat // 4) % len(bass)], gain * .76)
                self.grain(time + .004, .09, gain * .3, 44)

    def write(self, filename, gain=1):
        samples = array("h")
        for left, right in zip(self.left, self.right):
            samples.append(round(tanh(left * 1.75) * 30_500 * gain))
            samples.append(round(tanh(right * 1.75) * 30_500 * gain))
        if sys.byteorder != "little":
            samples.byteswap()
        with wave.open(filename, "wb") as output:
            output.setparams((2, 2, RATE, 0, "NONE", "not compressed"))
            output.writeframes(samples.tobytes())


def horror(mix):
    mix.hit(.33, .57)
    mix.drone(4, 3.03, .22)
    mix.breath(7.12, .55, .51)
    for start, pitch, pan in [(7.94, 143, -.25), (8.24, 159, .16), (8.53, 151, -.1)]:
        mix.laugh(start, pitch, .47, pan)
    mix.grain(9.28, .36, .26, 4.2)
    mix.crunch(11.82, .60)
    mix.glass(15.43, .24, .25)
    mix.hit(16, .49, 49)
    mix.drone(16, 2.96, .11)
    mix.grain(19.25, .58, .17, 2.5, -.2, highpass=False)
    mix.hit(19.73, .58, 42)
    mix.drone(19.73, 5.24, .17)
    mix.mallet(21, 42, .18)


def comedy(mix):
    mix.hit(.24, .28, 132)
    mix.grain(.55, .085, .58, 56)
    mix.mallet(.55, 79, .16)
    mix.music(4, 9.2, .20)
    for start, pitch, pan in [
        (7.15, 183, -.17), (7.93, 209, .2), (8.17, 227, -.25),
        (8.4, 246, .22), (8.66, 262, -.2), (8.87, 283, .15),
    ]:
        mix.laugh(start, pitch, .5, pan)
    mix.grain(9.28, .33, .30, 5.4)
    mix.crunch(11.12, .73)
    mix.music(11.32, 19, .28)
    mix.glass(15.32, .42, .33)
    mix.glass(15.47, .24, -.3)
    for start, note, pan in [(19.24, 84, -.5), (19.36, 88, .38), (19.49, 91, -.22)]:
        mix.mallet(start, note, .32, pan)
    mix.hit(19.72, .31, 114)
    mix.music(19.72, 24.6, .28)
    for note, pan in [(60, -.2), (67, .2), (72, .1)]:
        mix.mallet(24.55, note, .19, pan)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("genre", choices=("horror", "comedy"))
    parser.add_argument("output")
    args = parser.parse_args()
    mix = Mix()
    (horror if args.genre == "horror" else comedy)(mix)
    mix.write(args.output, gain=.83 if args.genre == "comedy" else 1)
