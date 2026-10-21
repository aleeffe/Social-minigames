const platforms = [
  { name: "Facebook", logo: "fb_logo.png", easy: "📘👍👥🌐", medium: "Connect with family and friends, share personal updates, join interest-based circles, and send playful gestures.", hard: "Founded by a Harvard student in 2004. It began with a university-only audience before opening to everyone." },
  { name: "Instagram", logo: "ig_logo.png", easy: "📸❤️🎞️📱", medium: "Polished photo layouts, quick reactions, temporary posts, creative effects, and brief portrait clips.", hard: "Originally called Burbn. It was bought for $1 billion in 2012, and its most-liked picture was once a brown egg." },
  { name: "Twitter (X)", logo: "x_logo.png", easy: "🐦💬🔄📉", medium: "Brief text updates, popular conversations, searchable topics, and passing along other people's thoughts.", hard: "Launched in 2006. Its first post was “just setting up my twttr” and it later adopted a single-letter identity in 2023." },
  { name: "TikTok", logo: "tik-tok-logo-transparent-031f.png", easy: "📱🎵🕺🔥", medium: "A continuous stream of brief clips, dance trends, lip-syncing, popular sounds, and a personalized discovery feed.", hard: "Developed by a Chinese technology company, it merged with Musical.ly in the US and was the world's most downloaded app in 2020." },
  { name: "LinkedIn", logo: "linkedin_logo.png", easy: "💼🤝📄🏢", medium: "Career-focused connections, work histories, finding new opportunities, skill endorsements, and keeping up with colleagues.", hard: "Launched in 2003, making it older than Facebook. A major technology company bought it in 2016 for over $26 billion." },
  { name: "Snapchat", logo: "snap_logo.png", easy: "👻📸🔥💛", medium: "Messages that vanish, daily exchanges with friends, playful camera effects, and a live map of your contacts.", hard: "Created by Stanford students in 2011 and originally named Picaboo. Its founders refused a $3 billion acquisition offer." },
  { name: "Pinterest", logo: "pinterest_logo.png", easy: "📌💡🖼️🎨", medium: "A visual idea finder, collecting inspiration into personal collections, with crafts, recipes, and home decor.", hard: "Founded in 2010. Its users have an official nickname, and most of its global audience has historically been women." },
  { name: "YouTube", logo: "youtube_logo.png", easy: "📺▶️🔴🎬", medium: "A place for watching and sharing clips, following creators, earning from content, and receiving milestone awards.", hard: "Created by three former PayPal employees in 2005. The first upload was “Me at the zoo”; a major search company bought it 18 months later." },
  { name: "Reddit", logo: "reddit_logo.png", easy: "👽⬆️⬇️💬", medium: "A huge collection of public discussions, community voting, question-and-answer events, and reputation points.", hard: "Founded in 2005. Its alien mascot has a name, and its communities are organized into topic-specific spaces." },
  { name: "WhatsApp", logo: "whatsapp_logo.png", easy: "💬📞🟢📱", medium: "Private conversations, recorded voice messages, announcements to many contacts, and protected exchanges.", hard: "Founded by two former Yahoo employees. A larger technology company acquired it in 2014 for $19 billion." },
  { name: "Discord", logo: "discord_logo.png", easy: "🎮🎧👾💬", medium: "Talk in audio rooms, build private communities, share screens, add custom helpers, and spend time with online groups.", hard: "Launched in 2015 for people playing together online. Its blue-purple logo character is named Clyde." },
  { name: "Twitch", logo: "twitch-purple-logo-6f25.png", easy: "🟪🎮🔴🖥️", medium: "Watch creators in real time, follow competitive events, use custom reactions, support channels, and join casual conversations.", hard: "Started as a small section of Justin.tv in 2007. Amazon bought it in 2014 for nearly $1 billion." },
  { name: "Telegram", logo: "telegram_icon.png", easy: "✈️💬🔒☁️", medium: "Fast conversations stored across devices, very large groups, private chats that disappear, and user-made helpers.", hard: "Founded by the Durov brothers in 2013, it is known for emphasizing speed and resistance to censorship." },
  { name: "Threads", logo: "Threads_logo.png", easy: "🧵💬📱🔗", medium: "Public text conversations, quick replies, a connected account experience, and everyday discussion.", hard: "Launched by a large technology company in July 2023 and reached 100 million users in just five days." },
  { name: "Spotify", logo: "spotify_icon.png", easy: "🎧🎶🟢📻", medium: "On-demand audio, shared listening collections, spoken shows, and a personalized year-end summary.", hard: "Founded in Sweden in 2006. Its friend activity and collection sharing make it highly social." }
];

