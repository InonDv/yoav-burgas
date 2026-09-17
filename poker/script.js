const models = girlModels();

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const cards = [...document.querySelectorAll("[data-card]")];

models.forEach((src) => {
  const preload = new Image();
  preload.src = src;
});

let busy = false;

function randomIndex() {
  return Math.floor(Math.random() * models.length);
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.setAttribute("aria-hidden", "true");
  jackpot.classList.remove("visible");
}

function showWin() {
  jackpot.hidden = false;
  jackpot.setAttribute("aria-hidden", "false");
  jackpot.classList.add("visible");
}

function isWinningHand(hand) {
  const counts = {};
  hand.forEach((index) => {
    counts[index] = (counts[index] || 0) + 1;
  });
  return Object.values(counts).some((count) => count >= 3);
}

function deal() {
  if (busy) return;
  busy = true;
  hideWin();
  statusEl.textContent = "מחלק...";
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;

  cards.forEach((card) => card.classList.remove("flipped"));
  const hand = [randomIndex(), randomIndex(), randomIndex(), randomIndex(), randomIndex()];

  cards.forEach((card, index) => {
    const img = card.querySelector("img");
    img.src = models[hand[index]];
    window.setTimeout(() => card.classList.add("flipped"), 350 + index * 220);
  });

  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    if (isWinningHand(hand)) {
      statusEl.textContent = "שלישייה!";
      showWin();
    } else {
      statusEl.textContent = "נסה שוב";
    }
  }, 350 + 4 * 220 + 700);
}

cubeButton.addEventListener("click", deal);
jackpot.addEventListener("click", hideWin);
