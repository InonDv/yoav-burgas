const models = girlModels();
const ANTE = 5;
const START_BANK = 100;
const RANKS = [
  { label: "A", value: 14 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "J", value: 11 },
  { label: "Q", value: 12 },
  { label: "K", value: 13 },
];
const SUITS = [
  { glyph: "♥", color: "red" },
  { glyph: "♦", color: "red" },
  { glyph: "♠", color: "black" },
  { glyph: "♣", color: "black" },
];

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const bankEl = document.getElementById("bank");
const potEl = document.getElementById("pot");
const holeEl = document.getElementById("hole");
const boardEl = document.getElementById("board");
const dealerEl = document.getElementById("dealer");
const checkBtn = document.getElementById("checkBtn");
const betBtn = document.getElementById("betBtn");
const reloadBtn = document.getElementById("reloadBtn");
const denomsEl = document.getElementById("denoms");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

let bank = START_BANK;
let pot = 0;
let chip = 5;
let street = "idle";
let deck = [];
let hole = [];
let dealer = [];
let board = [];
let busy = false;

function paintMoney() {
  bankEl.textContent = String(bank);
  potEl.textContent = String(pot);
  const broke = bank < ANTE && street === "idle";
  reloadBtn.hidden = !broke;
  cubeButton.disabled = busy || broke || street !== "idle";
  paintChips();
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.classList.remove("visible");
}

function showWin(src) {
  winnerPhoto.src = src;
  jackpot.hidden = false;
  jackpot.classList.add("visible");
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeDeck() {
  const cards = [];
  let photo = 0;
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      cards.push({
        src: models[photo % models.length],
        rank: rank.value,
        label: rank.label,
        suit: suit.glyph,
        color: suit.color,
      });
      photo += 1;
    });
  });
  return shuffle(cards);
}

function cardHtml(card, hidden) {
  if (hidden) {
    return `<article class="card">
      <div class="card-inner">
        <div class="card-back"></div>
        <div class="card-front"></div>
      </div>
    </article>`;
  }
  const ten = card.label === "10" ? " ten" : "";
  return `<article class="card flipped">
    <div class="card-inner">
      <div class="card-back"></div>
      <div class="card-front ${card.color}">
        <span class="corner tl${ten}"><b>${card.label}</b><i>${card.suit}</i></span>
        <div class="art"><img src="${card.src}" alt=""></div>
        <span class="corner br${ten}"><b>${card.label}</b><i>${card.suit}</i></span>
      </div>
    </div>
  </article>`;
}

function render(showDealer) {
  holeEl.innerHTML = hole.map((c) => cardHtml(c, false)).join("");
  boardEl.innerHTML = board.map((c) => cardHtml(c, false)).join("");
  while (boardEl.children.length < 5) {
    boardEl.insertAdjacentHTML("beforeend", `<article class="card slot"><div class="card-inner"><div class="card-back"></div><div class="card-front"></div></div></article>`);
  }
  dealerEl.innerHTML = dealer.map((c) => cardHtml(c, !showDealer)).join("");
}

function combos(cards, k) {
  const out = [];
  function go(start, picked) {
    if (picked.length === k) {
      out.push(picked.slice());
      return;
    }
    for (let i = start; i < cards.length; i += 1) {
      picked.push(cards[i]);
      go(i + 1, picked);
      picked.pop();
    }
  }
  go(0, []);
  return out;
}

function straightHigh(values) {
  const uniq = [...new Set(values)].sort((a, b) => a - b);
  if (uniq.length !== 5) return 0;
  if (uniq[4] - uniq[0] === 4) return uniq[4];
  if (uniq[0] === 2 && uniq[1] === 3 && uniq[2] === 4 && uniq[3] === 5 && uniq[4] === 14) return 5;
  return 0;
}

function scoreFive(five) {
  const values = five.map((c) => c.rank);
  const flush = five.every((c) => c.suit === five[0].suit);
  const wheel = straightHigh(values);
  const tally = {};
  five.forEach((c) => {
    tally[c.rank] = (tally[c.rank] || 0) + 1;
  });
  const groups = Object.entries(tally)
    .map(([rank, n]) => ({ rank: Number(rank), n }))
    .sort((a, b) => b.n - a.n || b.rank - a.rank);
  const kickers = values.slice().sort((a, b) => b - a);
  if (flush && wheel) return [9, wheel];
  if (groups[0].n === 4) return [8, groups[0].rank, groups[1].rank];
  if (groups[0].n === 3 && groups[1] && groups[1].n === 2) return [7, groups[0].rank, groups[1].rank];
  if (flush) return [6, ...kickers];
  if (wheel) return [5, wheel];
  if (groups[0].n === 3) return [4, groups[0].rank, ...kickers];
  if (groups[0].n === 2 && groups[1] && groups[1].n === 2) {
    const high = Math.max(groups[0].rank, groups[1].rank);
    const low = Math.min(groups[0].rank, groups[1].rank);
    return [3, high, low, groups[2].rank];
  }
  if (groups[0].n === 2) return [2, groups[0].rank, ...kickers];
  return [1, ...kickers];
}

function bestScore(seven) {
  let best = null;
  combos(seven, 5).forEach((five) => {
    const s = scoreFive(five);
    if (!best || compareScore(s, best) > 0) best = s;
  });
  return best;
}

