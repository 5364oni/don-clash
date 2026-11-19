// Ver1.9.3: CPU personality is selected independently for each CPU at game start.
const CPU_PERSONALITIES = Object.freeze([
  { id: "attack", label: "攻撃型" },
  { id: "cautious", label: "慎重型" },
  { id: "calculated", label: "計算型" },
  { id: "speed", label: "速攻型" },
  { id: "tricky", label: "トリッキー型" }
]);

function drawCpuPersonality() {
  return CPU_PERSONALITIES[Math.floor(Math.random() * CPU_PERSONALITIES.length)];
}

function cpuPersonalityId(player) {
  return player && player.personality ? player.personality.id : "calculated";
}

// Only the current CPU's hand and public state are used for personality scoring.
// Ver1.9.8: personality and difficulty are combined without inspecting hidden hands.
function scorePersonalityCard(player, card) {
  const kind = cpuPersonalityId(player);
  const remaining = player.hand.filter(c => c !== card);
  const opponents = players.filter((p, i) => i !== currentPlayerIndex && p.hand.length > 0);
  const urgent = opponents.some(p => p.hand.length <= 2);
  const attack = card.type === "joker" || card.number === 2 || card.number === 8;
  const control = card.number === 1 || card.number === 7 || card.number === 11;
  const matchingSuit = remaining.filter(c => c.suit === card.suit).length;
  const matchingNumber = remaining.filter(c => c.number === card.number).length;
  const finish = remaining.length === 0;
  let score = card.number * 0.45 + (finish ? 100 : 0);

  // Saving Joker generally has value, but the urgency and personality differ.
  if (card.type === "joker" && !finish) score -= 10;
  if (kind === "attack") {
    score += attack ? (urgent ? 23 : 15) : 0;
    score += control && urgent ? 7 : 0;
  } else if (kind === "cautious") {
    score += matchingSuit * 3;
    score += attack ? (urgent ? 6 : -9) : 0;
    score += control ? (urgent ? 4 : -4) : 0;
    if (card.type === "joker" && !urgent) score -= 10;
  } else if (kind === "calculated") {
    score += matchingSuit * 4 + matchingNumber * 3;
    score += attack && urgent ? 12 : 0;
    if (card.type === "joker" && !urgent) score -= 7;
  } else if (kind === "speed") {
    score += matchingNumber * 10;
    score += attack ? 5 : 0;
  } else if (kind === "tricky") {
    score += (attack || control) ? 10 : 0;
    score += Math.random() * 14;
  }
  if (player.hand.length <= 2 && (attack || control)) score += 10;
  if (drawPenalty > 0 && attack) score += 14;
  // Hard CPUs avoid publicly estimated DON risk; not an exact prediction.
  if (cpuLevel === "hard" && wouldGiveDonChanceByNumber(card.number)) score -= 11;
  return score;
}

function choosePersonalityCpuCard(player, playableCards) {
  if (!playableCards.length) return null;
  const scored = playableCards.map(card => ({ card, score: scorePersonalityCard(player, card) }));
  scored.sort((a, b) => b.score - a.score);
  if (cpuLevel === "easy") {
    // Easy makes noticeably more imperfect choices.
    if (Math.random() < 0.48) return scored[Math.floor(Math.random() * scored.length)].card;
    return scored[0].card;
  }
  if (cpuLevel === "normal" && scored.length > 1 && Math.random() < 0.23) {
    return scored[Math.floor(Math.random() * Math.min(3, scored.length))].card;
  }
  return scored[0].card;
}

function personalityMultiProbability(player) {
  const kind = cpuPersonalityId(player);
  const base = { attack: 0.68, cautious: 0.28, calculated: 0.57, speed: 0.93, tricky: 0.52 }[kind];
  const levelAdjust = cpuLevel === "easy" ? -0.20 : cpuLevel === "hard" ? 0.05 : 0;
  return Math.max(0.05, Math.min(0.98, base + levelAdjust));
}

