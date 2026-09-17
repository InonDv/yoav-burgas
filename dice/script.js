const models = girlModels();
const PIP_MAP = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const dieA = document.getElementById("dieA");
const dieB = document.getElementById("dieB");
const sumLabel = document.getElementById("sumLabel");
const statusEl = document.getElementById("status");
const pointLabel = document.getElementById("pointLabel");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

let busy = false;
let point = null;

function face(el, n) {
  el.innerHTML = "";
  for (let i = 0; i < 9; i += 1) {
    const pip = document.createElement("span");
    if (PIP_MAP[n].includes(i)) pip.className = "pip";
    el.append(pip);
  }
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.classList.remove("visible");
}

function showWin() {
  winnerPhoto.src = models[Math.floor(Math.random() * models.length)];
  jackpot.hidden = false;
  jackpot.classList.add("visible");
}

function finish(text, won) {
  statusEl.textContent = text;
  point = null;
  pointLabel.textContent = "";
  if (won) showWin();
}

function settle(a, b) {
  const sum = a + b;
  sumLabel.textContent = String(sum);
  if (point === null) {
    if (sum === 7 || sum === 11) finish("זכייה!", true);
    else if (sum === 2 || sum === 3 || sum === 12) finish("קראפס", false);
    else {
      point = sum;
      pointLabel.textContent = `הנקודה: ${point}`;
      statusEl.textContent = "זרוק שוב עד הנקודה. 7 מפסיד";
    }
    return;
  }
  if (sum === point) finish("הנקודה יצאה!", true);
  else if (sum === 7) finish("יצא 7", false);
  else statusEl.textContent = "עוד זריקה";
}

function roll() {
  if (busy) return;
  busy = true;
  hideWin();
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  dieA.classList.add("shake");
  dieB.classList.add("shake");
  statusEl.textContent = "זורק...";

  const flicker = window.setInterval(() => {
    face(dieA, 1 + Math.floor(Math.random() * 6));
    face(dieB, 1 + Math.floor(Math.random() * 6));
  }, 70);

  window.setTimeout(() => {
    window.clearInterval(flicker);
    const a = 1 + Math.floor(Math.random() * 6);
    const b = 1 + Math.floor(Math.random() * 6);
    face(dieA, a);
    face(dieB, b);
    dieA.classList.remove("shake");
    dieB.classList.remove("shake");
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    settle(a, b);
  }, 900);
}

face(dieA, 1);
face(dieB, 1);
cubeButton.addEventListener("click", roll);
jackpot.addEventListener("click", hideWin);
