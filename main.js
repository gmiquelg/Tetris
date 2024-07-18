import './style.css'
import { AUDIO, CANVAS, CONTEXT, CANVAS_NEXT, CONTEXT_NEXT, PIECES, initialDropInterval, minDropInterval, SIZE, ROWS, COLUMNS, ROWS_NEXT, COLUMNS_NEXT, audioInterval, app, counterDisplay, scoreDisplay } from "./consts.js";

// Set canvas size based on grid cell size
CANVAS.width = COLUMNS * SIZE
CANVAS.height = ROWS * SIZE

CANVAS_NEXT.width = COLUMNS_NEXT * SIZE
CANVAS_NEXT.height = ROWS_NEXT * SIZE

let startingTime = Date.now()
let currentTime = Date.now()
let lastDropTime = 0

let dropInterval = initialDropInterval;

let score = 0;

let grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

let nextPiece = generateNextPiece()
nextPiece.posX = 4
nextPiece.posY = 0
let showingPiece = generateNextPiece()

let audioLastTime = Date.now()

let gameStarted = false;


export function startGame() {
  if (!gameStarted) {
    AUDIO.volume = 0.05
    AUDIO.currentTime = 0;
    AUDIO.play()

    // Hide the main menu
    document.getElementById('main-menu').style.display = 'none';
    // Show the game section
    document.getElementById('game-section').style.display = 'block';

    // Set game started flag to true
    gameStarted = true;
  }
}

function formatTime(milliseconds) {

  let totalSeconds = Math.floor(milliseconds / 1000)
  let hours = Math.floor(totalSeconds / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  let seconds = totalSeconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function draw() {

  CONTEXT.fillStyle = '#000';
  CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);
  CONTEXT.strokeStyle = 'white';
  CONTEXT.lineWidth = 0.5;

  CONTEXT_NEXT.fillStyle = '#000'
  CONTEXT_NEXT.fillRect(0, 0, CANVAS_NEXT.width, CANVAS_NEXT.height);

  // Draw a column where the piece is landing
  grid.forEach((row, y) => {
    if (y >= nextPiece.shape.length + nextPiece.posY) {
      row.forEach((value, x) => {
        if (x >= nextPiece.posX && x < nextPiece.posX + nextPiece.shape[0].length) {
          CONTEXT.fillStyle = 'rgba(255, 201, 84, 0.1)';
          CONTEXT.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
        }
      })
    }
  })

  // Draw grid based on the grid array
  grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        CONTEXT.fillStyle = 'orange';
        CONTEXT.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
      }
      CONTEXT.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
    })
  })

  // Draw nextPiece based on the grid array
  nextPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        CONTEXT.fillStyle = 'green';
        CONTEXT.fillRect((x + nextPiece.posX) * SIZE, (y + nextPiece.posY) * SIZE, SIZE, SIZE);
      } else {
        CONTEXT.fillStyle = 'rgba(255, 201, 84, 0.1)';
        CONTEXT.fillRect((x + nextPiece.posX) * SIZE, (y + nextPiece.posY) * SIZE, SIZE, SIZE);
      }
      CONTEXT.strokeRect((x + nextPiece.posX) * SIZE, (y + nextPiece.posY) * SIZE, SIZE, SIZE);
    })
  })

  // Draw showingPiece based on the grid array
  showingPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        CONTEXT_NEXT.fillStyle = 'green';
        CONTEXT_NEXT.fillRect((x + showingPiece.posX) * SIZE, (y + showingPiece.posY) * SIZE, SIZE, SIZE);
      }
      CONTEXT_NEXT.strokeRect((x + showingPiece.posX) * SIZE, (y + showingPiece.posY) * SIZE, SIZE, SIZE);
    })
  })
}

function checkCollision() {

  return nextPiece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && grid[y + nextPiece.posY]?.[x + nextPiece.posX] !== 0
      )
    })
  })
}

function generateNextPiece() {
  // Choose a random piece shape
  const randomIndex = Math.floor(Math.random() * PIECES.length);
  const shape = PIECES[randomIndex];

  // Initial position of the piece (top center)
  const initialX = 2; // Adjust as needed
  const initialY = 1; // Center horizontally

  return {
    posX: initialX,
    posY: initialY,
    shape: shape
  };
}

function mergePiece() {

  // Update grid with the current piece
  nextPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        grid[y + nextPiece.posY][x + nextPiece.posX] = 1
      }
    })
  })

  checkGameOver()
  nextPiece = showingPiece
  nextPiece.posX = 4
  nextPiece.posY = 0
  showingPiece = generateNextPiece();
}

