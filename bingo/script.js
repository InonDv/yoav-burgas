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
let cells = [];
let marked = Array(9).fill(false);
let called = new Set();
let busy = false;
let won = false;
let lastCall = "";
let waitingNew = false;

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

function paint() {
  cells.forEach((cell, i) => {
    cell.classList.toggle("marked", marked[i]);
    cell.classList.toggle("match", Boolean(lastCall) && !marked[i] && board[i] === lastCall);
  });
}

function renderBoard() {
  grid.innerHTML = "";
  cells = board.map((src, i) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.innerHTML = `<img src="${src}" alt=""><span class="stamp">✓</span>`;
    cell.addEventListener("click", () => tap(i));
    grid.appendChild(cell);
    return cell;
  });
  paint();
}

function deal() {
  const extra = shuffle(models).slice(0, 2);
  board = shuffle([...models, ...extra]);
  marked = Array(9).fill(false);
  called = new Set();
  won = false;
  waitingNew = false;
  lastCall = "";
  callEl.removeAttribute("src");
  callEl.classList.remove("show");
  hideWin();
  renderBoard();
}

function tap(i) {
  if (won || busy || waitingNew) return;
  if (!called.has(board[i])) {
    statusEl.textContent = "קודם הגרלה בקוביה, ואז אותה בחורה בלוח";
    return;
  }
  if (marked[i]) return;
  marked[i] = true;
  paint();
  if (hasBingo()) {
    won = true;
    waitingNew = true;
    statusEl.textContent = "בינגו! לחץ על הקוביה ללוח חדש";
    showWin(board[i]);
  } else {
    statusEl.textContent = "מעולה. הגרל שוב בקוביה";
  }
}

function draw() {
  if (busy || won) return;
  if (called.size >= models.length) {
    waitingNew = true;
    statusEl.textContent = "נגמרו ההגרלות. לחץ ללוח חדש";
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
  paint();
  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    statusEl.textContent = "לחץ בלוח על אותה בחורה";
  }, 500);
}

cubeButton.addEventListener("click", () => {
  if (busy) return;
  if (waitingNew || won) {
    deal();
    statusEl.textContent = "לוח חדש. לחץ שוב על הקוביה להגרלה";
    return;
  }
  draw();
});
jackpot.addEventListener("click", hideWin);
deal();