function compareScore(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}

function betAmount() {
  if (chip === "all") return bank;
  return Math.min(chip, bank);
}

function actingStreet() {
  return street === "hole" || street === "flop" || street === "turn";
}

function paintChips() {
  if (chip !== "all" && bank < chip) {
    const next = [50, 20, 10, 5].find((n) => bank >= n);
    if (next) chip = next;
    else if (bank > 0) chip = "all";
  }
  denomsEl.querySelectorAll("[data-chip]").forEach((btn) => {
    const val = btn.dataset.chip;
    const isAll = val === "all";
    const n = Number(val);
    btn.classList.toggle("on", isAll ? chip === "all" : chip === n);
    btn.disabled = isAll ? bank <= 0 : bank < n;
  });
  const amount = betAmount();
  if (chip === "all") {
    betBtn.textContent = amount > 0 ? "ALL IN " + amount : "ALL IN";
  } else {
    betBtn.textContent = "הימור " + (amount || chip);
  }
}

function setActing(on) {
  checkBtn.disabled = !on || busy;
  betBtn.disabled = !on || busy || betAmount() <= 0;
  paintChips();
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dealBoard() {
  if (street === "hole") {
    board.push(deck.pop(), deck.pop(), deck.pop());
    street = "flop";
  } else if (street === "flop") {
    board.push(deck.pop());
    street = "turn";
  } else if (street === "turn") {
    board.push(deck.pop());
    street = "river";
  }
}

async function dealRound() {
  if (busy || street !== "idle") return;
  if (bank < ANTE) {
    paintMoney();
    statusEl.textContent = "נגמרו הז'טונים";
    return;
  }
  busy = true;
  hideWin();
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  bank -= ANTE;
  pot = ANTE * 2;
  deck = makeDeck();
  hole = [deck.pop(), deck.pop()];
  dealer = [deck.pop(), deck.pop()];
  board = [];
  street = "hole";
  paintMoney();
  render(false);
  statusEl.textContent = "צ'ק או הימור";
  cube.classList.remove("spin-fast");
  busy = false;
  setActing(true);
  paintMoney();
}

async function nextStreet() {
  busy = true;
  setActing(false);
  cube.classList.add("spin-fast");
  dealBoard();
  if (street === "river") {
    render(false);
    await sleep(450);
    await showdown();
    cube.classList.remove("spin-fast");
    return;
  }
  render(false);
  statusEl.textContent = street === "flop" ? "פלופ. צ'ק או הימור" : "טרן. צ'ק או הימור";
  await sleep(350);
  cube.classList.remove("spin-fast");
  busy = false;
  setActing(true);
  paintMoney();
}

async function runOut() {
  busy = true;
  setActing(false);
  cube.classList.add("spin-fast");
  statusEl.textContent = "ALL IN · הקלפים נפתחים";
  while (street === "hole" || street === "flop" || street === "turn") {
    dealBoard();
    render(false);
    await sleep(480);
  }
  await showdown();
  cube.classList.remove("spin-fast");
}

async function showdown() {
  street = "show";
  render(true);
  const playerScore = bestScore([...hole, ...board]);
  const dealerScore = bestScore([...dealer, ...board]);
  const cmp = compareScore(playerScore, dealerScore);
  if (cmp > 0) {
    bank += pot;
    statusEl.textContent = `ניצחת · +${pot}`;
    showWin(hole[0].src);
  } else if (cmp < 0) {
    statusEl.textContent = "הבית לקח את הקופה";
  } else {
    bank += Math.floor(pot / 2);
    statusEl.textContent = "תיקו. הקופה פוצלה";
  }
  pot = 0;
  street = "idle";
  busy = false;
  setActing(false);
  paintMoney();
}

function check() {
  if (busy || checkBtn.disabled) return;
  nextStreet();
}

function bet() {
  if (busy || betBtn.disabled) return;
  placeBet();
}

function placeBet() {
  if (busy || !actingStreet()) return;
  const amount = betAmount();
  if (amount <= 0 || bank < amount) return;
  const allIn = chip === "all" || amount === bank;
  bank -= amount;
  pot += amount * 2;
  if (allIn) chip = 5;
  paintMoney();
  statusEl.textContent = (allIn ? "ALL IN " : "הימור ") + amount + " · הבית שווה";
  if (allIn || bank <= 0) runOut();
  else nextStreet();
}

function reload() {
  bank = START_BANK;
  paintMoney();
  statusEl.textContent = "נטענו 100 ז'טונים";
}

denomsEl.querySelectorAll("[data-chip]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.chip;
    if (val === "all") {
      if (bank <= 0 || busy) return;
      chip = "all";
      paintChips();
      if (actingStreet()) placeBet();
      return;
    }
    const n = Number(val);
    if (bank < n) return;
    chip = n;
    const acting = !busy && actingStreet();
    setActing(acting);
  });
});
cubeButton.addEventListener("click", dealRound);
checkBtn.addEventListener("click", check);
betBtn.addEventListener("click", bet);
reloadBtn.addEventListener("click", reload);
jackpot.addEventListener("click", hideWin);
render(false);
paintMoney();
