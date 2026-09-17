const models = [
  "../images/model1.png",
  "../images/model2.png",
  "../images/model7.png",
  "../images/model8.png",
  "../images/model9.png",
  "../images/model14.png",
  "../images/model15.png",
];

const grid = document.getElementById("grid");
const callEl = document.getElementById("call");
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = [];
let marked = Array(9).fill(false);
let called = new Set();
let busy = false;
let won = false;
let lastCall = "";

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

function hasBingo() {
  return LINES.some((line) => line.every((i) => marked[i]));
}

function renderBoard() {
  grid.innerHTML = "";
  board.forEach((src, i) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell" + (marked[i] ? " marked" : "");
    cell.innerHTML = `<img src="${src}" alt="">`;
    grid.appendChild(cell);
  });
}

function deal() {
  const extra = shuffle(models).slice(0, 2);
  board = shuffle([...models, ...extra]);
  marked = Array(9).fill(false);
  called = new Set();
  won = false;
  lastCall = "";
  callEl.removeAttribute("src");
  callEl.classList.remove("show");
  statusEl.textContent = "";
  hideWin();
  renderBoard();
}

function draw() {
  if (busy || won) return;
  if (called.size >= models.length) {
    statusEl.textContent = "נגמרו ההגרלות";
    return;
  }
  busy = true;
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  const pool = models.filter((src) => !called.has(src));
  lastCall = pool[Math.floor(Math.random() * pool.length)];
  called.add(lastCall);
  callEl.src = lastCall;
  callEl.classList.add("show");
  board.forEach((src, i) => {
    if (src === lastCall) marked[i] = true;
  });
  renderBoard();
  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    if (hasBingo()) {
      won = true;
      statusEl.textContent = "בינגו!";
      showWin(lastCall);
    } else {
      statusEl.textContent = `${called.size} מתוך ${models.length}`;
    }
  }, 650);
}

cubeButton.addEventListener("click", () => {
  if (!board.length || won || called.size >= models.length) deal();
  draw();
});
jackpot.addEventListener("click", hideWin);
deal();
