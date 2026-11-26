/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

function startGame() {
window.Do\u006eAnalytics?.soloReset();
cl\u0065arCpuAutoTimer();
const au\u0074oCheckbox = document.ge\u0074ElementById("auto-cpu");
if (au\u0074oCheckbox) au\u0074oCpuMode = au\u0074oCheckbox.checked;
pe\u006edingHumanHikiDon = false;
pe\u006edingHumanCounterDon = null;
cu\u0072rentRound = 1;
pa\u0072entIndex = 0;
ro\u0075ndFinished = false;
ga\u006deFinished = false;
players = [
{ name: "あなた", hand: [], isCPU: false, score: ST\u0041RT_SCORE },
{ name: "CPU1", hand: [], isCPU: true, score: ST\u0041RT_SCORE },
{ name: "CPU2", hand: [], isCPU: true, score: ST\u0041RT_SCORE },
{ name: "CPU3", hand: [], isCPU: true, score: ST\u0041RT_SCORE }
];
players.forEach((player, index) => {
if (index > 0) player.pe\u0072sonality = dr\u0061wCpuPersonality();
});
logArea.innerHTML = "";
re\u0073ultArea.te\u0078tContent = "";
ne\u0077RoundButton.classList.add("hidden");
ne\u0077GameButton.classList.remove("hidden");
addLog("新ゲーム開始");
players.slice(1).forEach(player => addLog(player.name + "：" + player.pe\u0072sonality.label));
st\u0061rtRound();
}
function st\u0061rtRound() {
if (typeof so\u006coDonReveal !== "undefined") {
so\u006coDonReveal = null;
document.qu\u0065rySelectorAll(".solo-don-reveal").forEach(el=>el.remove());
}
cl\u0065arCpuAutoTimer();
pe\u006edingHumanHikiDon = false;
pe\u006edingHumanCounterDon = null;
no\u0072malSkipPending = null;
ro\u0075ndFinished = false;
cu\u0072rentRate = BASE_RATE;
deck = cr\u0065ateDeck();
di\u0073cardPile = [];
ta\u0062leHistory = [];
ta\u0062lePlayGroups = [];
shuffle(deck);
players.forEach(player => {
player.hand = deck.splice(0, 5);
sortHand(player.hand);
});
cu\u0072rentCard = deck.pop();
while (is\u0041ctionCard(cu\u0072rentCard)) {
deck.unshift(cu\u0072rentCard);
shuffle(deck);
cu\u0072rentCard = deck.pop();
}
ta\u0062leHistory.push(cu\u0072rentCard);
ta\u0062lePlayGroups.push([cu\u0072rentCard]);
cu\u0072rentSuit = cu\u0072rentCard.suit;
ta\u0062leNumber = cu\u0072rentCard.number;
cu\u0072rentPlayerIndex = pa\u0072entIndex;
direction = 1;
ta\u0062leNumberOwnerIndex = null;
do\u006eNumberActive = true;
se\u006cectedCards = [];
pe\u006edingJCards = null;
re\u0073etDrawState();
updateAll();
addLog(cu\u0072rentRound + "回戦開始");
addLog("親：" + players[pa\u0072entIndex].name);
addLog("最初の場札：" + cardText(cu\u0072rentCard));
addLog("山札残り：" + deck.length + "枚");
ch\u0065ckOpeningDon();
ru\u006eAutoCpuIfNeeded();
}
function cr\u0065ateDeck() {
const newDeck = [];
for (let suit of suits) {
for (let number = 1; number <= 13; number++) {
newDeck.push({ suit, number, type: "normal" });
}
}
newDeck.push({ suit: "Joker", number: 0, type: "joker" });
newDeck.push({ suit: "Joker", number: 0, type: "joker" });
return newDeck;
}
function is\u0041ctionCard(card) {
return (
card.number === 1 ||
card.number === 2 ||
card.number === 7 ||
card.number === 8 ||
card.number === 11 ||
card.type === "joker"
);
}
function is\u004aDeclaredSuitTurn() {
return drawState === DR\u0041W_STATE.NONE && cu\u0072rentCard &&
cu\u0072rentCard.number === 11 && cu\u0072rentCard.type !== "joker";
}
function ca\u006ePlayCard(card) {
if (drawState === DR\u0041W_STATE.NONE) {
if (is\u004aDeclaredSuitTurn()) {
return card.suit === cu\u0072rentSuit || card.number === 11 || card.type === "joker";
}
return cu\u0072rentCard.type === "joker" || card.suit === cu\u0072rentSuit ||
card.number === cu\u0072rentCard.number || card.number === 11 || card.type === "joker";
}
if (drawState === DR\u0041W_STATE.DRAW4) {
return card.number === 1 || card.number === 2 ||
card.number === 8 || card.type === "joker";
}
if (drawState === DR\u0041W_STATE.DRAW2) {
return card.number === dr\u0061wNumber || card.type === "joker" ||
((card.number === 1 || card.number === 7) && card.suit === drawSuit);
}
if (drawState === DR\u0041W_STATE.ASKIP) {
return card.type === "joker" || card.number === 1 ||
(card.number === 7 && card.suit === drawSuit);
}
if (drawState === DR\u0041W_STATE.REVERSE) {
return card.type === "joker" ||
([1, 2, 7, 8].includes(card.number) && card.suit === drawSuit);
}
return false;
}
function ca\u006ePlaySelectedCards(cards) {
if (!cards || !cards.length) return false;
if (!cards.every(card => card.number === cards[0].number)) return false;
if (is\u004aDeclaredSuitTurn() && cards.length > 1 && cards[0].type !== "joker") {
const top = cards[cards.length - 1];
return top.suit === cu\u0072rentSuit;
}
return ca\u006ePlayCard(cards[0]);
}
function pl\u0061ySelectedCards(se\u006cectedSuit) {
const player = players[cu\u0072rentPlayerIndex];
const pl\u0061yedCards = [...se\u006cectedCards];
if (!ca\u006ePlaySelectedCards(pl\u0061yedCards)) {
if (cu\u0072rentPlayerIndex === 0 && typeof sh\u006fwPlayNotice === "function") sh\u006fwPlayNotice("選択したカードの組み合わせは出せません。場札とのつながりを確認してください。");
return;
}
if (cu\u0072rentPlayerIndex === 0) window.Do\u006eAnalytics?.so\u006coAction();
const topCard = pl\u0061yedCards[pl\u0061yedCards.length - 1];
if (cu\u0072rentCard) {
di\u0073cardPile.push(cu\u0072rentCard);
}
pl\u0061yedCards.forEach(card => {
if (card !== topCard) di\u0073cardPile.push(card);
});
cu\u0072rentCard = topCard;
ta\u0062leHistory.push(topCard);
ta\u0062lePlayGroups.push([...pl\u0061yedCards]);
if (ta\u0062lePlayGroups.length > 3) ta\u0062lePlayGroups.shift();
if (ta\u0062leHistory.length > 3) {
ta\u0062leHistory.shift();
}
if (topCard.number === 11) {
cu\u0072rentSuit = se\u006cectedSuit;
} else if (topCard.type === "joker") {
cu\u0072rentSuit = "Joker";
} else {
cu\u0072rentSuit = topCard.suit;
}
ta\u0062leNumber = pl\u0061yedCards.reduce(
(sum, card) => sum + card.number,
0
);
ta\u0062leNumberOwnerIndex = cu\u0072rentPlayerIndex;
do\u006eNumberActive = true;
pl\u0061yedCards.forEach(card => {
const index = player.hand.indexOf(card);
if (index !== -1) {
player.hand.splice(index, 1);
}
});
sortHand(player.hand);
addLog(
player.name +
" は " +
cardsText(pl\u0061yedCards) +
" を出した"
);
if (typeof sh\u006fwCardFlyEffect === "function") {
sh\u006fwCardFlyEffect(pl\u0061yedCards, cu\u0072rentPlayerIndex);
}
if (
player.isCPU &&
typeof sh\u006fwCardPreviewEffect === "function"
) {
}
addLog("場数字：" + ta\u0062leNumber);
addLog("山札残り：" + deck.length + "枚");
ap\u0070lyEffects(pl\u0061yedCards);
se\u006cectedCards = [];
ch\u0065ckDonNotice();
if (re\u0073olveOutOfTurnCpuDon()) return;
if (re\u0073olveNormalSkip()) return;
nextTurn();
}
