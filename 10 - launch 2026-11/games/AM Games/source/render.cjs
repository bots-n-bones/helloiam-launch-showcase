'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { fps, games, totalFrames, countStart, fastFrames, firstPlayFrame, resetFrame, frameAt } = require('./timeline');

const series = path.resolve(__dirname, '..');
const launch = process.env.LAUNCH_DIR || path.resolve(series, '../..');
const design = path.join(launch, '02-claude-session 2026-11-10');
const sampleFrames = [
  [0, 24, 51, 60, 69, 78, 84, 111, 239],
  [0, 24, 85, 178, 239],
  [0, 24, 84, 102, 120, 138, 239],
  [0, 24, 84, 120, 239],
  [0, 24, 84, 111, 120, 129, 192, 239],
];

function drumTrack() {
  const rate = 48000;
  const frames = 8 * rate;
  const file = Buffer.alloc(44 + frames * 2);
  file.write('RIFF', 0);
  file.writeUInt32LE(file.length - 8, 4);
  file.write('WAVEfmt ', 8);
  file.writeUInt32LE(16, 16);
  file.writeUInt16LE(1, 20);
  file.writeUInt16LE(1, 22);
  file.writeUInt32LE(rate, 24);
  file.writeUInt32LE(rate * 2, 28);
  file.writeUInt16LE(2, 32);
  file.writeUInt16LE(16, 34);
  file.write('data', 36);
  file.writeUInt32LE(frames * 2, 40);

  let seed = 20261110;
  const hits = [0, 1, 2].map(step => ({ frame: countStart + step * fastFrames, bass: false }));
  for (let frame = firstPlayFrame, beat = 0; frame < resetFrame; frame += fastFrames, beat++) {
    hits.push({ frame, bass: beat % 4 === 0 || beat % 4 === 3 });
  }
  for (const { frame, bass } of hits) {
    const start = Math.round(frame * rate / fps);
    for (let i = 0; i < (bass ? .24 : .105) * rate; i++) {
      const t = i / rate;
      const attack = Math.min(t / .003, 1);
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      const hit = bass
        ? .33 * Math.exp(-t * 23) * Math.sin(2 * Math.PI * (77 * t + .63 * (1 - Math.exp(-t * 40))))
          + .07 * noise * Math.exp(-t * 70)
        : (.18 * Math.sin(2 * Math.PI * 268 * t) + .12 * noise) * Math.exp(-t * 51);
      file.writeInt16LE(Math.round(32767 * attack * hit), 44 + (start + i) * 2);
    }
  }
  return file;
}

async function capture(page, game, frame, cover = false) {
  const result = await page.evaluate(({ game, frame, cover }) => {
    const state = window.reel.paint(game, frame);
    const source = document.querySelector('canvas');
    if (!cover) return { state, png: source.toDataURL('image/png') };
    const crop = document.createElement('canvas');
    crop.width = 1080;
    crop.height = 1350;
    crop.getContext('2d').drawImage(source, 0, 285, 1080, 1350, 0, 0, 1080, 1350);
    return { state, png: crop.toDataURL('image/png') };
  }, { game, frame, cover });
  assert.deepEqual(result.state, frameAt(games[game], frame));
  return Buffer.from(result.png.split(',')[1], 'base64');
}

async function render() {
  const sampleDir = process.env.SAMPLE_DIR;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    args: ['--allow-file-access-from-files'],
  });
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'am-games-frames-'));
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', error => console.error(error));
    await page.addInitScript(assetBase => { window.assetBase = assetBase; }, {
      emoji: pathToFileURL(path.join(design, 'emoji-cutout') + '/').href,
      fonts: pathToFileURL(path.join(design, 'design-system/fonts') + '/').href,
    });
    await page.goto(pathToFileURL(path.join(__dirname, 'scene.html')).href);
    await page.waitForFunction(() => Boolean(window.reel));
    await page.evaluate(() => window.reel.ready);

    for (const [index, game] of games.entries()) {
      if (sampleDir) {
        await fs.mkdir(sampleDir, { recursive: true });
        for (const frame of sampleFrames[index]) {
          await fs.writeFile(path.join(sampleDir, game.slug + '-' + frame + '.png'), await capture(page, index, frame));
        }
        console.log(game.slug + ' · sample frames');
        continue;
      }

      const frames = path.join(scratch, game.slug);
      await fs.mkdir(frames);
      const stateFiles = new Map();
      for (let frame = 0; frame < totalFrames; frame++) {
        const stateKey = JSON.stringify(frameAt(game, frame));
        const file = path.join(frames, String(frame).padStart(3, '0') + '.png');
        const original = stateFiles.get(stateKey);
        if (original) {
          await fs.link(original, file);
        } else {
          await fs.writeFile(file, await capture(page, index, frame));
          stateFiles.set(stateKey, file);
        }
      }

      const audio = game.icon === 'dancer' ? ['-i', path.join(scratch, 'percussion.wav'), '-c:a', 'aac', '-b:a', '160k'] : [];
      if (audio.length) await fs.writeFile(audio[1], drumTrack());
      execFileSync('ffmpeg', [
        '-v', 'error', '-nostdin', '-y', '-framerate', String(fps), '-i', path.join(frames, '%03d.png'),
        ...audio, '-frames:v', String(totalFrames), '-c:v', 'libx264', '-preset', 'fast', '-crf', '17',
        '-vf', 'scale=out_color_matrix=bt709,format=yuv420p', '-colorspace', 'bt709',
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart',
        path.join(series, game.slug + '.mp4'),
      ], { stdio: 'inherit' });

      await fs.writeFile(path.join(series, game.slug + '-cover.png'), await capture(page, index, 0, true));
      console.log(game.slug + ' · 240 frames and cover');
    }
  } finally {
    await browser.close();
    await fs.rm(scratch, { recursive: true, force: true });
  }
}

render().catch(error => { console.error(error); process.exitCode = 1; });
