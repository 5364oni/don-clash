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

function showBigEffect(text, effectClass) {
  const effect = getEffectArea();

  effect.className = "";
  effect.classList.add(effectClass);

  effect.textContent = text;
  effect.style.animation = "none";

  void effect.offsetWidth;

  effect.style.animation = "donPop 0.9s ease-out forwards";

  setTimeout(() => {
    effect.className = "hidden";
  }, 900);
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
  }, 1500);
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
  }, 900);
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

function showJokerEffect() {
  flashScreen("flash-joker", 650);
  shakeScreen();
  showBigEffect("JOKER!!", "effect-joker");
}

function showSkipEffect() {
  showSkipFlowEffect();
}

function showDraw2Effect() {
  showBigEffect("DRAW 2!!", "effect-draw2");
  bounceDeck(2);
}

function showReverseEffect() {
  showBigEffect("REVERSE!!", "effect-reverse");
  rotateTable();
}

function showMarkChangeEffect(suit) {
  showBigEffect("MARK CHANGE!!", "effect-mark");

  if (suit) {
    showSuitBurst(suit);
  }
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