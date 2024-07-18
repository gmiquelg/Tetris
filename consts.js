export const AUDIO = new window.Audio('./tetris.mp3');

export const CANVAS = document.querySelector('#game');
export const CONTEXT = CANVAS.getContext('2d');

export const SIZE = 30
export const ROWS = 20
export const COLUMNS = 10

export const CANVAS_NEXT = document.querySelector('#next');
export const CONTEXT_NEXT = CANVAS_NEXT.getContext('2d');

export const ROWS_NEXT = 6
export const COLUMNS_NEXT = 6

export const PIECES = [
  // Square (2x2)
  [
    [1, 1],
    [1, 1]
  ],
  // L-shape
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  // T-shape
  [
    [1, 0],
    [1, 1],
    [1, 0]
  ],
  // Line
  [
    [1],
    [1],
    [1],
    [1]
  ],
  // S-shape
  [
    [0, 1],
    [1, 1],
    [1, 0]
  ],
  // Z-shape
  [
    [1, 0],
    [1, 1],
    [0, 1]
  ],
  // J-shape
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ]
];

export const initialDropInterval = 1000; // 1 second
export const minDropInterval = 400; // 0.4 seconds

export const audioInterval = 83500;

export const app = document.getElementById('app');

export const counterDisplay = document.createElement('h4');

export const scoreDisplay = document.createElement('h5');