/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

const suits = ["♠", "♥", "♦", "♣"];
const ST\u0041RT_SCORE = GA\u004dE_RULES.ST\u0041RT_SCORE;
const BASE_RATE = GA\u004dE_RULES.BASE_RATE;
const MA\u0058_ROUNDS = GA\u004dE_RULES.MA\u0058_ROUNDS;
const DR\u0041W_STATE = {
NONE: "none",
DRAW2: "draw2",
DRAW4: "draw4",
ASKIP: "askip",
REVERSE: "reverse"
};
let cpuLevel = "normal";
let au\u0074oCpuMode = false;
let cp\u0075AutoTimer = null;
let cu\u0072rentRate = BASE_RATE;
let cu\u0072rentRound = 1;
let pa\u0072entIndex = 0;
let ro\u0075ndFinished = false;
let ga\u006deFinished = false;
let deck = [];
let di\u0073cardPile = [];
let players = [];
let cu\u0072rentCard = null;
let cu\u0072rentSuit = null;
let ta\u0062leNumber = 0;
let ta\u0062leHistory = [];
let se\u006cectedCards = [];
let pe\u006edingJCards = null;
let cu\u0072rentPlayerIndex = 0;
let direction = 1;
let no\u0072malSkipPending = null;
let dr\u0061wPenalty = 0;
let drawState = DR\u0041W_STATE.NONE;
let drawSuit = null;
let dr\u0061wNumber = null;
let ta\u0062leNumberOwnerIndex = null;
let do\u006eNumberActive = true;
let pe\u006edingHumanHikiDon = false;
let pe\u006edingHumanCounterDon = null;
const handArea = document.ge\u0074ElementById("hand");
const tableArea = document.ge\u0074ElementById("table-area");
const nu\u006dberArea = document.ge\u0074ElementById("number-area");
const suitArea = document.ge\u0074ElementById("suit-area");
const turnArea = document.ge\u0074ElementById("turn-area");
const logArea = document.ge\u0074ElementById("log");
const scoreArea = document.ge\u0074ElementById("score-area");
const re\u0073ultArea = document.ge\u0074ElementById("result-area");
const dr\u0061wButton = document.ge\u0074ElementById("draw-button");
const pl\u0061yButton = document.ge\u0074ElementById("play-button");
const donButton = document.ge\u0074ElementById("don-button");
const ne\u0078tButton = document.ge\u0074ElementById("next-button");
const ne\u0077RoundButton = document.ge\u0074ElementById("new-round-button");
let ne\u0077GameButton = document.ge\u0074ElementById("new-game-button");
if (!ne\u0077GameButton) {
ne\u0077GameButton = document.cr\u0065ateElement("button");
ne\u0077GameButton.te\u0078tContent = "新しいゲーム開始";
ne\u0077GameButton.id = "new-game-button";
ne\u0077GameButton.classList.add("hidden");
ne\u0077RoundButton.pa\u0072entNode.ap\u0070endChild(ne\u0077GameButton);
}
const cp\u0075LevelSelect = document.ge\u0074ElementById("cpu-level");
const au\u0074oCpuCheckbox = document.ge\u0074ElementById("auto-cpu");
const su\u0069tSelectArea = document.ge\u0074ElementById("suit-select");
const su\u0069tButtons = document.qu\u0065rySelectorAll("#suit-select button");
if (cp\u0075LevelSelect) {
cp\u0075LevelSelect.ad\u0064EventListener("change", () => {
cpuLevel = cp\u0075LevelSelect.value;
if (cpuLevel === "easy") addLog("CPU強さ：弱い");
if (cpuLevel === "normal") addLog("CPU強さ：普通");
if (cpuLevel === "hard") addLog("CPU強さ：強い");
updateAll();
ru\u006eAutoCpuIfNeeded();
});
}
if (au\u0074oCpuCheckbox) {
au\u0074oCpuCheckbox.ad\u0064EventListener("change", () => {
au\u0074oCpuMode = au\u0074oCpuCheckbox.checked;
if (au\u0074oCpuMode) {
addLog("CPU自動進行：ON");
ru\u006eAutoCpuIfNeeded();
} else {
addLog("CPU自動進行：OFF");
cl\u0065arCpuAutoTimer();
}
updateAll();
});
}
function sh\u006fwPlayNotice(message) {
const el = document.ge\u0074ElementById("play-notice");
if (!el) return;
el.te\u0078tContent = message;
el.hidden = false;
cl\u0065arTimeout(sh\u006fwPlayNotice.timer);
sh\u006fwPlayNotice.timer = se\u0074Timeout(() => { el.hidden = true; }, 4200);
}
function co\u006dmitHumanCards(top) {
if (pe\u006edingHumanHikiDon || pe\u006edingHumanCounterDon) return;
const rest = se\u006cectedCards.filter(c => c !== top);
const jMulti = is\u004aDeclaredSuitTurn() && rest.length > 0 && top.suit === cu\u0072rentSuit;
const leadIndex = jMulti ? 0 : rest.findIndex(c => ca\u006ePlayCard(c));
if (leadIndex > 0) rest.unshift(rest.splice(leadIndex, 1)[0]);
if (rest.length && !jMulti && !ca\u006ePlayCard(rest[0])) {
sh\u006fwPlayNotice("この組み合わせでは最初に置けるカードがありません。場札とつながるカードを選んでください。");
return;
}
se\u006cectedCards = [...rest, top];
document.ge\u0074ElementById("top-card-picker").classList.add("hidden");
if (top.number === 11) {
pe\u006edingJCards = [...se\u006cectedCards];
su\u0069tSelectArea.classList.remove("hidden");
} else {
pl\u0061ySelectedCards(null);
}
}
pl\u0061yButton.ad\u0064EventListener("click", () => {
if (ro\u0075ndFinished || ga\u006deFinished || cu\u0072rentPlayerIndex !== 0) return;
if (pe\u006edingHumanCounterDon) {
sh\u006fwPlayNotice("ドン返し！か見送るを選んでください。");
return;
}
if (pe\u006edingHumanHikiDon) {
sh\u006fwPlayNotice("引いたカードを確認して、ドン！か見送るを選んでください。");
return;
}
if (!se\u006cectedCards.length) {
sh\u006fwPlayNotice("出したいカードを選んでください。");
return;
}
if (!se\u006cectedCards.every(c => c.number === se\u006cectedCards[0].number)) {
sh\u006fwPlayNotice("複数枚出しは同じ数字のカードだけ。別の数字を外して選び直してください。");
return;
}
const options = se\u006cectedCards.filter(top => {
const rest = se\u006cectedCards.filter(c => c !== top);
if (!rest.length) return ca\u006ePlayCard(top);
if (is\u004aDeclaredSuitTurn() && top.suit === cu\u0072rentSuit) {
return ca\u006ePlaySelectedCards([...rest, top]);
}
const lead = rest.find(c => ca\u006ePlayCard(c));
return !!lead && ca\u006ePlaySelectedCards([lead, ...rest.filter(c => c !== lead), top]);
});
if (!options.length) {
sh\u006fwPlayNotice("この組み合わせは出せません。場札と同じマーク・数字の札、または役札の効果を確認してください。");
return;
}
if (options.length === 1) return co\u006dmitHumanCards(options[0]);
const picker = document.ge\u0074ElementById("top-card-picker");
const buttons = document.ge\u0074ElementById("top-card-options");
buttons.re\u0070laceChildren();
options.forEach(card => {
const btn = document.cr\u0065ateElement("button");
btn.type = "button";
btn.te\u0078tContent = cardText(card) + " を一番上にする";
btn.ad\u0064EventListener("click", () => co\u006dmitHumanCards(card));
buttons.ap\u0070endChild(btn);
});
picker.classList.remove("hidden");
});
su\u0069tButtons.forEach(button => {
button.ad\u0064EventListener("click", () => {
const se\u006cectedSuit = button.dataset.suit;
su\u0069tSelectArea.classList.add("hidden");
se\u006cectedCards = [...pe\u006edingJCards];
pe\u006edingJCards = null;
pl\u0061ySelectedCards(se\u006cectedSuit);
});
});
dr\u0061wButton.ad\u0064EventListener("click", () => {
if (ro\u0075ndFinished || ga\u006deFinished) return;
if (pe\u006edingHumanCounterDon) return;
if (cu\u0072rentPlayerIndex !== 0) return;
if (pe\u006edingHumanHikiDon) {
sh\u006fwPlayNotice("引きドンの選択中です。ドン！か見送るを押してください。");
return;
}
ex\u0065cuteDraw(players[0]);
});
donButton.ad\u0064EventListener("click", () => {
if (ro\u0075ndFinished || ga\u006deFinished) return;
if (pe\u006edingHumanCounterDon) {
de\u0063ideHumanCounterDon(true);
return;
}
if (pe\u006edingHumanHikiDon) {
if (ch\u0065ckHikiDon(0)) {
pe\u006edingHumanHikiDon = false;
return;
}
sh\u006fwPlayNotice("引きドンの条件を確認できませんでした。");
return;
}
tryDon(0);
});
ne\u0078tButton.ad\u0064EventListener("click", () => {
if (ro\u0075ndFinished || ga\u006deFinished) return;
if (pe\u006edingHumanCounterDon) {
de\u0063ideHumanCounterDon(false);
return;
}
if (cu\u0072rentPlayerIndex === 0 && pe\u006edingHumanHikiDon) {
pe\u006edingHumanHikiDon = false;
addLog("あなたは引きドンを見送った");
nextTurn();
return;
}
if (cu\u0072rentPlayerIndex === 0) return;
cpuAction();
});
ne\u0077RoundButton.ad\u0064EventListener("click", () => {
cu\u0072rentRound++;
pa\u0072entIndex = (pa\u0072entIndex + 1) % players.length;
ro\u0075ndFinished = false;
re\u0073ultArea.te\u0078tContent = "";
ne\u0077RoundButton.classList.add("hidden");
st\u0061rtRound();
});
ne\u0077GameButton.ad\u0064EventListener("click", () => {
if (!ro\u0075ndFinished && !ga\u006deFinished && !window.confirm("現在の対戦を終了して、新しいゲームを開始しますか？\n得点とラウンドは初期化されます。")) return;
startGame();
});
document.ge\u0074ElementById("top-card-cancel").ad\u0064EventListener("click", () => {
document.ge\u0074ElementById("top-card-picker").classList.add("hidden");
});
