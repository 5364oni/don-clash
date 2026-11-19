function startGame() {
  clearCpuAutoTimer();

  currentRound = 1;
  parentIndex = 0;
  roundFinished = false;
  gameFinished = false;

  players = [
    { name: "あなた", hand: [], isCPU: false, score: START_SCORE },
    { name: "CPU1", hand: [], isCPU: true, score: START_SCORE },
    { name: "CPU2", hand: [], isCPU: true, score: START_SCORE },
    { name: "CPU3", hand: [], isCPU: true, score: START_SCORE }
  ];

  // Personalities are drawn once per new game, never on round transitions.
  players.forEach((player, index) => {
    if (index > 0) player.personality = drawCpuPersonality();
  });

  logArea.innerHTML = "";
  resultArea.textContent = "";

  newRoundButton.classList.add("hidden");
  newGameButton.classList.remove("hidden");

  addLog("新ゲーム開始");
  players.slice(1).forEach(player => addLog(player.name + "：" + player.personality.label));

  startRound();
}

function startRound() {
  clearCpuAutoTimer();

  roundFinished = false;
  currentRate = BASE_RATE;

  deck = createDeck();
  discardPile = [];
  tableHistory = [];
  tablePlayGroups = [];

  shuffle(deck);

  players.forEach(player => {
    player.hand = deck.splice(0, 5);
    sortHand(player.hand);
  });

  currentCard = deck.pop();

  while (isActionCard(currentCard)) {
    deck.unshift(currentCard);
    shuffle(deck);
    currentCard = deck.pop();
  }

  tableHistory.push(currentCard);
  tablePlayGroups.push([currentCard]);

  currentSuit = currentCard.suit;
  tableNumber = currentCard.number;

  currentPlayerIndex = parentIndex;
  direction = 1;

  tableNumberOwnerIndex = null;
  donNumberActive = true;

  selectedCards = [];
  pendingJCards = null;

  resetDrawState();

  updateAll();

  addLog(currentRound + "回戦開始");
  addLog("親：" + players[parentIndex].name);
  addLog("最初の場札：" + cardText(currentCard));
  addLog("山札残り：" + deck.length + "枚");

  checkOpeningDon();
  runAutoCpuIfNeeded();
}

function createDeck() {
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

function isActionCard(card) {
  return (
    card.number === 1 ||
    card.number === 2 ||
    card.number === 7 ||
    card.number === 8 ||
    card.number === 11 ||
    card.type === "joker"
  );
}

function isJDeclaredSuitTurn() {
  return drawState === DRAW_STATE.NONE && currentCard &&
    currentCard.number === 11 && currentCard.type !== "joker";
}

function canPlayCard(card) {
  if (drawState === DRAW_STATE.NONE) {
    if (isJDeclaredSuitTurn()) {
      return card.suit === currentSuit || card.number === 11 || card.type === "joker";
    }
    return currentCard.type === "joker" || card.suit === currentSuit ||
      card.number === currentCard.number || card.number === 11 || card.type === "joker";
  }
  if (drawState === DRAW_STATE.DRAW4) {
    return card.number === 1 || card.number === 2 ||
      card.number === 8 || card.type === "joker";
  }
  if (drawState === DRAW_STATE.DRAW2) {
    return card.number === drawNumber || card.type === "joker" ||
      ((card.number === 1 || card.number === 7) && card.suit === drawSuit);
  }
  if (drawState === DRAW_STATE.ASKIP) {
    return card.type === "joker" ||
      ((card.number === 1 || card.number === 7) && card.suit === drawSuit);
  }
  if (drawState === DRAW_STATE.REVERSE) {
    return card.type === "joker" ||
      ([1, 2, 7, 8].includes(card.number) && card.suit === drawSuit);
  }
  return false;
}

// Validate the complete selection: top is the last selected card.
function canPlaySelectedCards(cards) {
  if (!cards || !cards.length) return false;
  if (!cards.every(card => card.number === cards[0].number)) return false;
  if (isJDeclaredSuitTurn() && cards.length > 1 && cards[0].type !== "joker") {
    const top = cards[cards.length - 1];
    return top.suit === currentSuit;
  }
  return canPlayCard(cards[0]);
}

function playSelectedCards(selectedSuit) {
  const player = players[currentPlayerIndex];
  const playedCards = [...selectedCards];
  if (!canPlaySelectedCards(playedCards)) {
    if (currentPlayerIndex === 0 && typeof showPlayNotice === "function") showPlayNotice("選択したカードの組み合わせは出せません。場札とのつながりを確認してください。");
    return;
  }
  const topCard = playedCards[playedCards.length - 1];

  if (currentCard) {
    discardPile.push(currentCard);
  }

  playedCards.forEach(card => {
    if (card !== topCard) discardPile.push(card);
  });

  currentCard = topCard;
  tableHistory.push(topCard);
  tablePlayGroups.push([...playedCards]);
  if (tablePlayGroups.length > 3) tablePlayGroups.shift();

  if (tableHistory.length > 3) {
    tableHistory.shift();
  }

  if (topCard.number === 11) {
    currentSuit = selectedSuit;
  } else if (topCard.type === "joker") {
    currentSuit = "Joker";
  } else {
    currentSuit = topCard.suit;
  }

  tableNumber = playedCards.reduce(
    (sum, card) => sum + card.number,
    0
  );

  tableNumberOwnerIndex = currentPlayerIndex;
  donNumberActive = true;

  playedCards.forEach(card => {
    const index = player.hand.indexOf(card);

    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  });

  sortHand(player.hand);

  addLog(
    player.name +
    " は " +
    cardsText(playedCards) +
    " を出した"
  );

  if (typeof showCardFlyEffect === "function") {
    showCardFlyEffect(playedCards, currentPlayerIndex);
  }

  if (
    player.isCPU &&
    typeof showCardPreviewEffect === "function"
  ) {
    // Ver1.9.0: the actual flying card replaces the overlapping CPU preview.
  }

  addLog("場数字：" + tableNumber);
  addLog("山札残り：" + deck.length + "枚");

  applyEffects(playedCards);

  selectedCards = [];

  checkDonNotice();
  if (resolveOutOfTurnCpuDon()) return;
  if (resolveNormalSkip()) return;
  nextTurn();
}

