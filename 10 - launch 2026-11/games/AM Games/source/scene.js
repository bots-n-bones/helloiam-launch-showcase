'use strict';

const screen = document.querySelector('canvas');
const context = screen.getContext('2d', { alpha: false });
const W = screen.width;
const H = screen.height;
const palette = {
  white: ['#ffffff', '#0f0f10', '#c5342e'],
  red: ['#c5342e', '#ffffff', '#f6c757'],
  yellow: ['#f6c757', '#0f0f10', '#ea5028'],
  black: ['#0f0f10', '#ffffff', '#ea5028'],
  blue: ['#557af7', '#ffffff', '#0f0f10'],
};
const files = {
  nur: '07-Pomegranate.png', apricot: '08-Apricot.png', jazve: '41-Jazve.png',
  duduk: '22-Duduk.png', tolma: '09-Tolma.png', gata: '16-Gata.png',
  grapes: '11-Grapes.png', matnakash: '12-Matnakash.png',
  board: '21-Backgammon.png', carpet: '25-Carpet.png',
  temple: '29-Garni-tample.png', dancer: '47-Tashi-Tushi-dancing-man.png',
};

function surface(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function alphaBounds(canvas, threshold = 100) {
  const { width, height } = canvas;
  const { data } = canvas.getContext('2d').getImageData(0, 0, width, height);
  let left = width, right = 0, top = height, bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < threshold) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  return [left, top, right - left + 1, bottom - top + 1];
}

const art = {};
const assetBase = window.assetBase;
async function loadFont(family, filename, descriptors) {
  const font = new FontFace(family, 'url("' + assetBase.fonts + filename + '")', descriptors);
  document.fonts.add(await font.load());
}

const ready = Promise.all([
  loadFont('Instrument Sans', 'InstrumentSans-Bold.woff2', { weight: '700' }),
  ...Object.entries(files).map(async ([key, file]) => {
    const image = new Image();
    image.src = assetBase.emoji + encodeURIComponent(file);
    await image.decode();
    const canvas = surface(image.width, image.height);
    canvas.getContext('2d').drawImage(image, 0, 0);
    art[key] = { image, bounds: alphaBounds(canvas) };
  }),
]);

function dimensions(asset, maxWidth, maxHeight) {
  const [, , width, height] = art[asset].bounds;
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return [width * scale, height * scale];
}

function object(asset, x, y, maxWidth, maxHeight, target = context) {
  const { image, bounds } = art[asset];
  const [width, height] = dimensions(asset, maxWidth, maxHeight);
  target.drawImage(image, ...bounds, x - width / 2, y - height / 2, width, height);
}

function type(label, x, y, { size, color, maxWidth = W, align = 'left', tracking = 0 }) {
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = 'alphabetic';
  const font = '700 SIZEpx "Instrument Sans"';
  context.letterSpacing = tracking + 'px';
  context.font = font.replace('SIZE', size);
  while (context.measureText(label).width > maxWidth && size > 20) {
    size -= 1;
    context.font = font.replace('SIZE', size);
  }
  context.fillText(label, x, y);
  return context.measureText(label).width;
}

function line(x1, y, x2, color, width = 2) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y);
  context.lineTo(x2, y);
  context.stroke();
}

const stage = { x: 540, y: 648 };
const silhouetteSize = { width: 738, height: 652 };
let contour;
function buildContour() {
  const size = 778;
  const matte = surface(size, size);
  const mask = matte.getContext('2d');
  object('nur', size / 2, size / 2, silhouetteSize.width, silhouetteSize.height, mask);

  const pixels = mask.getImageData(0, 0, size, size);
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = 197;
    pixels.data[i + 1] = 52;
    pixels.data[i + 2] = 46;
    pixels.data[i + 3] = Math.max(0, Math.min(255, (pixels.data[i + 3] - 100) * 8));
  }
  mask.putImageData(pixels, 0, 0);

  const result = surface(size, size);
  const rim = result.getContext('2d');
  for (let step = 0; step < 32; step++) {
    const angle = step * Math.PI / 16;
    rim.drawImage(matte, Math.cos(angle) * 9, Math.sin(angle) * 9);
  }
  rim.globalCompositeOperation = 'destination-out';
  rim.drawImage(matte, 0, 0);
  return result;
}

