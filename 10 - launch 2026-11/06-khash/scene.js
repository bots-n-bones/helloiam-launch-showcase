const params = new URLSearchParams(location.search);
document.documentElement.dataset.genre = params.get("genre") === "comedy" ? "comedy" : "horror";

const duration = 25;
const shots = [...document.querySelectorAll(".shot")].map(shot => ({
  element: shot,
  start: Number(shot.dataset.start),
  animations: shot.getAnimations({ subtree: true }),
}));
for (const shot of shots) {
  for (const animation of shot.animations) animation.pause();
}

const fog = document.querySelector(".fog video");
let fogFrame = -1;

async function showFrame(seconds) {
  const time = Math.max(0, Math.min(Number(seconds) || 0, duration));
  const active = shots.findLast(shot => shot.start <= time);
  for (const shot of shots) shot.element.classList.toggle("is-active", shot === active);
  for (const animation of active.animations) animation.currentTime = (time - active.start) * 1000;

  if (active.element.contains(fog)) {
    const frame = Math.floor((time - active.start) * 24 + 1e-6);
    if (frame !== fogFrame) {
      await new Promise((resolve, reject) => {
        const controller = new AbortController();
        const { signal } = controller;
        fog.addEventListener("seeked", () => { controller.abort(); resolve(); }, { once: true, signal });
        fog.addEventListener("error", () => { controller.abort(); reject(fog.error); }, { once: true, signal });
        fog.currentTime = 1.502 + frame / 24;
      });
      await new Promise(resolve => requestAnimationFrame(resolve));
      fogFrame = frame;
    }
  }
  return active.element.classList[1];
}

window.khashReady = Promise.all([
  document.fonts.ready,
  ...[...document.images].map(image => image.decode()),
]);
window.showKhashFrame = showFrame;
window.khashReady.then(() => showFrame(params.get("t") ?? 2.5));
