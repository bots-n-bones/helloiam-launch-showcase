const buttons = [...document.querySelectorAll('[data-mode]')];
const previews = [...document.querySelectorAll('iframe')];
const play = document.querySelector('#play');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let mode = 'media';
let playing = !motion.matches;
const visible = new Set();

function syncPreview(preview) {
  preview.contentWindow?.postMessage({
    type: 'promo-state',
    mode,
    playing: playing && !document.hidden && visible.has(preview)
  }, '*');
}

function syncGallery() {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  play.setAttribute('aria-pressed', String(playing));
  play.textContent = playing ? '⏸ Пауза' : '▶ Воспроизвести';
  previews.forEach(preview => {
    preview.closest('.post').querySelector('.caption a').href = preview.getAttribute('src') + '?mode=' + mode;
    syncPreview(preview);
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visible.add(entry.target);
    else visible.delete(entry.target);
    syncPreview(entry.target);
  });
}, {threshold: .15});

previews.forEach(preview => {
  preview.addEventListener('load', () => syncPreview(preview));
  observer.observe(preview);
});
buttons.forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  syncGallery();
}));
play.addEventListener('click', () => {
  playing = !playing;
  syncGallery();
});
document.addEventListener('visibilitychange', syncGallery);
motion.addEventListener('change', () => {
  playing = !motion.matches;
  syncGallery();
});
syncGallery();
