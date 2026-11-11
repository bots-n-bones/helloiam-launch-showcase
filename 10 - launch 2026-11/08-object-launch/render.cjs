const assert = require("node:assert/strict");
const { once } = require("node:events");
const { mkdir, mkdtemp, rm, writeFile } = require("node:fs/promises");
const { spawn, execFile } = require("node:child_process");
const { promisify } = require("node:util");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require(process.env.PILOT_PLAYWRIGHT || "playwright");
const series = require("./series.js");
const launchRoot = path.dirname(__dirname);
const origin = "http://object-launch.test";

const run = promisify(execFile);
const fps = 30;
const frames = 15 * fps;
const samples = [
  [0.6, "macro"], [2.5, "reveal"], [4.45, "phrase"],
  [6.85, "pattern"], [8.55, "detail"], [13.5, "hero"],
];

async function render(browser, id, scratch, sampleOnly) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1060 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  let encoder;
  try {
    await page.route(origin + "/**", route => {
      const asset = decodeURIComponent(new URL(route.request().url()).pathname);
      const file = path.resolve(launchRoot, "." + asset);
      if (!file.startsWith(launchRoot + path.sep)) return route.abort();
      return route.fulfill({ path: file });
    });
    const url = new URL("/" + path.basename(__dirname) + "/scene.html", origin);
    url.searchParams.set("film", id);
    await page.goto(url.href);
    await page.evaluate(() => window.objectReady);
    assert.ok(await page.evaluate(() => [...document.fonts].some(
      font => font.family === "Instrument Sans" && font.status === "loaded")));
    const canvas = page.locator("#film");
    if (sampleOnly) {
      const directory = path.join(__dirname, "qa");
      await mkdir(directory, { recursive: true });
      for (const [time, phase] of samples) {
        assert.equal(await page.evaluate(time => window.paintObjectFrame(time), time), phase);
        await canvas.screenshot({ path: path.join(directory, id + "-" + phase + ".png") });
      }
      assert.deepEqual(errors, []);
      return;
    }

    const directory = path.join(__dirname, "exports", id);
    await mkdir(directory, { recursive: true });
    assert.equal(await page.evaluate(time => window.paintObjectFrame(time), 2.5), "reveal");
    const cover = await page.evaluate(() => document.querySelector("#film").toDataURL("image/png").split(",")[1]);
    await writeFile(path.join(directory, "cover.png"), Buffer.from(cover, "base64"));
    const sound = path.join(scratch, id + ".wav");
    await run("python3", [path.join(__dirname, "sound.py"), id, sound]);
    const output = path.join(directory, id + ".mp4");
    encoder = spawn("ffmpeg", [
      "-v", "error", "-nostdin", "-y", "-f", "image2pipe", "-framerate", String(fps),
      "-c:v", "mjpeg", "-i", "pipe:0", "-i", sound,
      "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-preset", "veryfast",
      "-threads", "2", "-crf", "16", "-pix_fmt", "yuv420p",
      "-af", "volume=5dB", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", output,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = once(encoder, "exit");
    for (let frame = 0; frame < frames; frame++) {
      const jpeg = await page.evaluate(t => window.objectJPEG(t), frame / fps);
      if (!encoder.stdin.write(Buffer.from(jpeg, "base64"))) await once(encoder.stdin, "drain");
    }
    encoder.stdin.end();
    assert.deepEqual(await done, [0, null]);
    assert.deepEqual(errors, []);
    console.log(id + " · " + frames + " frames");
  } finally {
    if (encoder && encoder.exitCode === null) encoder.kill();
    await page.close();
  }
}

(async () => {
  const args = process.argv.slice(2);
  const sampleOnly = args.includes("--samples");
  const chosen = args.filter(arg => arg !== "--samples");
  const ids = chosen.length ? chosen : Object.keys(series);
  assert.ok(ids.every(id => Object.hasOwn(series, id)), "Use jug, backpack or fountains");
  const browser = await chromium.launch({ executablePath: process.env.PILOT_CHROMIUM });
  const scratch = await mkdtemp(path.join(os.tmpdir(), "helloiam-launch-render-"));
  try {
    const results = await Promise.allSettled(ids.map(id => render(browser, id, scratch, sampleOnly)));
    for (const result of results) if (result.status === "rejected") throw result.reason;
  } finally {
    await browser.close();
    await rm(scratch, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