function runAutoCpuIfNeeded() {
  clearCpuAutoTimer();

  if (!autoCpuMode) return;
  if (roundFinished) return;
  if (gameFinished) return;
  if (currentPlayerIndex === 0) return;

  if (canHumanDon()) {
    addLog("あなたはドン可能！ 見送るなら「次へ」");
    updateAll();
    return;
  }

  const player = players[currentPlayerIndex];

  turnArea.textContent = player.name + " 思考中...";

  cpuAutoTimer = setTimeout(() => {
    cpuAutoTimer = null;

    try {
      if (!autoCpuMode) return;
      if (roundFinished) return;
      if (gameFinished) return;
      if (currentPlayerIndex === 0) return;

      if (canHumanDon()) {
        addLog("あなたはドン可能！ 見送るなら「次へ」");
        updateAll();
        return;
      }

      cpuActionSafe();

    } catch (error) {
      console.error(error);

      clearCpuAutoTimer();
      autoCpuMode = false;

      if (autoCpuCheckbox) {
        autoCpuCheckbox.checked = false;
      }

      addLog("CPU処理エラー。自動進行を停止しました");
      updateAll();
    }
  }, GAME_RULES.CPU_AUTO_DELAY);
}

function clearCpuAutoTimer() {
  if (cpuAutoTimer) {
    clearTimeout(cpuAutoTimer);
    cpuAutoTimer = null;
  }
}

function cpuActionSafe() {
  if (roundFinished || gameFinished) return;
  if (currentPlayerIndex === 0) return;

  const player = players[currentPlayerIndex];

  if (!player) {
    addLog("CPU取得エラー。次の人へ進めます");
    nextTurn();
    return;
  }

  if (canPlayerDon(currentPlayerIndex)) {
    addLog(player.name + " がドン！");
    tryDon(currentPlayerIndex);
    return;
  }

  const playableCards = player.hand.filter(card => canPlayCard(card));

  if (playableCards.length === 0) {
    executeDraw(player);
    return;
  }

  selectedCards = chooseCpuCards(player, playableCards);

  if (!selectedCards || selectedCards.length === 0) {
    executeDraw(player);
    return;
  }

  const topCard = selectedCards[selectedCards.length - 1];

  if (!topCard) {
    executeDraw(player);
    return;
  }

  if (topCard.number === 11) {
    playSelectedCards(chooseCpuSuit(player));
  } else {
    playSelectedCards(null);
  }
}

function chooseCpuCards(player, playableCards) {
  const selectedCard = choosePersonalityCpuCard(player, playableCards);

  if (!selectedCard) {
    return [];
  }

  const sameNumberCards = player.hand.filter(card => {
    return card.number === selectedCard.number;
  });

  if (!GAME_RULES.CPU_MULTI_PLAY) {
    return [selectedCard];
  }

  if (sameNumberCards.length <= 1) {
    return [selectedCard];
  }

  // Personalities control the appetite for multi-card plays.
  let shouldMultiPlay = Math.random() < personalityMultiProbability(player);
  if (cpuLevel === "hard" && cpuPersonalityId(player) === "calculated") {
    shouldMultiPlay = shouldHardCpuMultiPlay(selectedCard, sameNumberCards);
  }

  if (!shouldMultiPlay) {
    return [selectedCard];
  }

  if (cpuLevel === "easy") {
    return normalizeCpuMultiCards(sameNumberCards.slice(0, 2), selectedCard);
  }

  if (cpuLevel === "normal") {
    const maxCount = Math.random() < 0.75 ? 2 : 3;
    return normalizeCpuMultiCards(sameNumberCards.slice(0, maxCount), selectedCard);
  }

  return normalizeCpuMultiCards(chooseHardMultiCards(selectedCard, sameNumberCards), selectedCard);
}

// Ensure CPU selections follow the same legality and J top-card rule as humans.
function normalizeCpuMultiCards(cards, selectedCard) {
  if (!cards || !cards.length) return [selectedCard];
  const arranged = [...cards];
  if (isJDeclaredSuitTurn() && arranged.length > 1 && selectedCard.type !== "joker") {
    const matching = arranged.find(card => card.suit === currentSuit);
    if (!matching) return [selectedCard];
    arranged.splice(arranged.indexOf(matching), 1);
    arranged.push(matching);
  } else if (!canPlayCard(arranged[0])) {
    const first = arranged.find(card => canPlayCard(card));
    if (!first) return [selectedCard];
    arranged.splice(arranged.indexOf(first), 1);
    arranged.unshift(first);
  }
  return canPlaySelectedCards(arranged) ? arranged : [selectedCard];
}

function shouldHardCpuMultiPlay(selectedCard, sameNumberCards) {
  if (sameNumberCards.length <= 1) return false;

  const oneCardNumber = selectedCard.number;

  const allCardsNumber = sameNumberCards.reduce((sum, card) => {
    return sum + card.number;
  }, 0);

  const oneCardDanger = wouldGiveDonChanceByNumber(oneCardNumber);
  const allCardsDanger = wouldGiveDonChanceByNumber(allCardsNumber);

  if (oneCardDanger && !allCardsDanger) {
    return true;
  }

  if (selectedCard.type === "joker") {
    return false;
  }

  if (
    selectedCard.number === 1 ||
    selectedCard.number === 2 ||
    selectedCard.number === 8 ||
    selectedCard.number === 11
  ) {
    return Math.random() < 0.25;
  }

  return Math.random() < 0.55;
}

