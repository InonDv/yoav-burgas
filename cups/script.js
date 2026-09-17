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

function slotLeft(slot) {
  if (slot === 0) return "0px";
  if (slot === 1) return "calc(50% - 55px)";
  return "calc(100% - 110px)";
}

function layout() {
  wraps.forEach((wrap, cup) => {
    wrap.style.left = slotLeft(order[cup]);
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

async function shuffle() {
  for (let i = 0; i < 8; i += 1) {
    let a = Math.floor(Math.random() * 3);
    let b = Math.floor(Math.random() * 3);
    while (b === a) b = Math.floor(Math.random() * 3);
    const tmp = order[a];
    order[a] = order[b];
    order[b] = tmp;
    layout();
    await sleep(320);
  }
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
