const WORDS = [
  "COMMENT",
  "FOLLOWER",
  "HASHTAG",
  "INFLUENCER",
  "MESSAGE",
  "PROFILE",
  "SHARE",
  "STREAM",
  "TRENDING",
  "VIDEO"
];
const LEVELS = {
  easy: { size: 9, wordCount: 5, label: "Easy" },
  medium: { size: 11, wordCount: 7, label: "Medium" },
  hard: { size: 15, wordCount: 10, label: "Hard" }
};

const setupPanel = document.querySelector("#setup-panel");
const gamePanel = document.querySelector("#game-panel");
const successPanel = document.querySelector("#success-panel");
const setupForm = document.querySelector("#setup-form");
const playerNameField = document.querySelector("#player-name-field");
const playerNameInput = setupForm.elements.playerName;
const letterGrid = document.querySelector("#letter-grid");
const wordList = document.querySelector("#word-list");
const progressDisplay = document.querySelector("#progress-display");
const progressBar = document.querySelector("#progress-bar");
const playerDisplay = document.querySelector("#player-display");
const winnerName = document.querySelector("#winner-name");
const continueButton = document.querySelector("#continue-button");
const gameTitle = document.querySelector("#game-title");

let currentGame = null;
let selectedCells = [];
let isSelecting = false;
let selectionDirection = null;
let hasStarted = false;

function restorePlayerName() {
  const savedPlayerName = PlayerSession.getName();
  playerNameInput.value = savedPlayerName;
  playerNameInput.toggleAttribute("readonly", Boolean(savedPlayerName));
  if (savedPlayerName) playerNameField.hidden = true;
}

function randomLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getPlacement(word, size, diagonalOnly = false) {
  const directions = shuffle([
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]).filter(([rowStep, columnStep]) => !diagonalOnly || (rowStep !== 0 && columnStep !== 0));

  for (const [row, column] of shuffle(
    Array.from({ length: size * size }, (_, index) => [Math.floor(index / size), index % size])
  )) {
    for (const [rowStep, columnStep] of directions) {
      const endRow = row + rowStep * (word.length - 1);
      const endColumn = column + columnStep * (word.length - 1);

      if (endRow < 0 || endRow >= size || endColumn < 0 || endColumn >= size) {
        continue;
      }

      const cells = Array.from({ length: word.length }, (_, index) => ({
        row: row + rowStep * index,
        column: column + columnStep * index
      }));
      return cells;
    }
  }

  return null;
}

function createBoard(size, words) {
  const board = Array.from({ length: size }, () => Array(size).fill(""));
  const placements = new Map();

  for (const [wordIndex, word] of shuffle(words).entries()) {
    let placement = null;
    for (let attempt = 0; attempt < 100 && !placement; attempt += 1) {
      const candidate = getPlacement(word, size, wordIndex === 0);
      if (candidate && candidate.every(({ row, column }, index) => {
        return !board[row][column] || board[row][column] === word[index];
      })) {
        placement = candidate;
      }
    }

    if (!placement) {
      return createBoard(size, words);
    }

    placement.forEach(({ row, column }, index) => {
      board[row][column] = word[index];
    });
    placements.set(word, placement);
  }

  return {
    board: board.map((row) => row.map((cell) => cell || randomLetter())),
    placements
  };
}

