const assert = require("node:assert/strict");
const { spawn, execFileSync } = require("node:child_process");
const { once } = require("node:events");
const { copyFileSync, mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.KHASH_PLAYWRIGHT || "playwright");

const fps = 30;
const frames = 25 * fps;
const samples = [
  [2.6, "calendar"], [5.5, "fog"], [7.4, "laughter"], [8.6, "laughter"],
  [10, "laughter"], [12.6, "lavash"], [16.8, "toast"], [22, "ending"],
];
const args = process.argv.slice(2);
const samplesDir = args[0] === "--samples" ? path.resolve(args[1]) : null;
const genres = !samplesDir && args.length ? args : ["horror", "comedy"];
for (const genre of genres) assert.ok(["horror", "comedy"].includes(genre), "use horror or comedy");

async function render(browser, genre, scratch) {
  const width = samplesDir ? 375 : 1080;
  const page = await browser.newPage({
    viewport: { width, height: Math.ceil(width * 1.25) },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  let encoder;
  try {
    const url = pathToFileURL(path.join(__dirname, "scene.html"));
    url.searchParams.set("genre", genre);
    await page.goto(url.href);
    await page.evaluate(async () => {
      await window.khashReady;
      await document.fonts.load('700 24px "Instrument Sans"');
    });
    assert.ok(await page.evaluate(() => [...document.fonts].some(
      font => font.family === "Instrument Sans" && font.status === "loaded"
    )), "brand typeface loaded");
    const seek = seconds => page.evaluate(time => window.showKhashFrame(time), seconds);
    if (samplesDir) {
      for (const [index, [time, shot]] of samples.entries()) {
        assert.equal(await seek(time), shot);
        const metrics = await page.locator(".shot.is-active").evaluate(active => {
          const frame = active.getBoundingClientRect();
          return [...active.querySelectorAll("p, h1")].flatMap(element => {
            if (!element.getClientRects().length || getComputedStyle(element).opacity === "0") return [];
            const range = document.createRange();
            range.selectNodeContents(element);
            return [...range.getClientRects()]
              .filter(text => text.width && (text.left < frame.left - 1 || text.right > frame.right + 1))
              .map(text => ({ text: element.textContent, width: text.width }));
          });
        });
        assert.deepEqual(metrics, [], genre + " title fit at " + time);
        await page.locator(".film").screenshot({ path: path.join(samplesDir, genre + "-" + index + ".png") });
      }
    } else {
      const audio = path.join(scratch, genre + ".wav");
      execFileSync("python3", [path.join(__dirname, "sound.py"), genre, audio]);
      assert.equal(await seek(22), "ending");
      await page.screenshot({ path: path.join(__dirname, genre + "-cover.png") });

      const output = path.join(scratch, "khash-" + genre + ".mp4");
      encoder = spawn("ffmpeg", [
        "-v", "error", "-nostdin", "-y",
        "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "pipe:0",
        "-i", audio, "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", output,
      ], { stdio: ["pipe", "inherit", "inherit"] });
      const finished = once(encoder, "exit");
      const cdp = await page.context().newCDPSession(page);
      for (let frame = 0; frame < frames; frame++) {
        const shot = await seek(frame / fps);
        if (frame % 120 === 0) console.log(genre + ": " + frame + "/" + frames + " (" + shot + ")");
        const { data } = await cdp.send("Page.captureScreenshot", {
          format: "jpeg", quality: 96, fromSurface: true,
        });
        if (!encoder.stdin.write(Buffer.from(data, "base64"))) await once(encoder.stdin, "drain");
      }
      encoder.stdin.end();
      const [code] = await finished;
      assert.equal(code, 0);
      copyFileSync(output, path.join(__dirname, path.basename(output)));
      console.log(genre + ": " + frames + " frames exported");
    }
    assert.deepEqual(errors, []);
  } finally {
    if (encoder && encoder.exitCode === null) encoder.kill();
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.KHASH_CHROMIUM });
  const scratch = mkdtempSync(path.join(tmpdir(), "khash-render-"));
  try {
    for (const genre of genres) await render(browser, genre, scratch);
  } finally {
    await browser.close();
    rmSync(scratch, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
