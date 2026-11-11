const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { mkdir, mkdtemp, rm, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL, fileURLToPath } = require("node:url");
const { promisify } = require("node:util");
const { chromium } = require(process.env.PILOT_PLAYWRIGHT || "playwright");
const catalog = require("./catalog.js");

const run = promisify(execFile);
const fps = 30;
const flags = ["-v", "error", "-nostdin", "-y"];
const videoCodec = ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "18", "-pix_fmt", "yuv420p"];
const coverUrl = pathToFileURL(path.join(__dirname, "scene.html"));

async function capture(page, item, index, dest, options = {}) {
  const url = new URL(coverUrl);
  url.searchParams.set("id", item.id);
  url.searchParams.set("frame", index);
  if (options.reel) url.searchParams.set("reel", "1");
  const width = 1080;
  await page.setViewportSize({ width, height: options.reel ? 1920 : width * 1.25 });
  await page.goto(url.href);
  const problems = await page.evaluate(async () => {
    await document.fonts.load("700 24px Instrument");
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    const problems = [...document.images].filter(image => !image.naturalWidth).map(image => image.src);
    if (![...document.fonts].some(font => font.family === "Instrument" && font.status === "loaded")) {
      problems.push("Instrument Sans did not load");
    }
    for (const element of document.querySelectorAll(".copy h1,.copy p,.source")) {
      const range = document.createRange();
      range.selectNodeContents(element);
      if ([...range.getClientRects()].some(rect => rect.right > innerWidth + 1 || rect.bottom > innerHeight)) {
        problems.push("Text overflows: " + element.textContent);
      }
    }
    return problems;
  });
  assert.deepEqual(problems, [], item.id + " / " + index);
  await page.screenshot({ path: dest, animations: "disabled" });
}

async function renderVideo(page, item, dest, scratch) {
  await mkdir(scratch, { recursive: true });
  const segments = [];
  for (const [i, frame] of item.frames.entries()) {
    const clip = path.join(scratch, i + ".mp4");
    const visual = [];
    if (frame.video) {
      const source = fileURLToPath(new URL(frame.video, coverUrl));
      visual.push("-ss", String(frame.from || 0), "-i", source, "-vf",
        "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=2");
    } else {
      const still = path.join(scratch, i + ".png");
      await capture(page, item, i, still, { reel: true });
      visual.push("-loop", "1", "-framerate", String(fps), "-i", still);
    }
    const count = Math.round(frame.seconds * fps);
    await run("ffmpeg", [...flags, ...visual, "-frames:v", String(count), "-an", ...videoCodec, clip]);
    segments.push("file " + i + ".mp4");
  }
  const listing = path.join(scratch, "list.txt");
  const audio = path.join(scratch, "audio.wav");
  const duration = item.frames.reduce((sum, frame) => sum + frame.seconds, 0);
  await writeFile(listing, segments.join("\n") + "\n");
  await run("python3", [path.join(__dirname, "sound.py"), item.id, String(duration), audio]);
  await run("ffmpeg", [...flags, "-f", "concat", "-safe", "0", "-i", listing, "-i", audio,
    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
    "-t", String(duration), "-movflags", "+faststart", path.join(dest, item.id + ".mp4")]);
}

async function renderItem(browser, item, scratch) {
  const dest = path.join(__dirname, "exports", item.id);
  await mkdir(dest, { recursive: true });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  try {
    for (const [index] of item.frames.entries()) {
      await capture(page, item, index, path.join(dest, String(index + 1).padStart(2, "0") + ".png"));
    }
    if (item.kind === "reel") {
      await renderVideo(page, item, dest, path.join(scratch, item.id));
    }
    console.log(item.id + " · " + item.kind);
  } finally {
    await page.close();
  }
}

(async () => {
  const args = process.argv.slice(2);
  const selection = args.length ? catalog.filter(item => args.includes(item.id)) : catalog;
  assert.ok(selection.length && (!args.length || selection.length === args.length), "Provide valid pilot IDs");
  const browser = await chromium.launch({ executablePath: process.env.PILOT_CHROMIUM });
  const scratch = await mkdtemp(path.join(os.tmpdir(), "helloiam-pilot-render-"));
  try {
    for (const item of selection) await renderItem(browser, item, scratch);
  } finally {
    await browser.close();
    await rm(scratch, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
