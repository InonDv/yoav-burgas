const models = girlModels();
const OTHERS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q"];

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const resultCard = document.getElementById("resultCard");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");
const heroCard = document.getElementById("heroCard");
const heroPhoto = document.getElementById("heroPhoto");
const heroRank = document.getElementById("heroRank");

let busy = false;

function pickRank() {
  const roll = Math.random();
  if (roll < 0.3) return "A";
  if (roll < 0.6) return "K";
  return OTHERS[Math.floor(Math.random() * OTHERS.length)];
}

function hideResult() {
  jackpot.hidden = true;
  jackpot.classList.remove("visible");
}

function showResult(kind) {
  resultCard.classList.toggle("cry", kind === "king");
  if (kind === "ace") {
    resultTitle.textContent = "אס זוכה";
    resultSub.textContent = "זכית בבחורה — למימוש פנה לקבלה";
  } else {
    resultTitle.textContent = "קינג בוכה";
    resultSub.textContent = "לא הפעם — נסה שוב";
  }
  jackpot.hidden = false;
  jackpot.classList.add("visible");
}

function flip() {
  if (busy) return;
  busy = true;
  hideResult();
  heroCard.classList.remove("flipped");
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  statusEl.textContent = "הופך קלף...";

  const rank = pickRank();
  heroPhoto.src = models[Math.floor(Math.random() * models.length)];
  heroRank.textContent = rank;

  window.setTimeout(() => heroCard.classList.add("flipped"), 280);
  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    if (rank === "A") {
      statusEl.textContent = "אס זוכה!";
      showResult("ace");
    } else if (rank === "K") {
      statusEl.textContent = "קינג בוכה";
      showResult("king");
    } else {
      statusEl.textContent = "לא אס ולא קינג — נסה שוב";
    }
  }, 950);
}

cubeButton.addEventListener("click", flip);
jackpot.addEventListener("click", hideResult);
