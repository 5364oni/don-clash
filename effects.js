/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

function ge\u0074EffectArea() {
let effect = document.ge\u0074ElementById("don-effect");
if (!effect) {
effect = document.cr\u0065ateElement("div");
effect.id = "don-effect";
effect.className = "hidden";
document.body.ap\u0070endChild(effect);
}
return effect;
}
const SP\u0045CIAL_EFFECT_MS = 1450;
let sp\u0065cialEffectQueue = [];
let sp\u0065cialEffectActive = false;
let sp\u0065cialEffectTimer = null;
function pl\u0061yNextSpecialEffect() {
if (sp\u0065cialEffectActive || sp\u0065cialEffectQueue.length === 0) return;
sp\u0065cialEffectActive = true;
const item = sp\u0065cialEffectQueue.shift();
const effect = ge\u0074EffectArea();
effect.className = item.ef\u0066ectClass;
effect.te\u0078tContent = item.text;
effect.style.animation = "none";
void effect.of\u0066setWidth;
effect.style.animation = `donPop ${item.duration}ms ease-out forwards`;
sp\u0065cialEffectTimer = se\u0074Timeout(() => {
effect.className = "hidden";
sp\u0065cialEffectActive = false;
sp\u0065cialEffectTimer = null;
pl\u0061yNextSpecialEffect();
}, item.duration);
}
function sh\u006fwBigEffect(text, ef\u0066ectClass, duration = SP\u0045CIAL_EFFECT_MS) {
if (ef\u0066ectClass && /^(effect-don|effect-counter|effect-draw-don|effect-draw-counter)$/.test(ef\u0066ectClass)) {
sp\u0065cialEffectQueue.length = 0;
if (sp\u0065cialEffectTimer !== null) cl\u0065arTimeout(sp\u0065cialEffectTimer);
sp\u0065cialEffectActive = false;
sp\u0065cialEffectTimer = null;
}
sp\u0065cialEffectQueue.push({ text, ef\u0066ectClass, duration });
pl\u0061yNextSpecialEffect();
}
function sh\u006fwSkipFlowEffect() {
const skip = document.cr\u0065ateElement("div");
skip.className = "skip-flow-effect";
skip.te\u0078tContent = "SKIP!!";
const wind = document.cr\u0065ateElement("div");
wind.className = "skip-wind-effect";
document.body.ap\u0070endChild(wind);
document.body.ap\u0070endChild(skip);
se\u0074Timeout(() => {
skip.remove();
wind.remove();
}, 1650);
}
function ad\u0064TempClass(element, className, duration) {
if (!element) return;
element.classList.remove(className);
void element.of\u0066setWidth;
element.classList.add(className);
se\u0074Timeout(() => {
element.classList.remove(className);
}, duration);
}
function sh\u0061keScreen() {
ad\u0064TempClass(document.body, "screen-shake", 450);
}
function fl\u0061shScreen(className, duration) {
const flash = document.cr\u0065ateElement("div");
flash.className = className;
document.body.ap\u0070endChild(flash);
se\u0074Timeout(() => {
flash.remove();
}, duration);
}
function ro\u0074ateTable(target) {
const ta\u0062leCenter = target || document.ge\u0074ElementById("table-center");
ad\u0064TempClass(ta\u0062leCenter, "table-reverse-spin", 700);
}
function bo\u0075nceDeck(times, target) {
const deckCard = target || document.ge\u0074ElementById("deck-card");
if (!deckCard) return;
let count = 0;
const runBounce = () => {
deckCard.classList.remove("deck-bounce");
void deckCard.of\u0066setWidth;
deckCard.classList.add("deck-bounce");
count++;
if (count < times) {
se\u0074Timeout(runBounce, 260);
}
};
runBounce();
}
function sh\u006fwSuitBurst(suit) {
const burst = document.cr\u0065ateElement("div");
burst.className = "suit-burst";
if (suit === "♥" || suit === "♦") {
burst.classList.add("red-suit-burst");
} else {
burst.classList.add("black-suit-burst");
}
burst.te\u0078tContent = suit || "★";
document.body.ap\u0070endChild(burst);
se\u0074Timeout(() => {
burst.remove();
}, 1400);
}
function sh\u006fwDonEffect(text) {
window.DonSfx?.play(text?.includes("返し")?"counterfx":"donfx",{special:true});
if (text && text.includes("引きドン返し")) {
sh\u0061keScreen();
fl\u0061shScreen("flash-draw-counter", 450);
sh\u006fwBigEffect("DRAW COUNTER!!", "effect-draw-counter");
return;
}
if (text && text.includes("引きドン")) {
sh\u0061keScreen();
fl\u0061shScreen("flash-draw-don", 420);
sh\u006fwBigEffect("DRAW DON!!", "effect-draw-don");
return;
}
if (text && text.includes("返し")) {
sh\u0061keScreen();
fl\u0061shScreen("flash-counter", 420);
sh\u006fwBigEffect("COUNTER!!", "effect-counter");
return;
}
sh\u0061keScreen();
fl\u0061shScreen("flash-don", 380);
sh\u006fwBigEffect("DON!!", "effect-don");
}
function bu\u0069ldNaturalJokerLightning(overlay) {
const ns = "http://www.w3.org/2000/svg";
const configs = [
{cls:"joker-bolt-left", seed:19019, x:119, y:0, ex:20, ey:340, width:160, height:340},
{cls:"joker-bolt-right", seed:19119, x:35, y:0, ex:144, ey:340, width:160, height:340},
{cls:"joker-bolt-top", seed:19219, x:0, y:13, ex:260, ey:126, width:260, height:140}
];
for (const cfg of configs) {
const svg = overlay.qu\u0065rySelector("." + cfg.cls);
if (!svg) continue;
let seed = cfg.seed;
const random = () => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296;};
const steps = 28;
const dx = cfg.ex-cfg.x, dy = cfg.ey-cfg.y;
const norm = Math.hypot(dx,dy);
const nx = -dy/norm, ny = dx/norm;
const pts = [];
for (let i=0;i<=steps;i++) {
const t=i/steps;
const taper=Math.sin(Math.PI*t);
const jitter=(random()-.5)*24*taper;
pts.push([cfg.x+dx*t+nx*jitter, cfg.y+dy*t+ny*jitter]);
}
const pathData = points => points.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
const main = pathData(pts);
const addPath=(d,cls)=>{const el=document.cr\u0065ateElementNS(ns,'path');el.se\u0074Attribute('d',d);el.se\u0074Attribute('class',cls);svg.ap\u0070endChild(el);};
addPath(main,'joker-electric-aura');
addPath(main,'joker-electric-core');
for(let k=0;k<8;k++){
const start=3+Math.floor(random()*21);
const side=random()<.5?-1:1;
const count=3+Math.floor(random()*5);
const branch=[pts[start]];
const len=(12+random()*38)*side;
for(let j=1;j<=count;j++){
const t=j/count;
const drift=len*t+(random()-.5)*9;
branch.push([pts[start][0]+dx/norm*25*t+nx*drift,pts[start][1]+dy/norm*25*t+ny*drift]);
}
addPath(pathData(branch),'joker-electric-branch');
if(k%2===0){
const sub=branch[Math.min(2,branch.length-1)];
addPath(pathData([sub,[sub[0]+nx*side*10+dx/norm*9,sub[1]+ny*side*10+dy/norm*9]]),'joker-electric-twig');
}
}
}
}
let jo\u006berEntranceTimer = null;
function sh\u006fwJokerEntrance() {
const previous = document.ge\u0074ElementById("joker-entrance-overlay");
if (previous) previous.remove();
if (jo\u006berEntranceTimer !== null) cl\u0065arTimeout(jo\u006berEntranceTimer);
const overlay = document.cr\u0065ateElement("div");
overlay.id = "joker-entrance-overlay";
overlay.className = "joker-entrance-overlay";
overlay.se\u0074Attribute("aria-hidden", "true");
overlay.innerHTML = `
    <div class="joker-lightning-layer">
      <svg class="joker-bolt joker-bolt-left" viewBox="0 0 160 340" aria-hidden="true"></svg>
      <svg class="joker-bolt joker-bolt-right" viewBox="0 0 160 340" aria-hidden="true"></svg>
      <svg class="joker-bolt joker-bolt-top" viewBox="0 0 260 140" aria-hidden="true"></svg>
      <div class="joker-electric-sparks" aria-hidden="true"></div>
    </div>
    <div class="joker-entrance-stage">
      <div class="joker-entrance-fan">
        <div class="joker-entrance-back joker-entrance-back-1"></div>
        <div class="joker-entrance-back joker-entrance-back-2"></div>
        <div class="joker-entrance-back joker-entrance-back-3"></div>
        <div class="joker-entrance-back joker-entrance-back-4"></div>
      </div>
      <div class="joker-entrance-face playing-card joker-card"></div>
      <div class="joker-entrance-label">JOKER</div>
    </div>`;
document.body.ap\u0070endChild(overlay);
bu\u0069ldNaturalJokerLightning(overlay);
jo\u006berEntranceTimer = se\u0074Timeout(() => {
overlay.remove();
jo\u006berEntranceTimer = null;
}, 1850);
}
function sh\u006fwJokerEffect() {
window.DonSfx?.play("jokerfx",{special:true});
fl\u0061shScreen("flash-joker", 650);
sh\u0061keScreen();
sh\u006fwJokerEntrance();
}
function sh\u006fwSkipEffect() {
window.DonSfx?.play("skipfx",{special:true});
sh\u006fwBigEffect("SKIP!!", "effect-skip");
sh\u006fwSkipFlowEffect();
}
function sh\u006fwDraw2Effect(target) {
window.DonSfx?.play("draw2alt",{special:true});
sh\u006fwBigEffect("DRAW +2!!", "effect-draw2");
bo\u0075nceDeck(2, target);
}
function sh\u006fwReverseEffect(target) {
window.DonSfx?.play("reversefx",{special:true});
sh\u006fwBigEffect("REVERSE!!", "effect-reverse");
ro\u0074ateTable(target);
}
function sh\u006fwMarkChangeEffect(suit) {
window.DonSfx?.play("suitfx",{special:true});
const names = {"♠":"スペード", "♥":"ハート", "♦":"ダイヤ", "♣":"クラブ"};
sh\u006fwBigEffect(`J マーク指定：${suit} ${names[suit] || ""}`, "effect-mark", 2100);
if (suit) sh\u006fwSuitBurst(suit);
}
function sh\u006fwCardFlyEffect(cards, pl\u0061yerIndex, anchors) {
if (!Array.isArray(cards) || cards.length === 0) return;
window.DonSfx?.play("card");
const target = anchors?.target || document.ge\u0074ElementById("table-stack") || document.ge\u0074ElementById("table-area");
if (!target) return;
const source = anchors?.source || (pl\u0061yerIndex === 0
? document.ge\u0074ElementById("hand")
: document.ge\u0074ElementById(`cpu${pl\u0061yerIndex}-cards`));
const from = source ? source.ge\u0074BoundingClientRect() : target.ge\u0074BoundingClientRect();
const to = target.ge\u0074BoundingClientRect();
const startX = from.left + from.width / 2;
const startY = from.top + from.height / 2;
const endX = to.left + to.width / 2;
const endY = to.top + to.height / 2;
const count = cards.length;
cards.forEach((card, index) => {
const flyer = document.cr\u0065ateElement("div");
flyer.className = "real-card-fly";
flyer.innerHTML = cardHtml(card);
const position = index - (count - 1) / 2;
const spread = Math.min(28, 78 / Math.max(1, count - 1));
flyer.style.left = `${startX}px`;
flyer.style.top = `${startY}px`;
flyer.style.zIndex = String(100000 + index);
flyer.style.transform = "translate(-50%, -50%) scale(.68) rotate(-10deg)";
document.body.ap\u0070endChild(flyer);
void flyer.of\u0066setWidth;
se\u0074Timeout(() => {
flyer.style.left = `${endX + position * spread}px`;
flyer.style.top = `${endY + Math.abs(position) * 5}px`;
flyer.style.opacity = "1";
flyer.style.transform = `translate(-50%, -50%) scale(1) rotate(${position * 10}deg)`;
}, 25 + index * 100);
se\u0074Timeout(() => flyer.remove(), 850 + index * 100);
});
}
function sh\u006fwCardPreviewEffect(card) {
if (typeof cardHtml !== "function") return;
if (!card) return;
const preview = document.cr\u0065ateElement("div");
preview.className = "cpu-preview-card";
preview.innerHTML = cardHtml(card);
document.body.ap\u0070endChild(preview);
re\u0071uestAnimationFrame(() => {
preview.classList.add("show");
});
se\u0074Timeout(() => {
preview.classList.remove("show");
se\u0074Timeout(() => {
preview.remove();
}, 300);
}, 700);
}
let de\u0063kReshuffleNoticeTimer = null;
function sh\u006fwDeckReshuffleEffect(pr\u0065viousRate, newRate) {
let notice = document.ge\u0074ElementById("deck-reshuffle-notice");
if (!notice) {
notice = document.cr\u0065ateElement("div");
notice.id = "deck-reshuffle-notice";
notice.se\u0074Attribute("role", "status");
notice.se\u0074Attribute("aria-live", "polite");
document.body.ap\u0070endChild(notice);
}
if (de\u0063kReshuffleNoticeTimer !== null) cl\u0065arTimeout(de\u0063kReshuffleNoticeTimer);
notice.re\u0070laceChildren();
const heading = document.cr\u0065ateElement("strong");
heading.te\u0078tContent = "山札を再構築！";
const subtitle = document.cr\u0065ateElement("span");
subtitle.te\u0078tContent = "カードをシャッフル";
const rate = document.cr\u0065ateElement("b");
rate.te\u0078tContent = `レート ${pr\u0065viousRate}点 → ${newRate}点`;
const double = document.cr\u0065ateElement("span");
double.te\u0078tContent = "レート2倍！";
double.className = "deck-reshuffle-double";
notice.append(heading, subtitle, rate, double);
notice.classList.remove("deck-reshuffle-show");
void notice.of\u0066setWidth;
notice.classList.add("deck-reshuffle-show");
de\u0063kReshuffleNoticeTimer = se\u0074Timeout(() => {
notice.classList.remove("deck-reshuffle-show");
de\u0063kReshuffleNoticeTimer = null;
}, 1900);
}
