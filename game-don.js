function tryDon(playerIndex) {
  clearCpuAutoTimer();

  if (!canPlayerDon(playerIndex)) {
    if (playerIndex === 0) {
      if (typeof showPlayNotice === "function") showPlayNotice("ドンは、場の数字と手札の数字合計が一致するときに宣言できます。");
    }

    return;
  }

  const donPlayers = getDonPlayers();

  resolveDonBattle(
    donPlayers,
    "ドン",
    GAME_RULES.DON_MULTIPLIER
  );
}

/* 通常ドン用 */
function canPlayerDon(playerIndex) {
  const player = players[playerIndex];

  if (!player) return false;
  if (!donNumberActive) return false;
  if (tableNumber < 0) return false;
  if (playerIndex === tableNumberOwnerIndex) return false;
  if (player.hand.length === 0) return false;

  return (
    getHandTotal(player.hand) === tableNumber
  );
}

/* ドン返し用 */
function canCounterDon() {
  if (tableNumberOwnerIndex === null) return false;

  const player = players[tableNumberOwnerIndex];

  if (!player) return false;
  if (!donNumberActive) return false;
  if (tableNumber < 0) return false;
  if (player.hand.length === 0) return false;

  return (
    getHandTotal(player.hand) === tableNumber
  );
}

function checkOpeningDon() {
  if (roundFinished || gameFinished) return;
  if (tableNumber <= 0) return;

  const openingDonPlayers = [];

  players.forEach((player, index) => {
    if (
      player.hand.length > 0 &&
      getHandTotal(player.hand) === tableNumber
    ) {
      openingDonPlayers.push(index);
    }
  });

  if (openingDonPlayers.length === 0) return;

  addLog(
    "開幕ドン成立：" +
    openingDonPlayers
      .map(index => players[index].name)
      .join("、")
  );

  const payerIndexes =
    players.map((player, index) => index);

  finishRound(
    openingDonPlayers,
    "開幕ドン",
    GAME_RULES.OPENING_DON_MULTIPLIER,
    payerIndexes
  );
}

function getDonPlayers() {
  const donPlayers = [];

  players.forEach((player, index) => {
    if (canPlayerDon(index)) {
      donPlayers.push(index);
    }
  });

  return donPlayers;
}

function resolveDonBattle(
  donPlayers,
  winType,
  multiplier
) {
  clearCpuAutoTimer();

  // 有効なドン宣言者だけを採用し、重複による二重精算を防ぐ。
  donPlayers = [...new Set(donPlayers)].filter(index => canPlayerDon(index));
  if (donPlayers.length === 0) return;

  const canCounter = canCounterDon();

  if (canCounter) {
    finishRound(
      [tableNumberOwnerIndex],
      winType + "返し",
      GAME_RULES.DON_COUNTER_MULTIPLIER,
      donPlayers
    );

    return;
  }

  finishRound(
    donPlayers,
    winType,
    multiplier,
    [tableNumberOwnerIndex]
  );
}

// 場札が出た直後、手番外のCPUもドンを判定する。
// 人間にもドンの権利がある場合は、人間の操作機会を優先する。
function resolveOutOfTurnCpuDon() {
  if (roundFinished || gameFinished) return false;
  if (canHumanDon()) return false;

  const cpuIndexes = players
    .map((player, index) => index)
    .filter(index => index !== 0 && canPlayerDon(index));

  if (cpuIndexes.length === 0) return false;

  addLog(players[cpuIndexes[0]].name + " が手番外ドン！");
  tryDon(cpuIndexes[0]);
  return true;
}

function canCpuDon(playerIndex) {
  return canPlayerDon(playerIndex);
}

