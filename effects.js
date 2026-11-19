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