function updatePiece() {

  if (Date.now() - lastDropTime > dropInterval) {
    lastDropTime = Date.now();

    // Update score based on time
    score += 1;

    // Move the piece down if possible
    nextPiece.posY += 1;
    if (checkCollision()) {
      nextPiece.posY -= 1;
      mergePiece();
    }

    // Gradually decrease the drop interval
    if (dropInterval > minDropInterval) {
      dropInterval -= 2; // Decrease by 1ms each time
    }
  }
}

function updateGrid() {
  // Iterate through each row to check if it is full
  for (let row = 0; row < ROWS; row++) {
    let isRowFull = true;
    for (let col = 0; col < COLUMNS; col++) {
      if (grid[row][col] === 0) {
        isRowFull = false;
        break;
      }
    }

    // If the row is full, remove it and move all rows above down
    if (isRowFull) {
      // Remove the full row
      grid.splice(row, 1);

      // Add an empty row at the top
      grid.unshift(Array(COLUMNS).fill(0));
      
      // Update score
      score += 100;

      // Since we have modified the rows, we need to recheck the same row index
      row--;
    }
  }
}

function resetGame() {

  // Reset audio
  AUDIO.pause()
  audioLastTime = Date.now()

  // Show the main menu 
  document.getElementById('main-menu').style.display = 'block';
  // Hide the game section
  document.getElementById('game-section').style.display = 'none';

  // Set game started flag to true
  gameStarted = false;

  // Reset the grid
  grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

  // Reset the piece
  showingPiece = generateNextPiece();
  nextPiece = generateNextPiece();
  
  // Reset score and timer
  score = 0;
  currentTime = Date.now();

  // Reset drop interval
  dropInterval = initialDropInterval;

  // Start the update loop again
  update();
}

function checkGameOver() {

  for (let col = 0; col < COLUMNS; col++) {
    if (grid[0][col] === 1) {
      alert(`Game Over! Your score is ${score}. You have survived ${formatTime(Date.now() - startingTime)}`);
      resetGame();
      return true;
    }
  }
  return false;
}

function update() {

  if (Date.now() - audioLastTime > audioInterval) {
    AUDIO.pause()
    AUDIO.volume = 0.05
    AUDIO.currentTime = 0;
    AUDIO.play()

    audioLastTime = Date.now()
  }

  if (gameStarted) {
    const now = Date.now()
    const elapsedTime = now - currentTime
    document.getElementById('counter').innerText = `Time: ${formatTime(elapsedTime)}`

    document.getElementById('score').innerText = `Score: ${score}`

    // Move piece
    updatePiece()
  } else {
    startingTime = Date.now()
    currentTime = Date.now()
  }

  // Clear the canvas
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)

  // Draw the grid
  draw()

  // Delete lines
  updateGrid()

  window.requestAnimationFrame(update)
}

// Corrected rotation function
function rotatePiece(matrix) {

  // Get the dimensions of the original matrix
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Create a new matrix with dimensions swapped
  const rotatedMatrix = [];
  for (let i = 0; i < cols; i++) {
      rotatedMatrix[i] = [];
  }

  // Populate the new matrix
  for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
          rotatedMatrix[j][rows - 1 - i] = matrix[i][j];
      }
  }
  
  return {
    posX: nextPiece.posX,
    posY: nextPiece.posY,
    shape: rotatedMatrix
  };
}

document.addEventListener('keydown', event => {

  if (event.key === 'ArrowLeft') {
    nextPiece.posX -= 1;
    if (checkCollision()) { // Check if piece can move left
      nextPiece.posX += 1; // Move left
    }
  } else if (event.key === 'ArrowRight') {
    nextPiece.posX += 1;
    if (checkCollision()) { // Check if piece can move right
      nextPiece.posX -= 1; // Move right
    }
  } else if (event.key === 'ArrowDown') {
    nextPiece.posY += 1;
    if (checkCollision()) { // Check if piece can move down
      nextPiece.posY -= 1; // Move down
      mergePiece()
    }
  } else if (event.key === 'ArrowUp') {
    let previousPiece = nextPiece
    nextPiece = rotatePiece(nextPiece.shape)
    if (checkCollision()) {
      nextPiece = previousPiece
    }
  }
});

// Create counter display
counterDisplay.id = 'counter';
counterDisplay.textContent = 'Time: 00:00:00';
app.insertBefore(counterDisplay, app.firstChild); // Insert before the first child of 

// Create score display
scoreDisplay.id = 'score';
scoreDisplay.textContent = 'Score: 0';
app.appendChild(scoreDisplay); // Append to the end of #app

update()