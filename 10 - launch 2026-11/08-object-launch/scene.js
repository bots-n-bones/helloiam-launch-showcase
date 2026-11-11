const params = new URLSearchParams(location.search);
const id = Object.hasOwn(objectLaunch, params.get("film")) ? params.get("film") : "jug";
const film = objectLaunch[id];
const canvas = document.getElementById("film");
const play = document.getElementById("play");
const context = canvas.getContext("2d", { alpha: false });
const width = canvas.width;
const height = canvas.height;
const ink = "#0f0f10";
const white = "#ffffff";
const material = new Image();
material.src = "../02-claude-session%202026-11-10/emoji-cutout/" + film.asset;
const clamp = value => Math.min(1, Math.max(0, value));
const mix = (a, b, t) => a + (b - a) * t;
const settle = t => 1 - (1 - clamp(t)) ** 3;
const smooth = t => clamp(t) ** 2 * (3 - 2 * clamp(t));

function background(color) {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
}

function object(x, y, size, angle = 0, squeeze = 1) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.scale(squeeze, 1);
  context.drawImage(material, -size / 2, -size / 2, size, size);
  context.restore();
}

function crop(anchor, progress, x = width / 2, y = height / 2) {
  const [u, v, zoom, angle] = anchor;
  const size = zoom * mix(1.09, 0.94, progress);
  context.save();
  context.translate(x, y);
  context.rotate(angle + 0.12 * progress);
  context.drawImage(material, -size * (u + 0.10 * progress), -size * (v - 0.07 * progress), size, size);
  context.restore();
}

function lettering(text, x, y, requestedSize, color, limit = width - 120) {
  const setSize = size => {
    context.font = '700 ' + size + 'px "Instrument Sans"';
    context.letterSpacing = (-size * 0.055) + "px";
  };
  setSize(requestedSize);
  const measured = context.measureText(text).width;
  if (measured > limit) setSize(requestedSize * limit / measured);
  context.fillStyle = color;
  context.textBaseline = "top";
  context.fillText(text, x, y);
}

function streams(x, y, size, time) {
  const top = y - size / 2;
  const left = x - size / 2;
  context.save();
  context.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const pulse = (time * (0.81 + 0.12 * i) + i * 0.19) % 1;
    const start = top + size * (0.505 + pulse * 0.23);
    const center = left + size * (0.615 + i * 0.003);
    context.strokeStyle = "rgba(244,252,254," + (Math.sin(Math.PI * pulse) * 0.72) + ")";
    context.lineWidth = size * 0.003;
    context.beginPath();
    context.moveTo(center, start);
    context.lineTo(center - size * 0.002, Math.min(start + size * 0.018, top + size * 0.743));
    context.stroke();
  }
  context.restore();
}

function reveal(t) {
  background(film.main);
  const e = settle(t / 0.95);
  const drift = smooth(t / 2.3);
  const size = mix(1390, 1000, e) * mix(1, 0.96, drift);
  const center = mix(747, 668, e);
  object(540, center, size, film.tilt * (1 - e), mix(0.92, 1, e));
  if (id === "fountains") streams(540, center, size, t);
}

function phrase(t) {
  const black = id !== "fountains";
  background(black ? ink : "#f6c757");
  const size = id === "jug" ? 288 : 238;
  const center = (height - size * 2 * 0.84) / 2;
  film.phrase.forEach((line, index) => {
    const age = t - index * 0.17;
    if (age < 0) return;
    const e = settle(age / 0.38);
    context.save();
    context.globalAlpha = e;
    lettering(line, 60, center + index * size * 0.84 + 42 * (1 - e),
      size, black ? (index === 0 ? white : film.accent) : ink);
    context.restore();
  });
}

function jugPattern(t) {
  background(film.pattern);
  for (let i = 0; i < 3; i++) {
    const age = t - i * 0.27;
    if (age < 0) continue;
    const e = settle(age / 0.72);
    const x = 267 + i * 270;
    const y = 339 + i * 320 + (1 - e) * 160;
    object(x, y, 544, mix(-1.04, -0.32, e) + 0.13 * Math.sin(age * 3.5));
  }
}

function fabricPattern(t) {
  background(ink);
  const anchors = [
    [0.40, 0.24, 2450, 0.04],
    [0.44, 0.55, 2350, -0.02],
    [0.52, 0.84, 2290, 0.02],
  ];
  anchors.forEach((anchor, i) => {
    const age = t - i * 0.28;
    if (age < 0) return;
    const e = settle(age / 0.48);
    const y = i * 450;
    context.save();
    context.beginPath();
    context.rect(0, y + 4, width * e, 442);
    context.clip();
    crop(anchor, smooth(age / 2.0), width / 2, y + 225);
    context.restore();
  });
}

function fountainPattern(t) {
  background(film.pattern);
  for (let i = 0; i < 7; i++) {
    const age = t - i * 0.15;
    if (age < 0) continue;
    const e = settle(age / 0.56);
    const x = 74 + i % 3 * 443 + (i < 3 ? 0 : 115);
    const y = 286 + Math.floor(i / 3) * 440 + 116 * (1 - e);
    const size = 457;
    object(x, y, size);
    streams(x, y, size, age);
  }
}

const patterns = { jug: jugPattern, backpack: fabricPattern, fountains: fountainPattern };

function hero(t) {
  background(film.main);
  const e = settle(t / 0.66);
  const drift = smooth(t / 5.5);
  const y = film.heroY + mix(107, 0, e) + 16 * drift;
  const size = film.heroSize * mix(0.91, 1, e) * mix(1, 1.04, drift);
  object(540, y, size, film.tilt * (1 - e));
  if (id === "fountains") streams(540, y, size, t);
  lettering(film.name, 60, 95 + 26 * (1 - e), id === "jug" ? 348 : 250, film.ink);
}

function paint(seconds) {
  const t = Math.max(0, Math.min(14.999, seconds));
  if (t < 1.2) {
    background(ink);
    crop(film.opening, smooth(t / 1.2));
    return "macro";
  }
  if (t < 3.5) {
    reveal(t - 1.2);
    return "reveal";
  }
  if (t < 5.2) {
    phrase(t - 3.5);
    return "phrase";
  }
  if (t < 7.4) {
    patterns[id](t - 5.2);
    return "pattern";
  }
  if (t < 9.5) {
    background(ink);
    crop(film.detail, smooth((t - 7.4) / 2.1));
    return "detail";
  }
  hero(t - 9.5);
  return "hero";
}

canvas.setAttribute("aria-label", film.name.replace(".", "") + " product film");
window.objectReady = Promise.all([document.fonts.load('700 160px "Instrument Sans"'), material.decode()])
  .then(() => { paint(13.5); });
window.paintObjectFrame = paint;
window.objectJPEG = seconds => {
  paint(seconds);
  return canvas.toDataURL("image/jpeg", 0.96).split(",")[1];
};

let timer;
let started;
function pause() {
  cancelAnimationFrame(timer);
  timer = undefined;
  play.textContent = "Play";
}
play.addEventListener("click", async () => {
  await window.objectReady;
  if (timer !== undefined) return pause();
  play.textContent = "Pause";
  started = performance.now();
  const tick = time => {
    const elapsed = (time - started) / 1000;
    paint(elapsed);
    if (elapsed < 15) timer = requestAnimationFrame(tick);
    else pause();
  };
  timer = requestAnimationFrame(tick);
});
