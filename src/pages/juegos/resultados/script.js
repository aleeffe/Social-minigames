const labels = {
  "juego-1": "Letter soup",
  "juego-2": "Social notification",
  "juego-3": "Hangman"
};
const playerSummary = document.querySelector("#player-summary");
const resultsList = document.querySelector("#results-list");
const totalSummary = document.querySelector("#total-summary");
const scores = PlayerSession.getScores();

playerSummary.textContent = `${PlayerSession.getName() || "Player"}, here is your result:`;
const results = Object.entries(labels).map(([game, label]) => ({
  game,
  label,
  result: scores[game] || { score: 0, total: 0 }
}));

results.forEach(({ label, result }) => {
  const item = document.createElement("li");
  const labelElement = document.createElement("span");
  const scoreElement = document.createElement("strong");
  labelElement.textContent = label;
  scoreElement.textContent = `${result.score} / ${result.total}`;
  item.append(labelElement, scoreElement);
  resultsList.append(item);
});

const totalScore = results.reduce((sum, item) => sum + item.result.score, 0);
const totalPossible = results.reduce((sum, item) => sum + item.result.total, 0);
totalSummary.textContent = `Total score: ${totalScore} / ${totalPossible}`;

document.querySelector("#play-again-button").addEventListener("click", () => {
  PlayerSession.reset();
});
