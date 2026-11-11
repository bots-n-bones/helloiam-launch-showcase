'use strict';

const fps = 30;
const totalFrames = 8 * fps;
const coverFrames = 24;
const countStart = 51;
const fastFrames = 9;
const slowFrames = 2 * fastFrames;
const goStart = countStart + 3 * fastFrames;
const firstPlayFrame = goStart + 6;
const resetFrame = 228;

const games = [
  {
    slug: '01-match-the-silhouette', title: ['MATCH THE', 'SILHOUETTE'],
    prompt: ['PAUSE WHEN IT FITS'], background: 'white', icon: 'nur',
  },
  {
    slug: '02-roll-double-sixes', title: ['ROLL', 'DOUBLE SIXES'],
    prompt: ['PAUSE ON DOUBLE SIXES'], background: 'red', icon: 'board',
  },
  {
    slug: '03-spot-the-stitch', title: ['SPOT THE', 'STITCH'],
    prompt: ['FIND THE FLIPPED STITCH'], background: 'yellow', icon: 'carpet',
  },
  {
    slug: '04-name-that-place', title: ['NAME THAT', 'PLACE'],
    prompt: ['PAUSE ON THE RIGHT NAME'], background: 'black', icon: 'temple',
  },
  {
    slug: '05-catch-the-dancer', title: ['CATCH THE', 'DANCER'],
    prompt: ['PAUSE MID-JUMP'], background: 'blue', icon: 'dancer',
  },
];

const silhouettes = ['apricot', 'jazve', 'duduk', 'nur', 'tolma', 'gata', 'grapes', 'matnakash'];
const dicePairs = [[1, 4], [5, 2], [6, 3], [2, 2], [4, 1], [6, 6], [3, 5], [1, 6]];
const stitches = ['TL', 'BR', 'TR', 'BL'];
const placeNames = ['TATEV', 'GEGHARD', 'GARNI', 'TATEV', 'GEGHARD', 'TATEV', 'GARNI', 'GEGHARD'];

function frameAt(game, frame) {
  if (frame < coverFrames || frame >= resetFrame) return { phase: 'cover', win: false };
  if (frame < countStart) return { phase: 'ready', win: false };
  if (frame < goStart) {
    const count = 3 - Math.floor((frame - countStart) / fastFrames);
    return { phase: 'countdown', count, win: false };
  }
  if (frame < firstPlayFrame) return { phase: 'go', win: false };

  const elapsed = frame - firstPlayFrame;
  const halfBeat = Math.floor(elapsed / fastFrames);
  const beat = Math.floor(elapsed / slowFrames);
  const active = { phase: 'play' };

  switch (game.icon) {
    case 'nur': {
      const value = silhouettes[halfBeat % silhouettes.length];
      return { ...active, value, win: value === 'nur' };
    }
    case 'board': {
      const position = elapsed % slowFrames;
      const bounce = Math.max(0, Math.min(3, position - 1));
      const value = dicePairs[beat];
      return { ...active, value, bounce, win: bounce === 3 && value[0] === 6 && value[1] === 6 };
    }
    case 'carpet':
      return { ...active, value: stitches[beat % stitches.length], win: true };
    case 'temple': {
      const value = placeNames[beat];
      return { ...active, value, win: value === 'GARNI' };
    }
    case 'dancer': {
      const value = halfBeat % 8;
      return { ...active, value, mirrored: halfBeat >= 8, win: value === 4 };
    }
    default:
      throw new Error('Unknown game ' + game.icon);
  }
}

const timeline = { fps, totalFrames, countStart, fastFrames, firstPlayFrame, resetFrame, games, frameAt };
if (typeof module === 'object') module.exports = timeline;
else window.timeline = timeline;
