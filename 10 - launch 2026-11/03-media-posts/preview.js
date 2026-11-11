const steps = [...document.querySelectorAll('[data-step]')];
const frames = [...document.querySelectorAll('[data-frame]')];
const playButton = document.querySelector('#play');
const beatMs = 2000 / 3;
let frame = 1;
let timer;

function showFrame(index) {
  frame = index;
  frames.forEach(panel => { panel.hidden = Number(panel.dataset.frame) !== index; });
  steps.forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.step) === index));
  });
}

function stopPlayback() {
  clearInterval(timer);
  timer = undefined;
  playButton.setAttribute('aria-pressed', 'false');
  playButton.textContent = '▶ Проиграть';
}

steps.forEach(button => button.addEventListener('click', () => {
  stopPlayback();
  showFrame(Number(button.dataset.step));
}));

playButton.addEventListener('click', () => {
  if (timer !== undefined) {
    stopPlayback();
    return;
  }
  showFrame(0);
  playButton.setAttribute('aria-pressed', 'true');
  playButton.textContent = '⏸ Пауза';
  timer = setInterval(() => showFrame((frame + 1) % steps.length), beatMs);
});
