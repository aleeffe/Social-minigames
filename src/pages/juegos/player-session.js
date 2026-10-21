(function () {
  const STORAGE_KEY = "socialGamesSession";
  const GAME_ORDER = ["juego-1", "juego-2", "juego-3"];

  function read() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      console.error("Unable to read the player session.", error);
      return {};
    }
  }

  function write(session) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Unable to save the player session.", error);
      throw error;
    }
  }

  function getSession() {
    const session = read();
    return {
      name: typeof session.name === "string" ? session.name : "",
      scores: session.scores && typeof session.scores === "object" ? session.scores : {},
      order: Array.isArray(session.order) ? session.order : GAME_ORDER
    };
  }

  function getCurrentGame() {
    return window.location.pathname.match(/juego-[123]/)?.[0] || "";
  }

  function begin(name, game) {
    const session = getSession();
    if (!session.name) {
      const startIndex = GAME_ORDER.indexOf(game);
      session.order = [...GAME_ORDER.slice(startIndex), ...GAME_ORDER.slice(0, startIndex)];
    }
    session.name = name.trim();
    write(session);
  }

  function getName() {
    return getSession().name;
  }

  function getScores() {
    return getSession().scores;
  }

  function complete(game, score, total) {
    const session = getSession();
    session.scores[game] = { score, total };
    write(session);
  }

  function goHome() {
    window.location.href = "../../inicio/index.html";
  }

  function isComplete(game) {
    return Boolean(getSession().scores[game]);
  }

  function isSessionComplete() {
    const session = getSession();
    return GAME_ORDER.every((game) => session.scores[game]);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = window.location.pathname.includes("/juegos/")
      ? "../../inicio/index.html"
      : "index.html";
  }

  window.PlayerSession = {
    begin,
    complete,
    getCurrentGame,
    getName,
    getScores,
    goHome,
    isComplete,
    isSessionComplete,
    reset
  };
}());