function checkHikiDon(playerIndex) {
  if (!canPlayerDon(playerIndex)) return false;

  const canCounter = canCounterDon();

  if (canCounter) {
    finishRound(
      [tableNumberOwnerIndex],
      "引きドン返し",
      GAME_RULES.HIKI_DON_COUNTER_MULTIPLIER,
      [playerIndex]
    );
  } else {
    finishRound(
      [playerIndex],
      "引きドン",
      GAME_RULES.HIKI_DON_MULTIPLIER,
      [tableNumberOwnerIndex]
    );
  }

  return true;
}
function finishRound(
  winnerIndexes,
  winType,
  baseMultiplier,
  payerIndexes
) {
  clearCpuAutoTimer();

  // 不正な勝者・支払者を除外し、同一人物の重複精算を防ぐ。
  winnerIndexes = [...new Set(winnerIndexes)].filter(index => players[index]);
  payerIndexes = [...new Set(payerIndexes)].filter(index => players[index]);
  if (winnerIndexes.length === 0) return;

  roundFinished = true;
  donNumberActive = false;

  showDonEffect(winType);

  const resultMessages = [];

  winnerIndexes.forEach(winnerIndex => {
    const winner =
      players[winnerIndex];

    const totalCards =
      players.reduce((sum, player, index) => {
        if (index === winnerIndex) {
          return sum;
        }

        return (
          sum +
          player.hand.length
        );
      }, 0);

    let finalMultiplier =
      baseMultiplier;

    if (winnerIndex === parentIndex) {
      finalMultiplier *=
        GAME_RULES.PARENT_BONUS;

      addLog(
        "親倍率：" +
        GAME_RULES.PARENT_BONUS +
        "倍"
      );
    }

    const jokerCount =
      winner.hand.filter(
        card => card.type === "joker"
      ).length;

    if (jokerCount > 0) {
      const jokerMultiplier =
        Math.pow(
          GAME_RULES.JOKER_MULTIPLIER,
          jokerCount
        );

      finalMultiplier *=
        jokerMultiplier;

      addLog(
        "Joker保持：" +
        jokerCount +
        "枚 / " +
        jokerMultiplier +
        "倍"
      );
    }

    const pay =
      Math.floor(
        totalCards *
        currentRate *
        finalMultiplier
      );

    const deckMultiplier =
      currentRate / BASE_RATE;

    const totalMultiplier =
      deckMultiplier *
      finalMultiplier;

    addLog(
      winner.name +
      " が " +
      winType
    );

    addLog(
      "基本倍率：" +
      baseMultiplier +
      "倍"
    );

    addLog(
      "山札倍率：" +
      deckMultiplier +
      "倍"
    );

    addLog(
      "役倍率：" +
      finalMultiplier +
      "倍"
    );

    addLog(
      "合計倍率：" +
      totalMultiplier +
      "倍"
    );

    addLog(
      "残り手札合計：" +
      totalCards +
      "枚"
    );

    payerIndexes.forEach(
      payerIndex => {
        const payer =
          players[payerIndex];

        if (!payer) return;
        if (payerIndex === winnerIndex) return;

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

    const actualGain = pay * payerIndexes.filter(index => index !== winnerIndex).length;
    resultMessages.push(winner.name + " の勝利！ +" + actualGain + "点");
  });

  resultArea.textContent = resultMessages.join(" / ");
  updateAll();

  if (currentRound < MAX_ROUNDS) {
    newRoundButton.classList.remove("hidden");
  } else {
    finishGame();
  }

  newGameButton.classList.remove("hidden");
}

function finishGame() {
  gameFinished = true;

  const ranking =
    [...players].sort(
      (a, b) => b.score - a.score
    );

  let rankingText =
    "最終順位\n";

  ranking.forEach(
    (player, index) => {
      rankingText +=
        index +
        1 +
        "位：" +
        player.name +
        " " +
        player.score +
        "点\n";
    }
  );

  resultArea.textContent =
    rankingText;

  addLog("ゲーム終了");

  newGameButton.classList.remove(
    "hidden"
  );
}

function checkDonNotice() {
  const donPlayers =
    getDonPlayers();

  if (donPlayers.length > 0) {
    addLog(
      "ドン可能：" +
      donPlayers
        .map(index => players[index].name)
        .join("、")
    );
  }
}

function resetDrawState() {
  drawPenalty = 0;
  drawState = DRAW_STATE.NONE;
  drawSuit = null;
  drawNumber = null;
}

function canHumanDon() {
  return canPlayerDon(0);
}