function chooseCpuCard(player, playableCards) {
  if (!playableCards || playableCards.length === 0) {
    return null;
  }

  if (cpuLevel === "easy") {
    return playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  if (cpuLevel === "normal") {
    return chooseNormalCpuCard(playableCards);
  }

  if (cpuLevel === "hard") {
    return chooseHardCpuCard(player, playableCards);
  }

  return playableCards[0];
}

function chooseNormalCpuCard(playableCards) {
  let candidates = [...playableCards];

  const nonJoker = candidates.filter(card => {
    return card.type !== "joker";
  });

  if (nonJoker.length > 0) {
    candidates = nonJoker;
  }

  candidates.sort((a, b) => {
    return b.number - a.number;
  });

  return candidates[0];
}

function chooseHardCpuCard(player, playableCards) {
  let candidates = [...playableCards];

  const jokerCards = candidates.filter(card => {
    return card.type === "joker";
  });

  const nonJokerCards = candidates.filter(card => {
    return card.type !== "joker";
  });

  const shouldUseJokerNow =
    shouldHardCpuUseJoker(player, playableCards);

  if (!shouldUseJokerNow && nonJokerCards.length > 0) {
    candidates = nonJokerCards;
  }

  if (shouldUseJokerNow && jokerCards.length > 0) {
    candidates = jokerCards;
  }

  const nonSpecial = candidates.filter(card => {
    return (
      card.type !== "joker" &&
      card.number !== 1 &&
      card.number !== 2 &&
      card.number !== 8 &&
      card.number !== 11
    );
  });

  if (!shouldUseJokerNow && nonSpecial.length > 0) {
    candidates = nonSpecial;
  }

  const safeCards = candidates.filter(card => {
    return !wouldGiveDonChanceByNumber(card.number);
  });

  if (safeCards.length > 0) {
    candidates = safeCards;
  }

  candidates.sort((a, b) => {
    return b.number - a.number;
  });

  return candidates[0];
}

function shouldHardCpuUseJoker(player, playableCards) {
  const jokerCards = playableCards.filter(card => {
    return card.type === "joker";
  });

  if (jokerCards.length === 0) return false;

  const nonJokerCards = playableCards.filter(card => {
    return card.type !== "joker";
  });

  if (nonJokerCards.length === 0) {
    return true;
  }

  if (
    drawState === DRAW_STATE.DRAW2 ||
    drawState === DRAW_STATE.DRAW4 ||
    drawState === DRAW_STATE.ASKIP ||
    drawState === DRAW_STATE.REVERSE
  ) {
    return true;
  }

  if (player.hand.length <= 2) {
    return true;
  }

  const safeNonJokerCards = nonJokerCards.filter(card => {
    return !wouldGiveDonChanceByNumber(card.number);
  });

  if (safeNonJokerCards.length === 0) {
    return true;
  }

  return Math.random() < 0.12;
}

function chooseHardMultiCards(selectedCard, sameNumberCards) {
  let bestCards = [selectedCard];

  for (let count = 2; count <= sameNumberCards.length; count++) {
    const testCards = sameNumberCards.slice(0, count);

    const testNumber = testCards.reduce((sum, card) => {
      return sum + card.number;
    }, 0);

    if (!wouldGiveDonChanceByNumber(testNumber)) {
      bestCards = testCards;
    }
  }

  return bestCards;
}

// Ver1.9.7: CPU decision-making must not inspect opponents' hidden cards.
// Hand counts are public; card values and hand totals are not.
// This is a conservative estimate, not an exact DON prediction.
function wouldGiveDonChanceByNumber(number) {
  if (number <= 0) return false;

  // An unknown hand has roughly 7 points per card (Joker is 0).
  // Allow a broad range to avoid treating a guess as certainty.
  return players.some((opponent, index) => {
    if (index === currentPlayerIndex || !opponent) return false;
    const count = opponent.hand.length; // public hand count only
    if (count === 0) return false;
    const expected = count * 6.8;
    const tolerance = Math.max(3, Math.sqrt(count) * 4.5);
    return Math.abs(number - expected) <= tolerance;
  });
}

function chooseCpuSuit(player) {
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