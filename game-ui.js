function updateAll() {
  updateTable();
  updateHand();
  updateCPU();
  updateScore();
  updateTurn();
  updateDonButton();
}
function updateTable() {
  tableArea.innerHTML = "";

  const zone = document.createElement("div");
  zone.id = "table-zone";

  const deckZone = document.createElement("div");
  deckZone.id = "deck-zone";

  const deckCard = document.createElement("div");
  deckCard.id = "deck-card";

  const deckCount = document.createElement("div");
  deckCount.id = "deck-count";
  deckCount.textContent = "山札：" + deck.length + "枚";

  deckZone.appendChild(deckCard);
  deckZone.appendChild(deckCount);

  const stack = document.createElement("div");
  stack.id = "table-stack";

  // Older turns are subdued; only the latest play fans out by card count.
  const groups = (typeof tablePlayGroups !== "undefined" && tablePlayGroups.length)
    ? tablePlayGroups : [[currentCard]];
  const recent = groups.slice(-3);
  recent.forEach((group, groupIndex) => {
    const isLatest = groupIndex === recent.length - 1;
    if (!isLatest) {
      const previous = document.createElement("div");
      previous.className = "table-card table-history-card";
      previous.style.setProperty("--history-offset", String(recent.length - 1 - groupIndex));
      previous.innerHTML = cardHtml(group[group.length - 1]);
      stack.appendChild(previous);
      return;
    }
    const fan = document.createElement("div");
    fan.className = "table-current-group";
    const count = group.length;
    group.forEach((card, cardIndex) => {
      const div = document.createElement("div");
      div.className = "table-card table-fan-card";
      const spread = Math.min(28, 78 / Math.max(1, count - 1));
      const position = cardIndex - (count - 1) / 2;
      div.style.setProperty("--fan-x", `${position * spread}px`);
      div.style.setProperty("--fan-y", `${Math.abs(position) * 5}px`);
      div.style.setProperty("--fan-angle", `${position * 10}deg`);
      div.style.zIndex = String(10 + cardIndex);
      div.innerHTML = cardHtml(card);
      fan.appendChild(div);
    });
    stack.appendChild(fan);
    if (count > 1) {
      const countLabel = document.createElement("div");
      countLabel.className = "table-play-count";
      countLabel.textContent = `${count}枚出し`;
      stack.appendChild(countLabel);
    }
  });

  zone.appendChild(deckZone);
  zone.appendChild(stack);

  tableArea.appendChild(zone);

  numberArea.textContent = "場数字：" + tableNumber;

  let stateText = "";

  if (drawState === DRAW_STATE.DRAW2) {
    stateText = " / ドロー2中";
  }

  if (drawState === DRAW_STATE.DRAW4) {
    stateText = " / Jokerドロー中";
  }

  if (drawState === DRAW_STATE.REVERSE) {
    stateText = " / 7リバース返し中";
  }

  if (drawState === DRAW_STATE.ASKIP) {
    stateText = " / Aスキップ中";
  }

  let penaltyText = "";

  if (drawPenalty > 0) {
    penaltyText = " / 累積：" + drawPenalty + "枚";
  }

  const directionText =
    direction === 1
      ? "正順"
      : "逆順";

  suitArea.innerHTML =
    currentRound +
    "/" +
    MAX_ROUNDS +
    "回戦 / 親：" +
    players[parentIndex].name +
    " / 方向：" +
    directionText +
    " / レート：" +
    currentRate +
    "点 / 指定：" +
    currentSuit +
    " / 山札：" +
    deck.length +
    "枚" +
    stateText +
    penaltyText;
}

function updateHand() {
  handArea.innerHTML = "";

  sortHand(players[0].hand);

  players[0].hand.forEach((card, index) => {
    const button = document.createElement("button");

    button.className = "hand-card-button";
    button.innerHTML = cardHtml(card);
    button.style.zIndex = String(index + 1);

    if (selectedCards.includes(card)) {
      button.classList.add("selected");
      button.style.zIndex = "200";
    }

    button.addEventListener("click", () => {
      if (roundFinished || gameFinished) return;
      if (currentPlayerIndex !== 0) return;

      if (selectedCards.includes(card)) {
        selectedCards =
          selectedCards.filter(c => c !== card);
      } else {
        selectedCards.push(card);
      }

      updateHand();
    });

    handArea.appendChild(button);
  });
}

function updateCPU() {
  const cpuAreas = [
    { id: "cpu1-cards", hand: players[1].hand },
    { id: "cpu2-cards", hand: players[2].hand },
    { id: "cpu3-cards", hand: players[3].hand }
  ];

  cpuAreas.forEach(cpu => {
    const area = document.getElementById(cpu.id);

    if (!area) return;

    area.innerHTML = "";

    cpu.hand.forEach(() => {
      const back = document.createElement("div");
      back.className = "cpu-back-card";
      area.appendChild(back);
    });
  });
}

// Ver1.9.4: Shared personality icons for score bar and table seats.
const CPU_PERSONALITY_ICONS = Object.freeze({
  attack: "⚔️",
  cautious: "🛡️",
  calculated: "🧠",
  speed: "⚡",
  tricky: "🎭"
});

function cpuPersonalityDisplay(player) {
  if (!player || !player.isCPU || !player.personality) return "";
  const icon = CPU_PERSONALITY_ICONS[player.personality.id] || "";
  return (icon ? icon + " " : "") + player.personality.label;
}

