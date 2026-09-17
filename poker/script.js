const models = girlModels();
const ANTE = 5;
const BET = 5;
const START_BANK = 100;
const COPIES = 4;

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
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

let bank = START_BANK;
let pot = 0;
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
  models.forEach((src, rank) => {
    for (let i = 0; i < COPIES; i += 1) cards.push({ src, rank });
  });
  return shuffle(cards);
}

function cardHtml(card, hidden) {
  const src = hidden ? "" : card.src;
  return `<article class="card${hidden ? "" : " flipped"}">
    <div class="card-inner">
      <div class="card-back"></div>
      <div class="card-front">${src ? `<img src="${src}" alt="">` : ""}</div>
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

function scoreFive(five) {
  const tally = {};
  five.forEach((c) => {
    tally[c.rank] = (tally[c.rank] || 0) + 1;
  });
  const groups = Object.entries(tally)
    .map(([rank, n]) => ({ rank: Number(rank), n }))
    .sort((a, b) => b.n - a.n || b.rank - a.rank);
  const kickers = five.map((c) => c.rank).sort((a, b) => b - a);
  let kind = 1;
  if (groups[0].n === 4) kind = 7;
  else if (groups[0].n === 3 && groups[1] && groups[1].n === 2) kind = 6;
  else if (groups[0].n === 3) kind = 5;
  else if (groups[0].n === 2 && groups[1] && groups[1].n === 2) kind = 4;
  else if (groups[0].n === 2) kind = 3;
  return [kind, ...groups.map((g) => g.rank), ...kickers];
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

function setActing(on) {
  checkBtn.disabled = !on || busy;
  betBtn.disabled = !on || busy || bank < BET;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  if (street === "hole") {
    board.push(deck.pop(), deck.pop(), deck.pop());
    street = "flop";
    statusEl.textContent = "פלופ. צ'ק או הימור";
  } else if (street === "flop") {
    board.push(deck.pop());
    street = "turn";
    statusEl.textContent = "טרן. צ'ק או הימור";
  } else if (street === "turn") {
    board.push(deck.pop());
    street = "river";
    render(false);
    await sleep(450);
    await showdown();
    cube.classList.remove("spin-fast");
    return;
  }
  render(false);
  await sleep(350);
  cube.classList.remove("spin-fast");
  busy = false;
  setActing(true);
  paintMoney();
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
  if (busy || betBtn.disabled || bank < BET) return;
  bank -= BET;
  pot += BET * 2;
  paintMoney();
  statusEl.textContent = "הימור · הבית שווה";
  nextStreet();
}

function reload() {
  bank = START_BANK;
  paintMoney();
  statusEl.textContent = "נטענו 100 ז'טונים";
}

cubeButton.addEventListener("click", dealRound);
checkBtn.addEventListener("click", check);
betBtn.addEventListener("click", bet);
reloadBtn.addEventListener("click", reload);
jackpot.addEventListener("click", hideWin);
render(false);
paintMoney();
