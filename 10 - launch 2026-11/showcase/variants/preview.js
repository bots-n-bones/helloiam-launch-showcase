
const frame = document.querySelector('.art-frame');
const canvas = frame.querySelector('.canvas');
const button = document.querySelector('.motion-toggle');
let playing = false;
function sync() {
  document.documentElement.dataset.motion = playing ? 'playing' : 'paused';
  button.textContent = playing ? '⏸ Пауза' : '▶ Воспроизвести';
  button.setAttribute('aria-pressed', String(playing));
}
new ResizeObserver(() => { canvas.style.transform = 'scale(' + frame.clientWidth / 1080 + ')'; }).observe(frame);
button.addEventListener('click', () => { playing = !playing; sync(); });
sync();
