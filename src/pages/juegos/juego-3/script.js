const words = [
  { word: "HASHTAG", type: "noun", description: "A word or phrase preceded by # that groups posts by topic." },
  { word: "FOLLOWER", type: "noun", description: "A person who subscribes to see another account's posts." },
  { word: "INFLUENCER", type: "noun", description: "A person who affects an audience's opinions online." },
  { word: "PROFILE", type: "noun", description: "A page that presents a user's information and posts." },
  { word: "COMMENT", type: "noun", description: "A written response that someone leaves under a post." },
  { word: "SHARE", type: "verb", description: "To send or publish someone else's content to an audience." },
  { word: "LIKE", type: "verb", description: "To show approval of a post with a quick reaction." },
  { word: "POST", type: "verb", description: "To publish a message, photo, or video online." },
  { word: "STREAM", type: "verb", description: "To watch or broadcast media continuously over the internet." },
  { word: "UPLOAD", type: "verb", description: "To transfer a file from a device to the internet." },
  { word: "VIRAL", type: "adjective", description: "Spreading very quickly among many internet users." },
  { word: "SOCIAL", type: "adjective", description: "Relating to interaction and communication with other people." },
  { word: "DIRECT", type: "adjective", description: "A private message sent straight to another account." },
  { word: "TRENDING", type: "adjective", description: "Currently popular and discussed by many users." },
  { word: "PRIVACY", type: "noun", description: "The control a person has over their personal information." },
  { word: "NETWORK", type: "noun", description: "A connected group of people or accounts." },
  { word: "CAPTION", type: "noun", description: "Text added to explain or accompany a photo or video." },
  { word: "MENTION", type: "verb", description: "To refer to another account by using its username." },
  { word: "EMOJI", type: "noun", description: "A small digital image used to express an idea or feeling." },
  { word: "ALGORITHM", type: "noun", description: "A set of rules that selects and orders what users see." }
];

const setupPanel = document.querySelector("#setup-panel");
const playerNameField = document.querySelector("#player-name-field");
const playerNameInput = document.querySelector("#player-name");
const gamePanel = document.querySelector("#game-panel");
const guessForm = document.querySelector("#guess-form");
const letterInput = document.querySelector("#letter-input");
const hangmanImage = document.querySelector("#hangman-image");
const description = document.querySelector("#description");
const descriptionText = document.querySelector("#description-text");
const typeText = document.querySelector("#type-text");
const wordDisplay = document.querySelector("#word-display");
const progressDisplay = document.querySelector("#progress-display");
const mistakesDisplay = document.querySelector("#mistakes-display");
const usedLettersDisplay = document.querySelector("#used-letters");
const feedback = document.querySelector("#feedback");
const resultsDialog = document.querySelector("#results-dialog");
const resultsTitle = document.querySelector("#results-title");
const resultsSummary = document.querySelector("#results-summary");
const resultsErrors = document.querySelector("#results-errors");

let selectedWords = [];
let currentWordIndex = 0;
let guessedLetters = new Set();
let mistakes = 0;
let totalMistakes = 0;
let completedWords = 0;
let resolvingWord = false;

function startGame(wordCount) {
  const playerName = PlayerSession.getName() || playerNameInput.value.trim();
  if (!playerName) {
    playerNameInput.focus();
    return;
  }
  PlayerSession.begin(playerName, "juego-3");
  selectedWords = [...words].sort(() => Math.random() - 0.5).slice(0, wordCount);
  currentWordIndex = 0;
  totalMistakes = 0;
  completedWords = 0;
  setupPanel.hidden = true;
  gamePanel.hidden = false;
  loadWord();
}

function loadWord() {
  guessedLetters = new Set();
  mistakes = 0;
  resolvingWord = false;
  const currentWord = selectedWords[currentWordIndex];
  descriptionText.textContent = currentWord.description;
  typeText.textContent = `Type: ${currentWord.type}`;
  feedback.textContent = "";
  letterInput.value = "";
  progressDisplay.textContent = `Word ${currentWordIndex + 1} of ${selectedWords.length}`;
  updateDisplay();
  letterInput.focus();
}

function updateDisplay() {
  const currentWord = selectedWords[currentWordIndex].word;
  wordDisplay.textContent = currentWord
    .split("")
    .map((letter) => guessedLetters.has(letter) ? letter : "_")
    .join(" ");
  usedLettersDisplay.textContent = guessedLetters.size
    ? [...guessedLetters].join(", ")
    : "None";
  mistakesDisplay.textContent = `Mistakes: ${mistakes} / 6`;
  hangmanImage.src = `../../../assets/images/juegos/juego-3/${Math.min(mistakes + 1, 7)}.jpg`;
  hangmanImage.alt = `Hangman drawing, mistake ${mistakes} of 6`;
}

function isWordComplete() {
  return selectedWords[currentWordIndex].word
    .split("")
    .every((letter) => guessedLetters.has(letter));
}

function finishWord() {
  resolvingWord = true;
  if (currentWordIndex === selectedWords.length - 1) {
    finishGame();
    return;
  }

  currentWordIndex += 1;
  window.setTimeout(loadWord, 500);
}

function finishGame() {
  PlayerSession.complete("juego-3", completedWords, selectedWords.length);
  gamePanel.hidden = true;
  resultsTitle.textContent = completedWords === selectedWords.length
    ? "You win!"
    : "Game over";
  resultsSummary.textContent = `You guessed ${completedWords} of ${selectedWords.length} words.`;
  resultsErrors.textContent = `Total errors: ${totalMistakes}.`;
  resultsDialog.showModal();
}

function resetToSetup() {
  resultsDialog.close();
  gamePanel.hidden = true;
  setupPanel.hidden = false;
}

document.querySelectorAll("[data-word-count]").forEach((button) => {
  button.addEventListener("click", () => startGame(Number(button.dataset.wordCount)));
});

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (resolvingWord) return;

  const letter = letterInput.value.trim().toUpperCase();
  letterInput.value = "";

  if (!/^[A-Z]$/.test(letter)) {
    feedback.textContent = "Please enter one letter from A to Z.";
    letterInput.focus();
    return;
  }

  if (guessedLetters.has(letter)) {
    feedback.textContent = "You already tried that letter.";
    letterInput.focus();
    return;
  }

  guessedLetters.add(letter);
  if (selectedWords[currentWordIndex].word.includes(letter)) {
    feedback.textContent = "Correct!";
    updateDisplay();
    if (isWordComplete()) {
      completedWords += 1;
      finishWord();
    }
  } else {
    mistakes += 1;
    totalMistakes += 1;
    feedback.textContent = "That letter is not in the word.";
    updateDisplay();
    if (mistakes === 6) {
      feedback.textContent = `Game over for this word. The answer was ${selectedWords[currentWordIndex].word}.`;
      window.setTimeout(finishWord, 900);
    }
  }
  letterInput.focus();
});

document.querySelector("#restart-button").addEventListener("click", resetToSetup);
document.querySelector("#continue-button").addEventListener("click", () => {
  PlayerSession.goHome();
});

const savedPlayerName = PlayerSession.getName();
playerNameInput.value = savedPlayerName;
playerNameField.hidden = Boolean(savedPlayerName);
