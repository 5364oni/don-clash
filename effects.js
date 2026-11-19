function getEffectArea() {
  let effect = document.getElementById("don-effect");

  if (!effect) {
    effect = document.createElement("div");
    effect.id = "don-effect";
    effect.className = "hidden";
    document.body.appendChild(effect);
  }

  return effect;
}

// Ver1.9.13: 役札演出は順番に表示し、短時間の連続発動でも上書きされない。
const SPECIAL_EFFECT_MS = 1450;
let specialEffectQueue = [];
let specialEffectActive = false;
let specialEffectTimer = null;
function playNextSpecialEffect() {
  if (specialEffectActive || specialEffectQueue.length === 0) return;
  specialEffectActive = true;
  const item = specialEffectQueue.shift();
  const effect = getEffectArea();
  effect.className = item.effectClass;
  effect.textContent = item.text;
  effect.style.animation = "none";
  void effect.offsetWidth;
  effect.style.animation = `donPop ${item.duration}ms ease-out forwards`;
  specialEffectTimer = setTimeout(() => {
    effect.className = "hidden";
    specialEffectActive = false;
    specialEffectTimer = null;
    playNextSpecialEffect();
  }, item.duration);
}
function showBigEffect(text, effectClass, duration = SPECIAL_EFFECT_MS) {
  // DON系は決着を優先。通常役札の待機演出は取り消す。
  if (effectClass && /^(effect-don|effect-counter|effect-draw-don|effect-draw-counter)$/.test(effectClass)) {
    specialEffectQueue.length = 0;
    if (specialEffectTimer !== null) clearTimeout(specialEffectTimer);
    specialEffectActive = false;
    specialEffectTimer = null;
  }
  specialEffectQueue.push({ text, effectClass, duration });
  playNextSpecialEffect();
}

function showSkipFlowEffect() {
  const skip = document.createElement("div");
  skip.className = "skip-flow-effect";
  skip.textContent = "SKIP!!";

  const wind = document.createElement("div");
  wind.className = "skip-wind-effect";

  document.body.appendChild(wind);
  document.body.appendChild(skip);

  setTimeout(() => {
    skip.remove();
    wind.remove();
  }, 1650);
}

function addTempClass(element, className, duration) {
  if (!element) return;

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);

  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

function shakeScreen() {
  addTempClass(document.body, "screen-shake", 450);
}

function flashScreen(className, duration) {
  const flash = document.createElement("div");

  flash.className = className;
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, duration);
}

function rotateTable() {
  const tableCenter = document.getElementById("table-center");

  addTempClass(tableCenter, "table-reverse-spin", 700);
}

function bounceDeck(times) {
  const deckCard = document.getElementById("deck-card");

  if (!deckCard) return;

  let count = 0;

  const runBounce = () => {
    deckCard.classList.remove("deck-bounce");
    void deckCard.offsetWidth;
    deckCard.classList.add("deck-bounce");

    count++;

    if (count < times) {
      setTimeout(runBounce, 260);
    }
  };

  runBounce();
}

function showSuitBurst(suit) {
  const burst = document.createElement("div");

  burst.className = "suit-burst";

  if (suit === "♥" || suit === "♦") {
    burst.classList.add("red-suit-burst");
  } else {
    burst.classList.add("black-suit-burst");
  }

  burst.textContent = suit || "★";

  document.body.appendChild(burst);

  setTimeout(() => {
    burst.remove();
  }, 1400);
}

function showDonEffect(text) {
  if (text && text.includes("引きドン返し")) {
    shakeScreen();
    flashScreen("flash-draw-counter", 450);
    showBigEffect("DRAW COUNTER!!", "effect-draw-counter");
    return;
  }

  if (text && text.includes("引きドン")) {
    shakeScreen();
    flashScreen("flash-draw-don", 420);
    showBigEffect("DRAW DON!!", "effect-draw-don");
    return;
  }

  if (text && text.includes("返し")) {
    shakeScreen();
    flashScreen("flash-counter", 420);
    showBigEffect("COUNTER!!", "effect-counter");
    return;
  }

  shakeScreen();
  flashScreen("flash-don", 380);
  showBigEffect("DON!!", "effect-don");
}

