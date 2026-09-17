const models = girlModels();
const RANKS = [
  ["A", 11], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7],
  ["8", 8], ["9", 9], ["10", 10], ["J", 10], ["Q", 10], ["K", 10],
];

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const dealerRow = document.getElementById("dealerRow");
const playerRow = document.getElementById("playerRow");
const dealerScore = document.getElementById("dealerScore");
const playerScore = document.getElementById("playerScore");
const actions = document.getElementById("actions");
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");

let player = [];
let dealer = [];
let playing = false;

function drawCard(hidden = false) {
  const [label, value] = RANKS[Math.floor(Math.random() * RANKS.length)];
  const photo = models[Math.floor(Math.random() * models.length)];
  return { label, value, photo, hidden };
}

function handTotal(cards, hideHole = false) {
  const visible = hideHole ? cards.filter((card) => !card.hidden) : cards;
  let total = 0;
  let aces = 0;
  visible.forEach((card) => {
    total += card.value;
    if (card.label === "A") aces += 1;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function render() {
  dealerRow.innerHTML = "";
  playerRow.innerHTML = "";
  dealer.forEach((card) => dealerRow.append(cardEl(card)));
  player.forEach((card) => playerRow.append(cardEl(card)));
  const hide = playing && dealer.some((card) => card.hidden);
  dealerScore.textContent = dealer.length ? `(${handTotal(dealer, hide)})` : "";
  playerScore.textContent = player.length ? `(${handTotal(player)})` : "";
}

function cardEl(card) {
  const wrap = document.createElement("div");
  wrap.className = `bj-card${card.hidden ? " hidden-card" : ""}`;
  wrap.innerHTML = `<img src="${card.photo}" alt=""><span class="pip">${card.label}</span>`;
  return wrap;
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.classList.remove("visible");
}

function showWin() {
  jackpot.hidden = false;
  jackpot.classList.add("visible");
}

function finish(message, won) {
  playing = false;
  dealer.forEach((card) => { card.hidden = false; });
  actions.hidden = true;
  cubeButton.disabled = false;
  cube.classList.remove("spin-fast");
  statusEl.textContent = message;
  render();
  if (won) showWin();
}

function dealerPlay() {
  dealer.forEach((card) => { card.hidden = false; });
  while (handTotal(dealer) < 17) dealer.push(drawCard());
  const p = handTotal(player);
  const d = handTotal(dealer);
  if (d > 21 || p > d) finish("יואב ניצח!", true);
  else if (p === d) finish("תיקו — נסה שוב", false);
  else finish("הדילר ניצח", false);
}

function deal() {
  hideWin();
  player = [drawCard(), drawCard()];
  dealer = [drawCard(), drawCard(true)];
  playing = true;
  actions.hidden = false;
  cubeButton.disabled = true;
  cube.classList.add("spin-fast");
  statusEl.textContent = "קח קלף או עמוד";
  render();
  if (handTotal(player) === 21) finish("בלאקג'ק!", true);
}

function hit() {
  if (!playing) return;
  player.push(drawCard());
  render();
  if (handTotal(player) > 21) finish("עברת 21", false);
  else if (handTotal(player) === 21) dealerPlay();
}

cubeButton.addEventListener("click", deal);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", () => { if (playing) dealerPlay(); });
jackpot.addEventListener("click", hideWin);
