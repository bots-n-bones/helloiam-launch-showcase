const artboard = document.querySelector('.artboard');
const root = document.documentElement;
const video = document.querySelector('.media-track video');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const modes = ['media', 'cut', 'original'];

function fit() {
  const scale = Math.min(innerWidth / artboard.offsetWidth, innerHeight / artboard.offsetHeight);
  artboard.style.left = (innerWidth - artboard.offsetWidth * scale) / 2 + 'px';
  artboard.style.top = (innerHeight - artboard.offsetHeight * scale) / 2 + 'px';
  artboard.style.transform = 'scale(' + scale + ')';
}

function setPlayback(mode, playing) {
  root.dataset.mode = mode;
  root.dataset.playing = String(playing);
  if (video) {
    if (playing && mode !== 'original') video.play().catch(() => {});
    else video.pause();
  }
}

fit();
addEventListener('resize', fit);
if (parent === window) {
  const requested = new URL(location.href).searchParams.get('mode');
  const mode = modes.includes(requested) ? requested : 'media';
  const sync = () => setPlayback(mode, !motion.matches && !document.hidden);
  sync();
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
} else {
  addEventListener('message', event => {
    const state = event.data;
    if (event.source === parent && state?.type === 'promo-state' && modes.includes(state.mode)) {
      setPlayback(state.mode, state.playing === true);
    }
  });
}
