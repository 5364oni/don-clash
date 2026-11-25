/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

const CP\u0055_PERSONALITIES = Object.freeze([
{ id: "attack", label: "攻撃型" },
{ id: "cautious", label: "慎重型" },
{ id: "calculated", label: "計算型" },
{ id: "speed", label: "速攻型" },
{ id: "tricky", label: "トリッキー型" }
]);
function dr\u0061wCpuPersonality() {
return CP\u0055_PERSONALITIES[Math.floor(Math.random() * CP\u0055_PERSONALITIES.length)];
}
function cp\u0075PersonalityId(player) {
return player && player.pe\u0072sonality ? player.pe\u0072sonality.id : "calculated";
}
function sc\u006frePersonalityCard(player, card) {
const kind = cp\u0075PersonalityId(player);
const remaining = player.hand.filter(c => c !== card);
const opponents = players.filter((p, i) => i !== cu\u0072rentPlayerIndex && p.hand.length > 0);
const urgent = opponents.some(p => p.hand.length <= 2);
const attack = card.type === "joker" || card.number === 2 || card.number === 8;
const control = card.number === 1 || card.number === 7 || card.number === 11;
const ma\u0074chingSuit = remaining.filter(c => c.suit === card.suit).length;
const ma\u0074chingNumber = remaining.filter(c => c.number === card.number).length;
const finish = remaining.length === 0;
let score = card.number * 0.45 + (finish ? 100 : 0);
if (card.type === "joker" && !finish) score -= 10;
if (kind === "attack") {
score += attack ? (urgent ? 23 : 15) : 0;
score += control && urgent ? 7 : 0;
} else if (kind === "cautious") {
score += ma\u0074chingSuit * 3;
score += attack ? (urgent ? 6 : -9) : 0;
score += control ? (urgent ? 4 : -4) : 0;
if (card.type === "joker" && !urgent) score -= 10;
} else if (kind === "calculated") {
score += ma\u0074chingSuit * 4 + ma\u0074chingNumber * 3;
score += attack && urgent ? 12 : 0;
if (card.type === "joker" && !urgent) score -= 7;
} else if (kind === "speed") {
score += ma\u0074chingNumber * 10;
score += attack ? 5 : 0;
} else if (kind === "tricky") {
score += (attack || control) ? 10 : 0;
score += Math.random() * 14;
}
if (player.hand.length <= 2 && (attack || control)) score += 10;
if (dr\u0061wPenalty > 0 && attack) score += 14;
if (cpuLevel === "hard" && wo\u0075ldGiveDonChanceByNumber(card.number)) score -= 11;
return score;
}
function ch\u006fosePersonalityCpuCard(player, pl\u0061yableCards) {
if (!pl\u0061yableCards.length) return null;
const scored = pl\u0061yableCards.map(card => ({ card, score: sc\u006frePersonalityCard(player, card) }));
scored.sort((a, b) => b.score - a.score);
if (cpuLevel === "easy") {
if (Math.random() < 0.48) return scored[Math.floor(Math.random() * scored.length)].card;
return scored[0].card;
}
if (cpuLevel === "normal" && scored.length > 1 && Math.random() < 0.23) {
return scored[Math.floor(Math.random() * Math.min(3, scored.length))].card;
}
return scored[0].card;
}
function pe\u0072sonalityMultiProbability(player) {
const kind = cp\u0075PersonalityId(player);
const base = { attack: 0.68, cautious: 0.28, ca\u006cculated: 0.57, speed: 0.93, tricky: 0.52 }[kind];
const le\u0076elAdjust = cpuLevel === "easy" ? -0.20 : cpuLevel === "hard" ? 0.05 : 0;
return Math.max(0.05, Math.min(0.98, base + le\u0076elAdjust));
}
function ru\u006eAutoCpuIfNeeded() {
cl\u0065arCpuAutoTimer();
if (pe\u006edingHumanCounterDon) return;
if (!au\u0074oCpuMode) return;
if (ro\u0075ndFinished) return;
if (ga\u006deFinished) return;
if (cu\u0072rentPlayerIndex === 0) return;
if (ca\u006eHumanDon()) {
addLog("あなたはドン可能！ 見送るなら「次へ」");
updateAll();
return;
}
const player = players[cu\u0072rentPlayerIndex];
turnArea.te\u0078tContent = player.name + " 思考中...";
cp\u0075AutoTimer = se\u0074Timeout(() => {
cp\u0075AutoTimer = null;
try {
if (!au\u0074oCpuMode) return;
if (pe\u006edingHumanCounterDon) return;
if (ro\u0075ndFinished) return;
if (ga\u006deFinished) return;
if (cu\u0072rentPlayerIndex === 0) return;
if (ca\u006eHumanDon()) {
addLog("あなたはドン可能！ 見送るなら「次へ」");
updateAll();
return;
}
cp\u0075ActionSafe();
} catch (error) {
console.error(error);
cl\u0065arCpuAutoTimer();
au\u0074oCpuMode = false;
if (au\u0074oCpuCheckbox) {
au\u0074oCpuCheckbox.checked = false;
}
addLog("CPU処理エラー。自動進行を停止しました");
updateAll();
}
}, GA\u004dE_RULES.CP\u0055_AUTO_DELAY);
}
function cl\u0065arCpuAutoTimer() {
if (cp\u0075AutoTimer) {
cl\u0065arTimeout(cp\u0075AutoTimer);
cp\u0075AutoTimer = null;
}
}
function cp\u0075ActionSafe() {
if (ro\u0075ndFinished || ga\u006deFinished || pe\u006edingHumanCounterDon) return;
if (cu\u0072rentPlayerIndex === 0) return;
const player = players[cu\u0072rentPlayerIndex];
if (!player) {
addLog("CPU取得エラー。次の人へ進めます");
nextTurn();
return;
}
if (ca\u006ePlayerDon(cu\u0072rentPlayerIndex)) {
addLog(player.name + " がドン！");
tryDon(cu\u0072rentPlayerIndex);
return;
}
const pl\u0061yableCards = player.hand.filter(card => ca\u006ePlayCard(card));
if (pl\u0061yableCards.length === 0) {
ex\u0065cuteDraw(player);
return;
}
se\u006cectedCards = ch\u006foseCpuCards(player, pl\u0061yableCards);
if (!se\u006cectedCards || se\u006cectedCards.length === 0) {
ex\u0065cuteDraw(player);
return;
}
const topCard = se\u006cectedCards[se\u006cectedCards.length - 1];
if (!topCard) {
ex\u0065cuteDraw(player);
return;
}
if (topCard.number === 11) {
pl\u0061ySelectedCards(ch\u006foseCpuSuit(player));
} else {
pl\u0061ySelectedCards(null);
}
}
function ch\u006foseCpuCards(player, pl\u0061yableCards) {
const se\u006cectedCard = ch\u006fosePersonalityCpuCard(player, pl\u0061yableCards);
if (!se\u006cectedCard) {
return [];
}
const sa\u006deNumberCards = player.hand.filter(card => {
return card.number === se\u006cectedCard.number;
});
if (!GA\u004dE_RULES.CP\u0055_MULTI_PLAY) {
return [se\u006cectedCard];
}
if (sa\u006deNumberCards.length <= 1) {
return [se\u006cectedCard];
}
let sh\u006fuldMultiPlay = Math.random() < pe\u0072sonalityMultiProbability(player);
if (cpuLevel === "hard" && cp\u0075PersonalityId(player) === "calculated") {
sh\u006fuldMultiPlay = sh\u006fuldHardCpuMultiPlay(se\u006cectedCard, sa\u006deNumberCards);
}
if (!sh\u006fuldMultiPlay) {
return [se\u006cectedCard];
}
if (cpuLevel === "easy") {
return no\u0072malizeCpuMultiCards(sa\u006deNumberCards.slice(0, 2), se\u006cectedCard);
}
if (cpuLevel === "normal") {
const maxCount = Math.random() < 0.75 ? 2 : 3;
return no\u0072malizeCpuMultiCards(sa\u006deNumberCards.slice(0, maxCount), se\u006cectedCard);
}
return no\u0072malizeCpuMultiCards(ch\u006foseHardMultiCards(se\u006cectedCard, sa\u006deNumberCards), se\u006cectedCard);
}
function no\u0072malizeCpuMultiCards(cards, se\u006cectedCard) {
if (!cards || !cards.length) return [se\u006cectedCard];
const arranged = [...cards];
if (is\u004aDeclaredSuitTurn() && arranged.length > 1 && se\u006cectedCard.type !== "joker") {
const matching = arranged.find(card => card.suit === cu\u0072rentSuit);
if (!matching) return [se\u006cectedCard];
arranged.splice(arranged.indexOf(matching), 1);
arranged.push(matching);
} else if (!ca\u006ePlayCard(arranged[0])) {
const first = arranged.find(card => ca\u006ePlayCard(card));
if (!first) return [se\u006cectedCard];
arranged.splice(arranged.indexOf(first), 1);
arranged.unshift(first);
}
return ca\u006ePlaySelectedCards(arranged) ? arranged : [se\u006cectedCard];
}
function sh\u006fuldHardCpuMultiPlay(se\u006cectedCard, sa\u006deNumberCards) {
if (sa\u006deNumberCards.length <= 1) return false;
const on\u0065CardNumber = se\u006cectedCard.number;
const al\u006cCardsNumber = sa\u006deNumberCards.reduce((sum, card) => {
return sum + card.number;
}, 0);
const on\u0065CardDanger = wo\u0075ldGiveDonChanceByNumber(on\u0065CardNumber);
const al\u006cCardsDanger = wo\u0075ldGiveDonChanceByNumber(al\u006cCardsNumber);
if (on\u0065CardDanger && !al\u006cCardsDanger) {
return true;
}
if (se\u006cectedCard.type === "joker") {
return false;
}
if (
se\u006cectedCard.number === 1 ||
se\u006cectedCard.number === 2 ||
se\u006cectedCard.number === 8 ||
se\u006cectedCard.number === 11
) {
return Math.random() < 0.25;
}
return Math.random() < 0.55;
}
function ch\u006foseCpuCard(player, pl\u0061yableCards) {
if (!pl\u0061yableCards || pl\u0061yableCards.length === 0) {
return null;
}
if (cpuLevel === "easy") {
return pl\u0061yableCards[Math.floor(Math.random() * pl\u0061yableCards.length)];
}
if (cpuLevel === "normal") {
return ch\u006foseNormalCpuCard(pl\u0061yableCards);
}
if (cpuLevel === "hard") {
return ch\u006foseHardCpuCard(player, pl\u0061yableCards);
}
return pl\u0061yableCards[0];
}
function ch\u006foseNormalCpuCard(pl\u0061yableCards) {
let ca\u006edidates = [...pl\u0061yableCards];
const nonJoker = ca\u006edidates.filter(card => {
return card.type !== "joker";
});
if (nonJoker.length > 0) {
ca\u006edidates = nonJoker;
}
ca\u006edidates.sort((a, b) => {
return b.number - a.number;
});
return ca\u006edidates[0];
}
function ch\u006foseHardCpuCard(player, pl\u0061yableCards) {
let ca\u006edidates = [...pl\u0061yableCards];
const jo\u006berCards = ca\u006edidates.filter(card => {
return card.type === "joker";
});
const no\u006eJokerCards = ca\u006edidates.filter(card => {
return card.type !== "joker";
});
const sh\u006fuldUseJokerNow =
sh\u006fuldHardCpuUseJoker(player, pl\u0061yableCards);
if (!sh\u006fuldUseJokerNow && no\u006eJokerCards.length > 0) {
ca\u006edidates = no\u006eJokerCards;
}
if (sh\u006fuldUseJokerNow && jo\u006berCards.length > 0) {
ca\u006edidates = jo\u006berCards;
}
const no\u006eSpecial = ca\u006edidates.filter(card => {
return (
card.type !== "joker" &&
card.number !== 1 &&
card.number !== 2 &&
card.number !== 8 &&
card.number !== 11
);
});
if (!sh\u006fuldUseJokerNow && no\u006eSpecial.length > 0) {
ca\u006edidates = no\u006eSpecial;
}
const safeCards = ca\u006edidates.filter(card => {
return !wo\u0075ldGiveDonChanceByNumber(card.number);
});
if (safeCards.length > 0) {
ca\u006edidates = safeCards;
}
ca\u006edidates.sort((a, b) => {
return b.number - a.number;
});
return ca\u006edidates[0];
}
function sh\u006fuldHardCpuUseJoker(player, pl\u0061yableCards) {
const jo\u006berCards = pl\u0061yableCards.filter(card => {
return card.type === "joker";
});
if (jo\u006berCards.length === 0) return false;
const no\u006eJokerCards = pl\u0061yableCards.filter(card => {
return card.type !== "joker";
});
if (no\u006eJokerCards.length === 0) {
return true;
}
if (
drawState === DR\u0041W_STATE.DRAW2 ||
drawState === DR\u0041W_STATE.DRAW4 ||
drawState === DR\u0041W_STATE.ASKIP ||
drawState === DR\u0041W_STATE.REVERSE
) {
return true;
}
if (player.hand.length <= 2) {
return true;
}
const sa\u0066eNonJokerCards = no\u006eJokerCards.filter(card => {
return !wo\u0075ldGiveDonChanceByNumber(card.number);
});
if (sa\u0066eNonJokerCards.length === 0) {
return true;
}
return Math.random() < 0.12;
}
function ch\u006foseHardMultiCards(se\u006cectedCard, sa\u006deNumberCards) {
let bestCards = [se\u006cectedCard];
for (let count = 2; count <= sa\u006deNumberCards.length; count++) {
const testCards = sa\u006deNumberCards.slice(0, count);
const te\u0073tNumber = testCards.reduce((sum, card) => {
return sum + card.number;
}, 0);
if (!wo\u0075ldGiveDonChanceByNumber(te\u0073tNumber)) {
bestCards = testCards;
}
}
return bestCards;
}
function wo\u0075ldGiveDonChanceByNumber(number) {
if (number <= 0) return false;
return players.some((opponent, index) => {
if (index === cu\u0072rentPlayerIndex || !opponent) return false;
const count = opponent.hand.length;
if (count === 0) return false;
const expected = count * 6.8;
const tolerance = Math.max(3, Math.sqrt(count) * 4.5);
return Math.abs(number - expected) <= tolerance;
});
}
function ch\u006foseCpuSuit(player) {
const suitCount = {
"♠": 0,
"♥": 0,
"♦": 0,
"♣": 0
};
player.hand.forEach(card => {
if (suitCount[card.suit] !== undefined) {
suitCount[card.suit]++;
}
});
let bestSuit = "♠";
let bestCount = -1;
suits.forEach(suit => {
if (suitCount[suit] > bestCount) {
bestSuit = suit;
bestCount = suitCount[suit];
}
});
return bestSuit;
}
