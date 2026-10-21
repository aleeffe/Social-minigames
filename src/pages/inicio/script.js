const completedGameDialog = document.querySelector("#completed-game-dialog");
const resultsLink = document.querySelector("#results-link");

document.querySelectorAll("[data-game]").forEach((gameButton) => {
  const game = gameButton.dataset.game;
  if (!PlayerSession.isComplete(game)) return;

  gameButton.classList.add("is-completed");
  gameButton.addEventListener("click", (event) => {
    event.preventDefault();
    completedGameDialog.showModal();
  });
});

if (PlayerSession.isSessionComplete()) {
  resultsLink.hidden = false;
}

document.querySelector("#restart-progress-button").addEventListener("click", () => {
  PlayerSession.reset();
});

document.querySelector("#continue-button").addEventListener("click", () => {
  completedGameDialog.close();
});