function silhouette(asset, y = stage.y) {
  contour ??= buildContour();
  object(asset, stage.x, y, silhouetteSize.width, silhouetteSize.height);
  context.drawImage(contour, stage.x - contour.width / 2, y - contour.height / 2);
}

const pips = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

function die(value, x, y, angle) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.fillStyle = '#af805b';
  context.beginPath();
  context.roundRect(-58, -52, 116, 116, 13);
  context.fill();
  context.fillStyle = '#f4dfb9';
  context.beginPath();
  context.roundRect(-58, -60, 116, 116, 13);
  context.fill();
  context.fillStyle = '#38281f';
  for (const [col, row] of pips[value]) {
    context.beginPath();
    context.arc(col * 27, row * 27 - 2, 7.8, 0, 2 * Math.PI);
    context.fill();
  }
  context.restore();
}

function board({ value: [left, right], bounce }, y = stage.y) {
  context.save();
  context.translate(stage.x, y);
  context.scale(1.43, 1.43);
  context.translate(-stage.x, -stage.y);
  object('board', stage.x, stage.y, 559, 435);
  const lift = [10, 32, 16, 0][bounce];
  const tilt = [0.24, -0.25, 0.13, 0.06][bounce];
  const rollingLeft = bounce === 3 ? left : ((left + bounce + 1) % 6) + 1;
  const rollingRight = bounce === 3 ? right : ((right + bounce + 3) % 5) + 1;
  die(rollingLeft, 649, 647 - lift, tilt);
  die(rollingRight, 773, 658 - lift, -tilt * 1.4);
  context.restore();
}

const stitches = { TL: [385, 376], TR: [492, 376], BL: [385, 484], BR: [492, 484] };
const panels = new Map();
function carpetPanel(stitch) {
  if (panels.has(stitch)) return panels.get(stitch);
  const panel = surface(264, 264);
  const painter = panel.getContext('2d');
  const cropX = 306, cropY = 297;
  painter.drawImage(art.carpet.image, cropX, cropY, 264, 264, 0, 0, 264, 264);

  const [x, y] = stitches[stitch];
  const size = 32;
  const left = x - cropX - size / 2;
  const top = y - cropY - size / 2;
  const patch = painter.getImageData(left, top, size, size);
  const original = patch.data.slice();
  const last = size - 1;
  const olive = [143, 131, 97];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const index = (row * size + col) * 4;
      const opposite = original.length - 4 - index;
      const inward = (stitch[0] === 'T' ? row : last - row) +
        (stitch[1] === 'L' ? col : last - col);
      // Keep the burgundy diagonal where the patch meets the center ornament.
      if (inward >= 53 && original[index + 1] < 106) continue;
      const replaceDiagonal = inward <= 9 && original[opposite + 1] < 106;
      const blend = Math.min(1, Math.min(row, col, last - row, last - col) / 2);
      for (let channel = 0; channel < 3; channel++) {
        const rotated = replaceDiagonal ? olive[channel] : original[opposite + channel];
        patch.data[index + channel] = original[index + channel] * (1 - blend) + rotated * blend;
      }
    }
  }
  painter.putImageData(patch, left, top);
  panels.set(stitch, panel);
  return panel;
}

function carpet(stitch) {
  const size = 680;
  context.drawImage(carpetPanel(stitch), stage.x - size / 2, stage.y - size / 2, size, size);
}

function temple(name, ink) {
  object('temple', stage.x, stage.y, 774, 519);
  type(name, stage.x, 1184, { size: 128, color: ink, align: 'center', tracking: -5 });
}

