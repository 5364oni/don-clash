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

let normalSkipPending = null;
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

// 選択順に左右されず、合法な先頭カードを探す。最後に置く札は本人が選ぶ。
function showPlayNotice(message) {
  const el = document.getElementById("play-notice");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(showPlayNotice.timer);
  showPlayNotice.timer = setTimeout(() => { el.hidden = true; }, 4200);
}
function commitHumanCards(top) {
  const rest = selectedCards.filter(c => c !== top);
  // 先頭を合法なカードにする（場札の条件に合わせる）
  const jMulti = isJDeclaredSuitTurn() && rest.length > 0 && top.suit === currentSuit;
  const leadIndex = jMulti ? 0 : rest.findIndex(c => canPlayCard(c));
  if (leadIndex > 0) rest.unshift(rest.splice(leadIndex, 1)[0]);
  // 先頭候補がtopだけの場合、複数枚の先頭にもtopを置けないため案内
  if (rest.length && !jMulti && !canPlayCard(rest[0])) {
    showPlayNotice("この組み合わせでは最初に置けるカードがありません。場札とつながるカードを選んでください。");
    return;
  }
  selectedCards = [...rest, top];
  document.getElementById("top-card-picker").classList.add("hidden");
  if (top.number === 11) {
    pendingJCards = [...selectedCards];
    suitSelectArea.classList.remove("hidden");
  } else {
    playSelectedCards(null);
  }
}
playButton.addEventListener("click", () => {
  if (roundFinished || gameFinished || currentPlayerIndex !== 0) return;
  if (!selectedCards.length) {
    showPlayNotice("出したいカードを選んでください。");
    return;
  }
  if (!selectedCards.every(c => c.number === selectedCards[0].number)) {
    showPlayNotice("複数枚出しは同じ数字のカードだけ。別の数字を外して選び直してください。");
    return;
  }
  const options = selectedCards.filter(top => {
    const rest = selectedCards.filter(c => c !== top);
    if (!rest.length) return canPlayCard(top);
    if (isJDeclaredSuitTurn() && top.suit === currentSuit) {
      return canPlaySelectedCards([...rest, top]);
    }
    const lead = rest.find(c => canPlayCard(c));
    return !!lead && canPlaySelectedCards([lead, ...rest.filter(c => c !== lead), top]);
  });
  if (!options.length) {
    showPlayNotice("この組み合わせは出せません。場札と同じマーク・数字の札、または役札の効果を確認してください。");
    return;
  }
  if (options.length === 1) return commitHumanCards(options[0]);
  const picker = document.getElementById("top-card-picker");
  const buttons = document.getElementById("top-card-options");
  buttons.replaceChildren();
  options.forEach(card => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cardText(card) + " を一番上にする";
    btn.addEventListener("click", () => commitHumanCards(card));
    buttons.appendChild(btn);
  });
  picker.classList.remove("hidden");
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
  if (!roundFinished && !gameFinished && !window.confirm("現在の対戦を終了して、新しいゲームを開始しますか？\n得点とラウンドは初期化されます。")) return;
  startGame();
});


// 最後に置くカードの選択を取り消す
document.getElementById("top-card-cancel").addEventListener("click", () => {
  document.getElementById("top-card-picker").classList.add("hidden");
});
