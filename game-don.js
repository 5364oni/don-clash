/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

let so\u006coDonReveal = null;
function tryDon(pl\u0061yerIndex) {
if (pe\u006edingHumanCounterDon) return;
cl\u0065arCpuAutoTimer();
if (!ca\u006ePlayerDon(pl\u0061yerIndex)) {
if (pl\u0061yerIndex === 0) {
if (typeof sh\u006fwPlayNotice === "function") sh\u006fwPlayNotice("ドンは、場の数字と手札の数字合計が一致するときに宣言できます。");
}
return;
}
if (pl\u0061yerIndex === 0) window.Do\u006eAnalytics?.so\u006coAction();
const do\u006ePlayers = ge\u0074DonPlayers();
re\u0073olveDonBattle(
do\u006ePlayers,
"ドン",
GA\u004dE_RULES.DO\u004e_MULTIPLIER
);
}
function ca\u006ePlayerDon(pl\u0061yerIndex) {
const player = players[pl\u0061yerIndex];
if (!player) return false;
if (!do\u006eNumberActive) return false;
if (ta\u0062leNumber < 0) return false;
if (pl\u0061yerIndex === ta\u0062leNumberOwnerIndex) return false;
if (player.hand.length === 0) return false;
return (
ge\u0074HandTotal(player.hand) === ta\u0062leNumber
);
}
function ca\u006eCounterDon() {
if (ta\u0062leNumberOwnerIndex === null) return false;
const player = players[ta\u0062leNumberOwnerIndex];
if (!player) return false;
if (!do\u006eNumberActive) return false;
if (ta\u0062leNumber < 0) return false;
if (player.hand.length === 0) return false;
return (
ge\u0074HandTotal(player.hand) === ta\u0062leNumber
);
}
function ch\u0065ckOpeningDon() {
if (ro\u0075ndFinished || ga\u006deFinished) return;
if (ta\u0062leNumber <= 0) return;
const op\u0065ningDonPlayers = [];
players.forEach((player, index) => {
if (
player.hand.length > 0 &&
ge\u0074HandTotal(player.hand) === ta\u0062leNumber
) {
op\u0065ningDonPlayers.push(index);
}
});
if (op\u0065ningDonPlayers.length === 0) return;
addLog(
"開幕ドン成立：" +
op\u0065ningDonPlayers
.map(index => players[index].name)
.join("、")
);
const pa\u0079erIndexes =
players.map((player, index) => index);
fi\u006eishRound(
op\u0065ningDonPlayers,
"開幕ドン",
GA\u004dE_RULES.OP\u0045NING_DON_MULTIPLIER,
pa\u0079erIndexes
);
}
function ge\u0074DonPlayers() {
const do\u006ePlayers = [];
players.forEach((player, index) => {
if (ca\u006ePlayerDon(index)) {
do\u006ePlayers.push(index);
}
});
return do\u006ePlayers;
}
function re\u0073olveDonBattle(
do\u006ePlayers,
winType,
mu\u006ctiplier
) {
cl\u0065arCpuAutoTimer();
do\u006ePlayers = [...new Set(do\u006ePlayers)].filter(index => ca\u006ePlayerDon(index));
if (do\u006ePlayers.length === 0) return;
if (ca\u006eCounterDon()) {
if (ta\u0062leNumberOwnerIndex === 0) {
pe\u006edingHumanCounterDon = { do\u006ePlayers: do\u006ePlayers.slice(), winType, mu\u006ctiplier };
addLog("相手が" + winType + "！ あなたはドン返し可能。宣言か見送りを選んでください");
se\u006cectedCards = [];
updateAll();
return;
}
fi\u006eishRound(
[ta\u0062leNumberOwnerIndex],
winType + "返し",
winType === "引きドン" ? GA\u004dE_RULES.HI\u004bI_DON_COUNTER_MULTIPLIER : GA\u004dE_RULES.DO\u004e_COUNTER_MULTIPLIER,
do\u006ePlayers
);
return;
}
fi\u006eishRound(do\u006ePlayers, winType, mu\u006ctiplier, [ta\u0062leNumberOwnerIndex]);
}
function de\u0063ideHumanCounterDon(accept) {
const pending = pe\u006edingHumanCounterDon;
if (!pending || ro\u0075ndFinished || ga\u006deFinished || !ca\u006eCounterDon() || ta\u0062leNumberOwnerIndex !== 0) return false;
window.Do\u006eAnalytics?.so\u006coAction();
pe\u006edingHumanCounterDon = null;
if (accept) {
fi\u006eishRound([0], pending.winType + "返し",
pending.winType === "引きドン" ? GA\u004dE_RULES.HI\u004bI_DON_COUNTER_MULTIPLIER : GA\u004dE_RULES.DO\u004e_COUNTER_MULTIPLIER,
pending.do\u006ePlayers);
} else {
addLog("あなたはドン返しを見送った");
fi\u006eishRound(pending.do\u006ePlayers, pending.winType, pending.mu\u006ctiplier, [0]);
}
return true;
}
function re\u0073olveOutOfTurnCpuDon() {
if (ro\u0075ndFinished || ga\u006deFinished) return false;
if (ca\u006eHumanDon()) return false;
const cp\u0075Indexes = players
.map((player, index) => index)
.filter(index => index !== 0 && ca\u006ePlayerDon(index));
if (cp\u0075Indexes.length === 0) return false;
addLog(players[cp\u0075Indexes[0]].name + " が手番外ドン！");
tryDon(cp\u0075Indexes[0]);
return true;
}
function canCpuDon(pl\u0061yerIndex) {
return ca\u006ePlayerDon(pl\u0061yerIndex);
}
function ch\u0065ckHikiDon(pl\u0061yerIndex) {
if (!ca\u006ePlayerDon(pl\u0061yerIndex)) return false;
if (pl\u0061yerIndex === 0) window.Do\u006eAnalytics?.so\u006coAction();
re\u0073olveDonBattle([pl\u0061yerIndex], "引きドン", GA\u004dE_RULES.HI\u004bI_DON_MULTIPLIER);
return true;
}
function fi\u006eishDrawRound() {
if (ro\u0075ndFinished || ga\u006deFinished) return;
pe\u006edingHumanHikiDon = false;
pe\u006edingHumanCounterDon = null;
cl\u0065arCpuAutoTimer();
ro\u0075ndFinished = true;
do\u006eNumberActive = false;
re\u0073etDrawState();
se\u006cectedCards = [];
pe\u006edingJCards = null;
addLog("山札と再利用できる捨て札がなくなったため流局");
addLog("流局：得点の移動なし");
re\u0073ultArea.te\u0078tContent = "流局：山札が尽きました（得点の移動なし）";
updateAll();
if (cu\u0072rentRound < MA\u0058_ROUNDS) {
ne\u0077RoundButton.classList.remove("hidden");
} else {
fi\u006eishGame();
}
ne\u0077GameButton.classList.remove("hidden");
}
function fi\u006eishRound(
wi\u006enerIndexes,
winType,
ba\u0073eMultiplier,
pa\u0079erIndexes
) {
cl\u0065arCpuAutoTimer();
pe\u006edingHumanHikiDon = false;
pe\u006edingHumanCounterDon = null;
wi\u006enerIndexes = [...new Set(wi\u006enerIndexes)].filter(index => players[index]);
pa\u0079erIndexes = [...new Set(pa\u0079erIndexes)].filter(index => players[index]);
if (wi\u006enerIndexes.length === 0) return;
ro\u0075ndFinished = true;
do\u006eNumberActive = false;
sh\u006fwDonEffect(winType);
const re\u0073ultMessages = [];
const re\u0076ealBreakdown = {};
wi\u006enerIndexes.forEach(wi\u006enerIndex => {
const winner =
players[wi\u006enerIndex];
const to\u0074alCards =
players.reduce((sum, player, index) => {
if (index === wi\u006enerIndex) {
return sum;
}
return (
sum +
player.hand.length
);
}, 0);
let fi\u006ealMultiplier =
ba\u0073eMultiplier;
if (wi\u006enerIndex === pa\u0072entIndex) {
fi\u006ealMultiplier *=
GA\u004dE_RULES.PA\u0052ENT_BONUS;
addLog(
"親倍率：" +
GA\u004dE_RULES.PA\u0052ENT_BONUS +
"倍"
);
}
const jo\u006berCount =
winner.hand.filter(
card => card.type === "joker"
).length;
if (jo\u006berCount > 0) {
const jo\u006berMultiplier =
Math.pow(
GA\u004dE_RULES.JO\u004bER_MULTIPLIER,
jo\u006berCount
);
fi\u006ealMultiplier *=
jo\u006berMultiplier;
addLog(
"Joker保持：" +
jo\u006berCount +
"枚 / " +
jo\u006berMultiplier +
"倍"
);
}
const pay =
Math.floor(
to\u0074alCards *
cu\u0072rentRate *
fi\u006ealMultiplier
);
const de\u0063kMultiplier =
cu\u0072rentRate / BASE_RATE;
const to\u0074alMultiplier =
de\u0063kMultiplier *
fi\u006ealMultiplier;
addLog(
winner.name +
" が " +
winType
);
addLog(
"基本倍率：" +
ba\u0073eMultiplier +
"倍"
);
addLog(
"山札倍率：" +
de\u0063kMultiplier +
"倍"
);
addLog(
"役倍率：" +
fi\u006ealMultiplier +
"倍"
);
addLog(
"合計倍率：" +
to\u0074alMultiplier +
"倍"
);
addLog(
"残り手札合計：" +
to\u0074alCards +
"枚"
);
pa\u0079erIndexes.forEach(
pa\u0079erIndex => {
const payer =
players[pa\u0079erIndex];
if (!payer) return;
if (pa\u0079erIndex === wi\u006enerIndex) return;
payer.score -= pay;
winner.score += pay;
addLog(
payer.name +
" → " +
winner.name +
"：" +
pay +
"点"
);
}
);
const ac\u0074ualGain = pay * pa\u0079erIndexes.filter(index => index !== wi\u006enerIndex).length;
re\u0076ealBreakdown[wi\u006enerIndex] = {remaining:to\u0074alCards,rate:cu\u0072rentRate,ba\u0073eMultiplier,pa\u0072entMultiplier:wi\u006enerIndex===pa\u0072entIndex?GA\u004dE_RULES.PA\u0052ENT_BONUS:1,jo\u006berCount, jo\u006berMultiplier:GA\u004dE_RULES.JO\u004bER_MULTIPLIER,perPayer:pay};
re\u0073ultMessages.push(winner.name + " の勝利！ +" + ac\u0074ualGain + "点");
});
so\u006coDonReveal = winType.includes("ドン") ? {winners:wi\u006enerIndexes.slice(), cards:Object.fr\u006fmEntries([...new Set([...wi\u006enerIndexes,...(winType.includes("返し")?pa\u0079erIndexes:[])])].map(i=>[i,players[i].hand.slice()])), breakdown:re\u0076ealBreakdown} : null;
re\u0073ultArea.te\u0078tContent = re\u0073ultMessages.join(" / ");
updateAll();
if (cu\u0072rentRound < MA\u0058_ROUNDS) {
ne\u0077RoundButton.classList.remove("hidden");
} else {
fi\u006eishGame();
}
ne\u0077GameButton.classList.remove("hidden");
}
function fi\u006eishGame() {
window.Do\u006eAnalytics?.soloEnd();
ga\u006deFinished = true;
const ranking =
[...players].sort(
(a, b) => b.score - a.score
);
let ra\u006ekingText =
"最終順位\n";
ranking.forEach(
(player, index) => {
ra\u006ekingText +=
index +
1 +
"位：" +
player.name +
" " +
player.score +
"点\n";
}
);
window.DonSfx?.result(players[0].score===ranking[0].score,"solo");
re\u0073ultArea.te\u0078tContent =
ra\u006ekingText;
addLog("ゲーム終了");
ne\u0077GameButton.classList.remove(
"hidden"
);
}
function ch\u0065ckDonNotice() {
const do\u006ePlayers =
ge\u0074DonPlayers();
if (do\u006ePlayers.length > 0) {
addLog(
"ドン可能：" +
do\u006ePlayers
.map(index => players[index].name)
.join("、")
);
}
}
function re\u0073etDrawState() {
dr\u0061wPenalty = 0;
drawState = DR\u0041W_STATE.NONE;
drawSuit = null;
dr\u0061wNumber = null;
}
function ca\u006eHumanDon() {
return ca\u006ePlayerDon(0);
}