const poses = [
  { offset: 0, angle: 0, scale: 1, lift: 0 },
  { offset: 50, angle: 9, scale: 1, lift: 0 },
  { offset: 95, angle: -10, scale: 1.01, lift: 0 },
  { offset: 76, angle: 5, scale: .88, lift: 0 },
  { offset: 38, angle: -9, scale: 1.025, lift: 78 },
  { offset: 3, angle: 7, scale: .91, lift: 0 },
  { offset: -43, angle: 8, scale: 1, lift: 0 },
  { offset: 0, angle: 0, scale: 1, lift: 0 },
];

const dancers = new Map();
function dancer(state, accent) {
  const index = state.value;
  const direction = state.mirrored ? -1 : 1;
  const pose = poses[index];
  const key = index + ':' + direction;
  if (!dancers.has(key)) {
    const sprite = surface(700, 700);
    const painter = sprite.getContext('2d');
    painter.translate(350, 350);
    painter.rotate(direction * pose.angle * Math.PI / 180);
    painter.scale(direction, 1);
    object('dancer', 0, 0, 521, 491 * pose.scale, painter);
    dancers.set(key, { sprite, bounds: alphaBounds(sprite) });
  }
  const { sprite, bounds } = dancers.get(key);
  const floor = 885;
  line(210, floor, 870, accent, 5);
  context.drawImage(sprite, stage.x + direction * pose.offset - sprite.width / 2,
    floor - pose.lift - bounds[1] - bounds[3] + 1);
}

function cover(game, ink) {
  for (const [index, row] of game.title.entries()) {
    type(row, 110, 485 + index * 149, { size: 160, color: ink, maxWidth: 860, tracking: -4 });
  }

  const y = 1114;
  switch (game.icon) {
    case 'nur':
      silhouette('nur', y);
      break;
    case 'board':
      board({ value: [2, 4], bounce: 3 }, y);
      break;
    case 'carpet':
      object('carpet', stage.x, y, 747, 731);
      break;
    case 'temple':
      object('temple', stage.x, y, 803, 657);
      break;
    case 'dancer':
      object('dancer', stage.x, y, 685, 705);
      break;
  }
}

function intro(game, state, ink, accent) {
  if (state.phase === 'ready') {
    type('READY?', stage.x, 795, { size: 222, color: ink, align: 'center', maxWidth: 860, tracking: -9 });
    for (const [index, row] of game.prompt.entries()) {
      type(row, stage.x, 960 + index * 70, {
        size: 66, color: ink, align: 'center', maxWidth: 855, tracking: -2,
      });
    }
    return;
  }
  const countInk = game.background === 'yellow' ? ink : accent;
  const label = state.phase === 'go' ? 'GO!' : String(state.count);
  type(label, stage.x, 1090, {
    size: state.phase === 'go' ? 365 : 606,
    color: countInk, align: 'center', maxWidth: 870, tracking: -18,
  });
}

function paint(gameIndex, frame) {
  const game = timeline.games[gameIndex];
  const state = timeline.frameAt(game, frame);
  const [background, ink, accent] = palette[game.background];
  context.fillStyle = background;
  context.fillRect(0, 0, W, H);

  if (state.phase === 'cover') {
    cover(game, ink);
    return state;
  }

  type(game.title.join(' '), stage.x, 1500, {
    size: 60, color: ink, align: 'center', maxWidth: 860, tracking: -1,
  });

  if (state.phase !== 'play') {
    intro(game, state, ink, accent);
    return state;
  }

  switch (game.icon) {
    case 'nur': silhouette(state.value); break;
    case 'board': board(state); break;
    case 'carpet': carpet(state.value); break;
    case 'temple': temple(state.value, ink); break;
    case 'dancer': dancer(state, accent); break;
  }
  return state;
}

window.reel = { ready, paint };
