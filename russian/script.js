const models = [
  "../images/model1.png",
  "../images/model2.png",
  "../images/model7.png",
  "../images/model8.png",
  "../images/model9.png",
  "../images/model14.png",
  "../images/model15.png",
];

const cylinder = document.getElementById("cylinder");
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

const CHAMBERS = 6;
let loaded = 0;
let girl = models[0];
let angle = 0;
let busy = false;
let primed = true;

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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

function build() {
  cylinder.innerHTML = "";
  for (let i = 0; i < CHAMBERS; i += 1) {
    const chamber = document.createElement("div");
    chamber.className = "chamber";
    chamber.style.setProperty("--i", String(i));
    chamber.innerHTML = `<img alt="">`;
    cylinder.appendChild(chamber);
  }
}

function loadRound() {
  loaded = Math.floor(Math.random() * CHAMBERS);
  girl = models[Math.floor(Math.random() * models.length)];
  [...cylinder.children].forEach((chamber, i) => {
    const img = chamber.querySelector("img");
    chamber.classList.remove("hit", "miss", "live");
    if (i === loaded) {
      img.src = girl;
      chamber.classList.add("live");
    } else {
      img.removeAttribute("src");
    }
  });
}

async function spin() {
  if (busy) return;
  busy = true;
  hideWin();
  cubeButton.disabled = true;
  if (!primed) {
    loadRound();
    statusEl.textContent = "תא טעון";
    await sleep(900);
  }
  primed = false;
  cube.classList.add("spin-fast");
  statusEl.textContent = "מסתובב...";
  const land = Math.floor(Math.random() * CHAMBERS);
  const extra = 5 + Math.floor(Math.random() * 3);
  angle = (Math.floor(angle / 360) + extra) * 360 - land * 60;
  cylinder.style.transform = `rotate(${angle}deg)`;
  await sleep(2800);
  cube.classList.remove("spin-fast");
  cubeButton.disabled = false;
  busy = false;
  const hit = land === loaded;
  [...cylinder.children].forEach((chamber, i) => {
    chamber.classList.toggle("hit", i === loaded && hit);
    chamber.classList.toggle("miss", i === land && !hit);
  });
  if (hit) {
    statusEl.textContent = "קליע!";
    showWin(girl);
  } else {
    statusEl.textContent = "נפלת בריק";
  }
}

cubeButton.addEventListener("click", spin);
jackpot.addEventListener("click", hideWin);
build();
loadRound();
statusEl.textContent = "תא טעון";
