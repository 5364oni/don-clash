/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

function ap\u0070lyEffects(cards) {
const first = cards[0];
const top = cards[cards.length - 1];
if (first.type === "joker") {
if (typeof sh\u006fwJokerEffect === "function") {
sh\u006fwJokerEffect();
}
dr\u0061wPenalty += cards.length * 4;
drawState = DR\u0041W_STATE.DRAW4;
drawSuit = null;
dr\u0061wNumber = 0;
addLog(
"Joker ドロー4 累積：" +
dr\u0061wPenalty +
"枚"
);
return;
}
if (first.number === 1) {
if (typeof sh\u006fwSkipEffect === "function") {
sh\u006fwSkipEffect();
}
if (dr\u0061wPenalty > 0) {
ap\u0070lySkipEffect(cards.length);
}
if (dr\u0061wPenalty > 0) {
drawState = DR\u0041W_STATE.ASKIP;
drawSuit = top.suit;
dr\u0061wNumber = 1;
addLog(
"Aスキップ返し：" +
cards.length +
"枚"
);
return;
}
re\u0073etDrawState();
no\u0072malSkipPending = { suit: top.suit, count: cards.length };
addLog(
"Aスキップ：" +
cards.length +
"枚"
);
return;
}
if (first.number === 7) {
if (typeof sh\u006fwReverseEffect === "function") {
sh\u006fwReverseEffect();
}
for (let i = 0; i < cards.length; i++) {
direction *= -1;
}
if (dr\u0061wPenalty > 0) {
drawState = DR\u0041W_STATE.REVERSE;
drawSuit = top.suit;
dr\u0061wNumber = 7;
}
addLog(
"7リバース：" +
cards.length +
"枚"
);
return;
}
if (
first.number === 2 ||
first.number === 8
) {
if (typeof sh\u006fwDraw2Effect === "function") {
sh\u006fwDraw2Effect();
}
dr\u0061wPenalty += cards.length * 2;
drawState = DR\u0041W_STATE.DRAW2;
drawSuit = top.suit;
dr\u0061wNumber = first.number;
addLog(
nu\u006dberText(first.number) +
" ドロー2 累積：" +
dr\u0061wPenalty +
"枚"
);
return;
}
if (first.number === 11) {
if (
typeof sh\u006fwMarkChangeEffect ===
"function"
) {
sh\u006fwMarkChangeEffect(cu\u0072rentSuit);
}
addLog(
"J マーク指定：" +
cu\u0072rentSuit
);
return;
}
if (dr\u0061wPenalty === 0) {
re\u0073etDrawState();
}
}
function ap\u0070lySkipEffect(cardCount) {
const ad\u0076anceBeforeNextTurn =
cardCount * 2 - 1;
for (
let i = 0;
i < ad\u0076anceBeforeNextTurn;
i++
) {
ad\u0076anceTurn();
}
}
function ex\u0065cuteDraw(player) {
if (!player.isCPU) window.Do\u006eAnalytics?.so\u006coAction();
const count =
dr\u0061wPenalty > 0
? dr\u0061wPenalty
: 1;
an\u0069mateDeckDraw(cu\u0072rentPlayerIndex);
for (let i = 0; i < count; i++) {
if (!drawCard(player)) {
fi\u006eishDrawRound();
return;
}
}
sortHand(player.hand);
addLog(
player.name +
" は" +
count +
"枚引いた"
);
addLog(
"山札残り：" +
deck.length +
"枚"
);
if (drawState !== DR\u0041W_STATE.NONE) {
re\u0073etDrawState();
addLog("ドロー状態解除");
}
if (cu\u0072rentPlayerIndex === 0 && ca\u006ePlayerDon(0)) {
pe\u006edingHumanHikiDon = true;
se\u006cectedCards = [];
updateAll();
addLog("引きドンのチャンス！ ドン！で宣言、見送るで次の手番へ");
if (typeof sh\u006fwPlayNotice === "function") {
sh\u006fwPlayNotice("引きドンのチャンス！ ドン！を押すか、見送るを選んでください。");
}
return;
}
if (cu\u0072rentPlayerIndex !== 0 && ch\u0065ckHikiDon(cu\u0072rentPlayerIndex)) return;
nextTurn();
}
function drawCard(player) {
if (deck.length === 0) {
if (di\u0073cardPile.length === 0) return false;
deck = [...di\u0073cardPile];
di\u0073cardPile = [];
shuffle(deck);
const pr\u0065viousRate = cu\u0072rentRate;
cu\u0072rentRate *= 2;
if (typeof sh\u006fwDeckReshuffleEffect === "function") {
sh\u006fwDeckReshuffleEffect(pr\u0065viousRate, cu\u0072rentRate);
}
addLog("山札を作り直しました");
addLog(
"レートアップ！ 現在 " +
cu\u0072rentRate +
"点"
);
}
if (deck.length === 0) return false;
player.hand.push(deck.pop());
sortHand(player.hand);
return true;
}
function an\u0069mateDeckDraw(pl\u0061yerIndex) {
const deckCard =
document.ge\u0074ElementById("deck-card");
if (!deckCard) return;
deckCard.classList.remove("deck-bounce");
void deckCard.of\u0066setWidth;
deckCard.classList.add("deck-bounce");
const fromRect =
deckCard.ge\u0074BoundingClientRect();
let ta\u0072getElement = handArea;
if (pl\u0061yerIndex === 1) {
ta\u0072getElement =
document.ge\u0074ElementById("cpu1-cards");
}
if (pl\u0061yerIndex === 2) {
ta\u0072getElement =
document.ge\u0074ElementById("cpu2-cards");
}
if (pl\u0061yerIndex === 3) {
ta\u0072getElement =
document.ge\u0074ElementById("cpu3-cards");
}
if (!ta\u0072getElement) return;
const toRect =
ta\u0072getElement.ge\u0074BoundingClientRect();
const flyCard = document.cr\u0065ateElement("div");
flyCard.className = "draw-fly-card";
flyCard.style.position = "fixed";
flyCard.style.left = fromRect.left + "px";
flyCard.style.top = fromRect.top + "px";
flyCard.style.width = fromRect.width + "px";
flyCard.style.height = fromRect.height + "px";
flyCard.style.boxSizing = "border-box";
flyCard.style.zIndex = "99999";
flyCard.style.po\u0069nterEvents = "none";
flyCard.style.tr\u0061nsition =
"left .65s ease-out, top .65s ease-out, transform .65s ease-out, opacity .65s ease-out";
document.body.ap\u0070endChild(flyCard);
re\u0071uestAnimationFrame(() => {
flyCard.style.left =
toRect.left +
toRect.width / 2 -
fromRect.width / 2 +
"px";
flyCard.style.top =
toRect.top +
toRect.height / 2 -
fromRect.height / 2 +
"px";
flyCard.style.transform =
"scale(.55) rotate(12deg)";
flyCard.style.opacity = "0";
});
se\u0074Timeout(() => {
flyCard.remove();
}, 700);
}
function nextTurn() {
if (pe\u006edingHumanCounterDon) return;
ad\u0076anceTurn();
updateAll();
ru\u006eAutoCpuIfNeeded();
}
function ad\u0076anceTurn() {
cu\u0072rentPlayerIndex =
(
cu\u0072rentPlayerIndex +
direction +
players.length
) %
players.length;
}
function cpuAction() {
if (ro\u0075ndFinished || ga\u006deFinished || pe\u006edingHumanCounterDon) return;
if (cu\u0072rentPlayerIndex === 0) return;
cl\u0065arCpuAutoTimer();
const player = players[cu\u0072rentPlayerIndex];
if (canCpuDon(cu\u0072rentPlayerIndex)) {
tryDon(cu\u0072rentPlayerIndex);
return;
}
const pl\u0061yableCards =
player.hand.filter(card => ca\u006ePlayCard(card));
if (pl\u0061yableCards.length === 0) {
ex\u0065cuteDraw(player);
return;
}
se\u006cectedCards =
ch\u006foseCpuCards(player, pl\u0061yableCards);
const topCard =
se\u006cectedCards[se\u006cectedCards.length - 1];
if (topCard.number === 11) {
pl\u0061ySelectedCards(ch\u006foseCpuSuit(player));
} else {
pl\u0061ySelectedCards(null);
}
}
function re\u0073olveNormalSkip() {
if (!no\u0072malSkipPending) return false;
const pending = no\u0072malSkipPending;
no\u0072malSkipPending = null;
for (let i = 0; i < pending.count * 2; i++) ad\u0076anceTurn();
updateAll();
ru\u006eAutoCpuIfNeeded();
return true;
}
