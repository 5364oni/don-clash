const suits = ["♠", "♥", "♦", "♣"];

const START_SCORE = GAME_RULES.START_SCORE;
const BASE_RATE = GAME_RULES.BASE_RATE;
const MAX_ROUNDS = GAME_RULES.MAX_ROUNDS;

const DRAW_STATE = {
  NONE: "none",
  DRAW2: "draw2",
  DRAW4: "draw4",
  ASKIP: "askip",
  REVERSE: "reverse"
};

let cpuLevel = "normal";
let autoCpuMode = false;
let cpuAutoTimer = null;

let currentRate = BASE_RATE;
let currentRound = 1;
let parentIndex = 0;
let roundFinished = false;
let gameFinished = false;

let deck = [];
let discardPile = [];
let players = [];

let currentCard = null;
let currentSuit = null;
let tableNumber = 0;
let tableHistory = [];

let selectedCards = [];
let pendingJCards = null;

let currentPlayerIndex = 0;
let direction = 1;

let drawPenalty = 0;
let drawState = DRAW_STATE.NONE;
let drawSuit = null;
let drawNumber = null;

let tableNumberOwnerIndex = null;
let donNumberActive = true;

const handArea = document.getElementById("hand");
const tableArea = document.getElementById("table-area");
const numberArea = document.getElementById("number-area");
const suitArea = document.getElementById("suit-area");
const turnArea = document.getElementById("turn-area");
const logArea = document.getElementById("log");
const scoreArea = document.getElementById("score-area");
const resultArea = document.getElementById("result-area");

const drawButton = document.getElementById("draw-button");
const playButton = document.getElementById("play-button");
const donButton = document.getElementById("don-button");
const nextButton = document.getElementById("next-button");
const newRoundButton = document.getElementById("new-round-button");

let newGameButton = document.getElementById("new-game-button");

if (!newGameButton) {
  newGameButton = document.createElement("button");
  newGameButton.textContent = "新しいゲーム開始";
  newGameButton.id = "new-game-button";
  newGameButton.classList.add("hidden");
  newRoundButton.parentNode.appendChild(newGameButton);
}

const cpuLevelSelect = document.getElementById("cpu-level");
const autoCpuCheckbox = document.getElementById("auto-cpu");

const suitSelectArea = document.getElementById("suit-select");
const suitButtons = document.querySelectorAll("#suit-select button");

startGame();

if (cpuLevelSelect) {
  cpuLevelSelect.addEventListener("change", () => {
    cpuLevel = cpuLevelSelect.value;

    if (cpuLevel === "easy") addLog("CPU強さ：弱い");
    if (cpuLevel === "normal") addLog("CPU強さ：普通");
    if (cpuLevel === "hard") addLog("CPU強さ：強い");

    updateAll();
    runAutoCpuIfNeeded();
  });
}

if (autoCpuCheckbox) {
  autoCpuCheckbox.addEventListener("change", () => {
    autoCpuMode = autoCpuCheckbox.checked;

    if (autoCpuMode) {
      addLog("CPU自動進行：ON");
      runAutoCpuIfNeeded();
    } else {
      addLog("CPU自動進行：OFF");
      clearCpuAutoTimer();
    }

    updateAll();
  });
}

playButton.addEventListener("click", () => {
  if (roundFinished || gameFinished) return;
  if (currentPlayerIndex !== 0) return;
  if (selectedCards.length === 0) return;

  const firstCard = selectedCards[0];

  if (!selectedCards.every(card => card.number === firstCard.number)) {
    alert("同じ数字しか出せません");
    return;
  }

  if (!canPlaySelectedCards(selectedCards)) {
    alert("出せません");
    return;
  }

  const topCard = selectedCards[selectedCards.length - 1];

  if (topCard.number === 11) {
    pendingJCards = [...selectedCards];
    suitSelectArea.classList.remove("hidden");
    return;
  }

  playSelectedCards(null);
});

suitButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedSuit = button.dataset.suit;

    suitSelectArea.classList.add("hidden");

    selectedCards = [...pendingJCards];
    pendingJCards = null;

    playSelectedCards(selectedSuit);
  });
});

drawButton.addEventListener("click", () => {
  if (roundFinished || gameFinished) return;
  if (currentPlayerIndex !== 0) return;

  executeDraw(players[0]);
});

donButton.addEventListener("click", () => {
  if (roundFinished || gameFinished) return;

  tryDon(0);
});

nextButton.addEventListener("click", () => {
  if (roundFinished || gameFinished) return;
  if (currentPlayerIndex === 0) return;

  cpuAction();
});

newRoundButton.addEventListener("click", () => {
  currentRound++;
  parentIndex = (parentIndex + 1) % players.length;

  roundFinished = false;
  resultArea.textContent = "";
  newRoundButton.classList.add("hidden");

  startRound();
});

newGameButton.addEventListener("click", () => {
  startGame();
});