function updateCpuSeatNames() {
  for (let index = 1; index <= 3; index++) {
    const seatName = document.getElementById("cpu" + index + "-name");
    if (!seatName) continue;
    const player = players[index];
    const personality = cpuPersonalityDisplay(player);
    // Use textContent so all game-generated labels remain plain text.
    seatName.textContent = (player ? player.name : "CPU" + index) +
      (personality ? " " + personality : "");
    seatName.classList.toggle("has-personality", Boolean(personality));
  }
}

function updateScore() {
  updateCpuSeatNames();
  scoreArea.innerHTML = "";

  players.forEach((player, index) => {
    const div = document.createElement("div");
    div.className = "score-box";

    const parentText =
      index === parentIndex
        ? "（親）"
        : "";

    div.textContent =
      player.name +
      (player.isCPU && player.personality ? "【" + cpuPersonalityDisplay(player) + "】" : "") +
      parentText +
      "：" +
      player.score +
      "点";

    scoreArea.appendChild(div);
  });
}

function clearActiveTurnDisplay() {
  document
    .querySelectorAll(".active-turn")
    .forEach(element => {
      element.classList.remove("active-turn");
    });
}

function updateActiveTurnDisplay() {
  clearActiveTurnDisplay();

  if (roundFinished || gameFinished) return;

  if (currentPlayerIndex === 0) {
    const playerArea =
      document.getElementById("player-area");

    if (playerArea) {
      playerArea.classList.add("active-turn");
    }

    return;
  }

  const cpuName =
    document.getElementById(
      "cpu" +
      currentPlayerIndex +
      "-name"
    );

  if (cpuName) {
    cpuName.classList.add("active-turn");
  }
}

function updateTurn() {
  updateActiveTurnDisplay();

  if (gameFinished) {
    turnArea.textContent = "ゲーム終了";
    return;
  }

  if (roundFinished) {
    turnArea.textContent = "ラウンド終了";
    return;
  }

  if (
    canHumanDon() &&
    currentPlayerIndex !== 0
  ) {
    turnArea.textContent = "ドン可能！";
    return;
  }

  if (
    autoCpuMode &&
    currentPlayerIndex !== 0
  ) {
    turnArea.textContent =
      players[currentPlayerIndex].name +
      " 思考中...";
    return;
  }

  turnArea.textContent =
    "現在：" +
    players[currentPlayerIndex].name;
}

function updateDonButton() {
  if (canHumanDon()) {
    donButton.classList.add("don-ready");
  } else {
    donButton.classList.remove("don-ready");
  }
}

function addLog(text) {
  const div = document.createElement("div");
  div.className = "log-line";
  div.innerHTML = "・" + text;
  logArea.prepend(div);
}

function getHandTotal(hand) {
  return hand.reduce(
    (sum, card) => sum + card.number,
    0
  );
}

function sortHand(hand) {
  const suitOrder = {
    "♠": 1,
    "♥": 2,
    "♦": 3,
    "♣": 4,
    "Joker": 5
  };

  hand.sort((a, b) => {
    if (a.type === "joker") return 1;
    if (b.type === "joker") return -1;

    if (a.number !== b.number) {
      return a.number - b.number;
    }

    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}

function cardText(card) {
  if (card.type === "joker") return "Joker";

  return card.suit + numberText(card.number);
}

function cardsText(cards) {
  return cards
    .map(card => cardText(card))
    .join("、");
}

function cardHtml(card) {
  if (card.type === "joker") {
    return `
      <div class="playing-card joker-card">
        <div class="joker-top">JOKER</div>
        <div class="joker-star">★</div>
        <div class="joker-bottom">JOKER</div>
      </div>
    `;
  }

  const suitCode = {"♠":"S","♥":"H","♦":"D","♣":"C"}[card.suit];
  // Ver1.8.4: Traditional CC0 English-pattern court cards from Wikimedia Commons.
  // Network-based image with offline fallback to the bundled Ver1.8.3 artwork.
  const localArt = `assets/${suitCode}${card.number}.png`;
  const themedArt = `<img class="theme-card-art theme-pop-art" src="assets/card-pop-${suitCode}${card.number}.svg" alt="" draggable="false"><img class="theme-card-art theme-dark-art" src="assets/card-dark-${suitCode}${card.number}.svg" alt="" draggable="false">`;
  if (card.number >= 11 && card.number <= 13) {
    const rank = {11:"jack",12:"queen",13:"king"}[card.number];
    const suitName = {"♠":"spades","♥":"hearts","♦":"diamonds","♣":"clubs"}[card.suit];
    const imageName = `English_pattern_${rank}_of_${suitName}.svg`;
    const remoteArt = `https://commons.wikimedia.org/wiki/Special:FilePath/${imageName}`;
    return `<div class="playing-card classic-card"><img class="classic-card-art" src="${remoteArt}" onerror="this.onerror=null;this.src='${localArt}'" alt="${numberText(card.number)}${card.suit}" draggable="false">${themedArt}</div>`;
  }
  return `<div class="playing-card classic-card"><img class="classic-card-art" src="${localArt}" alt="${numberText(card.number)}${card.suit}" draggable="false">${themedArt}</div>`;
}

function numberText(number) {
  if (number === 1) return "A";
  if (number === 11) return "J";
  if (number === 12) return "Q";
  if (number === 13) return "K";

  return String(number);
}

function getCardClass(card) {
  if (card.type === "joker") return "card-joker";

  if (
    card.suit === "♥" ||
    card.suit === "♦"
  ) {
    return "card-red";
  }

  return "card-black";
}

function shuffle(array) {
  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] =
      [array[j], array[i]];
  }
}