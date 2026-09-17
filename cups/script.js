const models = [
  "../images/model1.png",
  "../images/model2.png",
  "../images/model7.png",
  "../images/model8.png",
  "../images/model9.png",
  "../images/model14.png",
  "../images/model15.png",
];
const wraps = [...document.querySelectorAll("[data-cup]")];
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

const SLOTS = [0, 1, 2];
let order = [0, 1, 2];
let prizeIndex = 1;
let prizeSrc = models[0];
let canPick = false;
let busy = false;

function rand(max) {
  return Math.floor(Math.random() * max);
}

function slotLeft(slot) {
  if (slot === 0) return "0px";
  if (slot === 1) return "calc(50% - 55px)";
  return "calc(100% - 110px)";
}

function layout(moving) {
  wraps.forEach((wrap, cup) => {
    wrap.style.left = slotLeft(order[cup]);
    wrap.style.zIndex = moving && moving.includes(cup) ? String(8 + cup) : "1";
  });
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.classList.remove("visible");
}

function showWin() {
  winnerPhoto.src = prizeSrc;
  jackpot.hidden = false;
  jackpot.classList.add("visible");
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function applyMove(kind) {
  if (kind === "rotL") {
    order = [order[1], order[2], order[0]];
    return [0, 1, 2];
  }
  if (kind === "rotR") {
    order = [order[2], order[0], order[1]];
    return [0, 1, 2];
  }
  const [a, b] = kind.split("-").map(Number);
  const tmp = order[a];
  order[a] = order[b];
  order[b] = tmp;
  return [a, b];
}

function nextMove(lastKind) {
  const moves = ["0-1", "1-2", "0-2", "rotL", "rotR"];
  let kind = moves[rand(moves.length)];
  while (kind === lastKind) kind = moves[rand(moves.length)];
  return kind;
}

async function shuffle() {
  const steps = 11 + rand(7);
  let lastKind = "";
  for (let i = 0; i < steps; i += 1) {
    const kind = nextMove(lastKind);
    lastKind = kind;
    const moving = applyMove(kind);
    const ms = 140 + rand(220);
    wraps.forEach((wrap) => {
      wrap.style.transitionDuration = `${ms}ms`;
    });
    layout(moving);
    await sleep(ms + 20);
  }
  wraps.forEach((wrap) => {
    wrap.style.transitionDuration = "";
    wrap.style.zIndex = "1";
  });
}

async function startRound() {
  if (busy) return;
  busy = true;
  canPick = false;
  hideWin();
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  wraps.forEach((wrap) => wrap.classList.remove("lift", "show"));
  order = [0, 1, 2];
  layout();
  prizeIndex = Math.floor(Math.random() * 3);
  prizeSrc = models[Math.floor(Math.random() * models.length)];
  wraps.forEach((wrap, cup) => {
    const img = wrap.querySelector(".prize");
    img.src = cup === prizeIndex ? prizeSrc : "";
  });
  statusEl.textContent = "שימי לב...";
  wraps[prizeIndex].classList.add("lift", "show");
  await sleep(900);
  wraps[prizeIndex].classList.remove("lift", "show");
  await sleep(280);
  statusEl.textContent = "מערבב...";
  await shuffle();
  statusEl.textContent = "איפה היא?";
  canPick = true;
  busy = false;
  cube.classList.remove("spin-fast");
  cubeButton.disabled = false;
}

function pick(cup) {
  if (!canPick || busy) return;
  canPick = false;
  wraps[cup].classList.add("lift");
  if (cup === prizeIndex) {
    wraps[cup].classList.add("show");
    statusEl.textContent = "מצאת!";
    showWin();
  } else {
    statusEl.textContent = "לא שם";
    window.setTimeout(() => {
      wraps[prizeIndex].classList.add("lift", "show");
    }, 250);
  }
}

wraps.forEach((wrap, cup) => wrap.addEventListener("click", () => pick(cup)));
cubeButton.addEventListener("click", startRound);
jackpot.addEventListener("click", hideWin);
layout();
