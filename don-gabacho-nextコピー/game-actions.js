function applyEffects(cards) {
  const first = cards[0];

  if (first.type === "joker") {
    if (typeof showJokerEffect === "function") {
      showJokerEffect();
    }

    drawPenalty += cards.length * 4;
    drawState = DRAW_STATE.DRAW4;
    drawSuit = null;
    drawNumber = 0;

    addLog(
      "Joker ドロー4 累積：" +
      drawPenalty +
      "枚"
    );

    return;
  }

  if (first.number === 1) {
    if (typeof showSkipEffect === "function") {
      showSkipEffect();
    }

    applySkipEffect(cards.length);

    if (drawPenalty > 0) {
      drawState = DRAW_STATE.ASKIP;
      drawSuit = first.suit;
      drawNumber = 1;

      addLog(
        "Aスキップ返し：" +
        cards.length +
        "枚"
      );

      return;
    }

    resetDrawState();

    addLog(
      "Aスキップ：" +
      cards.length +
      "枚"
    );

    return;
  }

  if (first.number === 7) {
    if (typeof showReverseEffect === "function") {
      showReverseEffect();
    }

    for (let i = 0; i < cards.length; i++) {
      direction *= -1;
    }

    if (drawPenalty > 0) {
      drawState = DRAW_STATE.REVERSE;
      drawSuit = first.suit;
      drawNumber = 7;
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
    if (typeof showDraw2Effect === "function") {
      showDraw2Effect();
    }

    drawPenalty += cards.length * 2;
    drawState = DRAW_STATE.DRAW2;
    drawSuit = first.suit;
    drawNumber = first.number;

    addLog(
      numberText(first.number) +
      " ドロー2 累積：" +
      drawPenalty +
      "枚"
    );

    return;
  }

  if (first.number === 11) {
    if (
      typeof showMarkChangeEffect ===
      "function"
    ) {
      showMarkChangeEffect(currentSuit);
    }

    addLog(
      "J マーク指定：" +
      currentSuit
    );

    return;
  }

  if (drawPenalty === 0) {
    resetDrawState();
  }
}

function applySkipEffect(cardCount) {
  const advanceBeforeNextTurn =
    cardCount * 2 - 1;

  for (
    let i = 0;
    i < advanceBeforeNextTurn;
    i++
  ) {
    advanceTurn();
  }
}

function executeDraw(player) {
  const count =
    drawPenalty > 0
      ? drawPenalty
      : 1;

  animateDeckDraw(currentPlayerIndex);

  for (let i = 0; i < count; i++) {
    drawCard(player);
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

  if (drawState !== DRAW_STATE.NONE) {
    resetDrawState();
    addLog("ドロー状態解除");
  }

  // 人間プレイヤーは引きドン成立を任意に選択できる。
  // CPUの引きドン判定は従来どおり自動処理する。
  if (currentPlayerIndex === 0 && canPlayerDon(0)) {
    updateAll();
    const doHikiDon = window.confirm(
      "引きドンの条件が成立！\n引きドンしますか？\n\nOK：引きドンする\nキャンセル：見送る"
    );
    if (doHikiDon) {
      checkHikiDon(0);
      return;
    }
    addLog("あなたは引きドンを見送った");
  } else if (currentPlayerIndex !== 0 && checkHikiDon(currentPlayerIndex)) {
    return;
  }

  nextTurn();
}

function drawCard(player) {
  if (deck.length === 0) {
    deck = [...discardPile];
    discardPile = [];

    shuffle(deck);

    currentRate *= 2;

    addLog("山札を作り直しました");
    addLog(
      "レートアップ！ 現在 " +
      currentRate +
      "点"
    );
  }

  if (deck.length === 0) return;

  player.hand.push(deck.pop());

  sortHand(player.hand);
}
function animateDeckDraw(playerIndex) {
  const deckCard =
    document.getElementById("deck-card");

  if (!deckCard) return;

  deckCard.classList.remove("deck-bounce");
  void deckCard.offsetWidth;
  deckCard.classList.add("deck-bounce");

  const fromRect =
    deckCard.getBoundingClientRect();

  let targetElement = handArea;

  if (playerIndex === 1) {
    targetElement =
      document.getElementById("cpu1-cards");
  }

  if (playerIndex === 2) {
    targetElement =
      document.getElementById("cpu2-cards");
  }

  if (playerIndex === 3) {
    targetElement =
      document.getElementById("cpu3-cards");
  }

  if (!targetElement) return;

  const toRect =
    targetElement.getBoundingClientRect();

  // 山札と同じ裏面を使う。旧ストライプ柄の直書きは廃止。
  const flyCard = document.createElement("div");
  flyCard.className = "draw-fly-card";
  flyCard.style.position = "fixed";
  flyCard.style.left = fromRect.left + "px";
  flyCard.style.top = fromRect.top + "px";
  flyCard.style.width = fromRect.width + "px";
  flyCard.style.height = fromRect.height + "px";
  flyCard.style.boxSizing = "border-box";
  flyCard.style.zIndex = "99999";
  flyCard.style.pointerEvents = "none";
  flyCard.style.transition =
    "left .65s ease-out, top .65s ease-out, transform .65s ease-out, opacity .65s ease-out";

  document.body.appendChild(flyCard);

  requestAnimationFrame(() => {
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

  setTimeout(() => {
    flyCard.remove();
  }, 700);
}

function nextTurn() {
  advanceTurn();
  updateAll();
  runAutoCpuIfNeeded();
}

function advanceTurn() {
  currentPlayerIndex =
    (
      currentPlayerIndex +
      direction +
      players.length
    ) %
    players.length;
}

function cpuAction() {
  if (roundFinished || gameFinished) return;
  if (currentPlayerIndex === 0) return;

  clearCpuAutoTimer();

  const player = players[currentPlayerIndex];

  if (canCpuDon(currentPlayerIndex)) {
    tryDon(currentPlayerIndex);
    return;
  }

  const playableCards =
    player.hand.filter(card => canPlayCard(card));

  if (playableCards.length === 0) {
    executeDraw(player);
    return;
  }

  selectedCards =
    chooseCpuCards(player, playableCards);

  const topCard =
    selectedCards[selectedCards.length - 1];

  if (topCard.number === 11) {
    playSelectedCards(chooseCpuSuit(player));
  } else {
    playSelectedCards(null);
  }
}