const setupPanel = document.querySelector("#setup-panel");
const playerNameField = document.querySelector("#player-name-field");
const playerNameInput = document.querySelector("#player-name");
const gamePanel = document.querySelector("#game-panel");
const resultsPanel = document.querySelector("#results-panel");
const modeDisplay = document.querySelector("#mode-display");
const progressDisplay = document.querySelector("#progress-display");
const livesDisplay = document.querySelector("#lives-display");
const clueLogo = document.querySelector("#clue-logo");
const clue = document.querySelector("#clue");
const feedback = document.querySelector("#feedback");
const answerOptions = document.querySelector("#answer-options");
const resultsTitle = document.querySelector("#results-title");
const resultsSummary = document.querySelector("#results-summary");

let mode = "";
let questions = [];
let questionIndex = 0;
let lives = 4;
let score = 0;
let locked = false;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startGame(selectedMode) {
  const playerName = PlayerSession.getName() || playerNameInput.value.trim();
  if (!playerName) {
    playerNameInput.focus();
    return;
  }
  PlayerSession.begin(playerName, "juego-2");
  mode = selectedMode;
  questions = shuffle(platforms);
  questionIndex = 0;
  lives = 4;
  score = 0;
  setupPanel.hidden = true;
  resultsPanel.hidden = true;
  gamePanel.hidden = false;
  loadQuestion();
}

function loadQuestion() {
  locked = false;
  const platform = questions[questionIndex];
  const choices = shuffle([platform, ...shuffle(platforms.filter((item) => item !== platform)).slice(0, 2)]);
  modeDisplay.textContent = mode[0].toUpperCase() + mode.slice(1);
  progressDisplay.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
  livesDisplay.textContent = `${"♥ ".repeat(lives).trim()}${lives ? "" : "—"}`;
  clueLogo.src = "../../../assets/images/juegos/juego-2/default.jpg";
  clueLogo.alt = "Default notification image";
  clue.textContent = platform[mode];
  feedback.textContent = "";
  answerOptions.innerHTML = "";
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.innerHTML = `<img src="../../../assets/images/juegos/juego-2/${choice.logo}" alt=""> <span>${choice.name}</span>`;
    button.addEventListener("click", () => chooseAnswer(choice, platform, button));
    answerOptions.append(button);
  });
}

function chooseAnswer(choice, correct, selectedButton) {
  if (locked) return;
  if (choice === correct) {
    score += 1;
    selectedButton.classList.add("is-correct");
    clueLogo.src = `../../../assets/images/juegos/juego-2/${correct.logo}`;
    clueLogo.alt = `${correct.name} logo`;
    feedback.textContent = "";
    locked = true;
    window.setTimeout(nextQuestion, 650);
    return;
  }

  lives -= 1;
  selectedButton.classList.add("is-wrong");
  livesDisplay.textContent = `${"♥ ".repeat(lives).trim()}${lives ? "" : "—"}`;
  feedback.textContent = lives ? "Not Correct, try again!" : `Not Correct, try again! The answer was ${correct.name}.`;
  if (!lives) {
    locked = true;
    window.setTimeout(finishGame, 900);
  }
}

function nextQuestion() {
  questionIndex += 1;
  if (questionIndex === questions.length) finishGame();
  else loadQuestion();
}

function finishGame() {
  PlayerSession.complete("juego-2", score, questions.length);
  gamePanel.hidden = true;
  resultsPanel.hidden = false;
  resultsTitle.textContent = lives ? "Great job!" : "Game over";
  resultsSummary.textContent = `You identified ${score} of ${questions.length} platforms and finished with ${lives} ${lives === 1 ? "life" : "lives"} left.`;
}

function resetToSetup() {
  gamePanel.hidden = true;
  resultsPanel.hidden = true;
  setupPanel.hidden = false;
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.mode));
});
document.querySelector("#restart-button").addEventListener("click", resetToSetup);
document.querySelector("#continue-button").addEventListener("click", () => {
  PlayerSession.goHome();
});

const savedPlayerName = PlayerSession.getName();
playerNameInput.value = savedPlayerName;
playerNameField.hidden = Boolean(savedPlayerName);