function renderGame() {
  const { board, size, words } = currentGame;
  letterGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  letterGrid.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((letter, columnIndex) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "letter-cell";
      cell.textContent = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.column = columnIndex;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${rowIndex + 1}, column ${columnIndex + 1}, ${letter}`);
      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("pointerenter", extendSelection);
      letterGrid.append(cell);
    });
  });

  wordList.innerHTML = "";
  words.forEach((word) => {
    const item = document.createElement("li");
    item.textContent = word;
    item.dataset.word = word;
    wordList.append(item);
  });
}

function getCell(row, column) {
  return letterGrid.querySelector(`[data-row="${row}"][data-column="${column}"]`);
}

function paintSelection() {
  letterGrid.querySelectorAll(".is-selected").forEach((cell) => cell.classList.remove("is-selected"));
  selectedCells.forEach(({ row, column }) => getCell(row, column)?.classList.add("is-selected"));
}

function getDirection(start, end) {
  const rowDistance = Math.abs(end.row - start.row);
  const columnDistance = Math.abs(end.column - start.column);
  const rowStep = Math.sign(end.row - start.row);
  const columnStep = Math.sign(end.column - start.column);

  if (rowDistance === columnDistance) {
    return { row: rowStep, column: columnStep };
  }

  return rowDistance > columnDistance
    ? { row: rowStep, column: 0 }
    : { row: 0, column: columnStep };
}

function getLockedLine(start, end) {
  const direction = selectionDirection || getDirection(start, end);
  const rowDistance = end.row - start.row;
  const columnDistance = end.column - start.column;
  const distance = Math.round(
    (rowDistance * direction.row + columnDistance * direction.column)
    / (direction.row ** 2 + direction.column ** 2)
  );
  const length = Math.max(0, distance) + 1;

  return Array.from({ length }, (_, index) => ({
    row: start.row + direction.row * index,
    column: start.column + direction.column * index
  }));
}

function startSelection(event) {
  isSelecting = true;
  selectionDirection = null;
  selectedCells = [{
    row: Number(event.currentTarget.dataset.row),
    column: Number(event.currentTarget.dataset.column)
  }];
  paintSelection();
}

function extendSelection(event) {
  if (!isSelecting || selectedCells.length === 0) return;
  const end = { row: Number(event.currentTarget.dataset.row), column: Number(event.currentTarget.dataset.column) };
  const start = selectedCells[0];
  if (!selectionDirection && (start.row !== end.row || start.column !== end.column)) {
    selectionDirection = getDirection(start, end);
  }
  selectedCells = getLockedLine(start, end);
  paintSelection();
}

function finishSelection() {
  if (!isSelecting) return;
  isSelecting = false;
  const selectedKeys = selectedCells.map(({ row, column }) => `${row},${column}`);
  const foundWord = currentGame.words.find((word) => {
    const placementKeys = currentGame.placements.get(word).map(({ row, column }) => `${row},${column}`);
    return selectedKeys.join("|") === placementKeys.join("|")
      || selectedKeys.join("|") === placementKeys.reverse().join("|");
  });

  if (foundWord && !currentGame.found.has(foundWord)) {
    markWordFound(foundWord);
    if (currentGame.found.size === currentGame.words.length) {
      hasStarted = false;
      PlayerSession.complete("juego-1", currentGame.found.size, currentGame.words.length);
      winnerName.textContent = currentGame.playerName;
      gameTitle.textContent = "You win!";
      gamePanel.hidden = true;
      successPanel.hidden = false;
    }
  }

  selectedCells = [];
  selectionDirection = null;
  paintSelection();
}

function handleCellClick(event) {
  if (isSelecting) {
    finishSelection();
    return;
  }

  startSelection(event);
}

function updateProgress() {
  const foundCount = currentGame.found.size;
  progressDisplay.textContent = `${foundCount} / ${currentGame.words.length} found`;
  progressBar.style.width = `${(foundCount / currentGame.words.length) * 100}%`;
}

function markWordFound(word) {
  currentGame.found.add(word);
  document.querySelector(`[data-word="${word}"]`)?.classList.add("is-found");
  currentGame.placements.get(word).forEach(({ row, column }) => getCell(row, column)?.classList.add("is-found"));
  updateProgress();
}

function startGame(event) {
  event.preventDefault();
  const formData = new FormData(setupForm);
  const playerName = (PlayerSession.getName() || formData.get("playerName")).trim();
  const difficulty = LEVELS[formData.get("difficulty")];
  const words = shuffle(WORDS.filter((word) => word.length <= difficulty.size))
    .slice(0, difficulty.wordCount);
  const { board, placements } = createBoard(difficulty.size, words);
  PlayerSession.begin(playerName, "juego-1");

  currentGame = {
    playerName,
    words,
    size: difficulty.size,
    board,
    placements,
    found: new Set()
  };
  hasStarted = true;
  playerDisplay.textContent = `${playerName} · ${difficulty.label}`;
  setupPanel.hidden = true;
  successPanel.hidden = true;
  gamePanel.hidden = false;
  renderGame();
  updateProgress();
}

window.addEventListener("beforeunload", (event) => {
  if (!hasStarted) return;
  const warning = "Are you sure you want to lose all your progress?";
  event.preventDefault();
  event.returnValue = warning;
  return warning;
});

setupForm.addEventListener("submit", startGame);
continueButton.addEventListener("click", () => {
  PlayerSession.goHome();
});
restorePlayerName();