// Ver1.9.19: deterministic fractal-like lightning geometry; visual only.
// Each strike uses a stable seed, so no repeated layout work during animation.
function buildNaturalJokerLightning(overlay) {
  const ns = "http://www.w3.org/2000/svg";
  const configs = [
    {cls:"joker-bolt-left", seed:19019, x:119, y:0, ex:20, ey:340, width:160, height:340},
    {cls:"joker-bolt-right", seed:19119, x:35, y:0, ex:144, ey:340, width:160, height:340},
    {cls:"joker-bolt-top", seed:19219, x:0, y:13, ex:260, ey:126, width:260, height:140}
  ];
  for (const cfg of configs) {
    const svg = overlay.querySelector("." + cfg.cls);
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
    const addPath=(d,cls)=>{const el=document.createElementNS(ns,'path');el.setAttribute('d',d);el.setAttribute('class',cls);svg.appendChild(el);};
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

// Ver1.9.16: visual-only joker entrance. Uses the existing theme-specific joker art.
let jokerEntranceTimer = null;
function showJokerEntrance() {
  const previous = document.getElementById("joker-entrance-overlay");
  if (previous) previous.remove();
  if (jokerEntranceTimer !== null) clearTimeout(jokerEntranceTimer);

  const overlay = document.createElement("div");
  overlay.id = "joker-entrance-overlay";
  overlay.className = "joker-entrance-overlay";
  overlay.setAttribute("aria-hidden", "true");
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
  document.body.appendChild(overlay);
  buildNaturalJokerLightning(overlay);
  jokerEntranceTimer = setTimeout(() => {
    overlay.remove();
    jokerEntranceTimer = null;
  }, 1850);
}
function showJokerEffect() {
  flashScreen("flash-joker", 650);
  shakeScreen();
  showJokerEntrance();
}

function showSkipEffect() {
  showBigEffect("SKIP!!", "effect-skip");
  showSkipFlowEffect();
}

function showDraw2Effect() {
  showBigEffect("DRAW +2!!", "effect-draw2");
  bounceDeck(2);
}

function showReverseEffect() {
  showBigEffect("REVERSE!!", "effect-reverse");
  rotateTable();
}

function showMarkChangeEffect(suit) {
  const names = {"♠":"スペード", "♥":"ハート", "♦":"ダイヤ", "♣":"クラブ"};
  showBigEffect(`J マーク指定：${suit} ${names[suit] || ""}`, "effect-mark", 2100);
  if (suit) showSuitBurst(suit);
}

function showCardFlyEffect(cards, playerIndex) {
  if (!Array.isArray(cards) || cards.length === 0) return;
  const target = document.getElementById("table-stack") || document.getElementById("table-area");
  if (!target) return;
  const source = playerIndex === 0
    ? document.getElementById("hand")
    : document.getElementById(`cpu${playerIndex}-cards`);
  const from = source ? source.getBoundingClientRect() : target.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  const endX = to.left + to.width / 2;
  const endY = to.top + to.height / 2;
  const count = cards.length;
  cards.forEach((card, index) => {
    const flyer = document.createElement("div");
    flyer.className = "real-card-fly";
    flyer.innerHTML = cardHtml(card);
    const position = index - (count - 1) / 2;
    const spread = Math.min(28, 78 / Math.max(1, count - 1));
    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    flyer.style.zIndex = String(100000 + index);
    flyer.style.transform = "translate(-50%, -50%) scale(.68) rotate(-10deg)";
    document.body.appendChild(flyer);
    // Force the starting position to render before transitioning.
    void flyer.offsetWidth;
    setTimeout(() => {
      flyer.style.left = `${endX + position * spread}px`;
      flyer.style.top = `${endY + Math.abs(position) * 5}px`;
      flyer.style.opacity = "1";
      flyer.style.transform = `translate(-50%, -50%) scale(1) rotate(${position * 10}deg)`;
    }, 25 + index * 100);
    setTimeout(() => flyer.remove(), 850 + index * 100);
  });
}

function showCardPreviewEffect(card) {
  if (typeof cardHtml !== "function") return;
  if (!card) return;

  const preview = document.createElement("div");

  preview.className = "cpu-preview-card";
  preview.innerHTML = cardHtml(card);

  document.body.appendChild(preview);

  requestAnimationFrame(() => {
    preview.classList.add("show");
  });

  setTimeout(() => {
    preview.classList.remove("show");

    setTimeout(() => {
      preview.remove();
    }, 300);
  }, 700);
}
// Ver1.9.9: 独立した山札再構築アナウンス。ドン演出とは別レイヤー。
let deckReshuffleNoticeTimer = null;
function showDeckReshuffleEffect(previousRate, newRate) {
  let notice = document.getElementById("deck-reshuffle-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "deck-reshuffle-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    document.body.appendChild(notice);
  }
  if (deckReshuffleNoticeTimer !== null) clearTimeout(deckReshuffleNoticeTimer);
  notice.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = "山札を再構築！";
  const subtitle = document.createElement("span");
  subtitle.textContent = "カードをシャッフル";
  const rate = document.createElement("b");
  rate.textContent = `レート ${previousRate}点 → ${newRate}点`;
  const double = document.createElement("span");
  double.textContent = "レート2倍！";
  double.className = "deck-reshuffle-double";
  notice.append(heading, subtitle, rate, double);
  notice.classList.remove("deck-reshuffle-show");
  void notice.offsetWidth;
  notice.classList.add("deck-reshuffle-show");
  deckReshuffleNoticeTimer = setTimeout(() => {
    notice.classList.remove("deck-reshuffle-show");
    deckReshuffleNoticeTimer = null;
  }, 1900);
}
