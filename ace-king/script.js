const ACES = [
  "../images/model1.png",
  "../images/model2.png",
  "../images/model7.png",
  "../images/model8.png",
  "../images/model9.png",
  "../images/model14.png",
  "../images/model15.png",
];

const KINGS = [
  "../images/model3.png",
  "../images/model4.png",
  "../images/model5.png",
  "../images/model6.png",
  "../images/model10.png",
  "../images/model11.png",
  "../images/model12.png",
  "../images/model13.png",
];

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

function pickCard() {
  const deck = [
    ...ACES.map((photo) => ({ rank: "A", photo })),
    ...KINGS.map((photo) => ({ rank: "K", photo })),
  ];
  return deck[Math.floor(Math.random() * deck.length)];
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

  const card = pickCard();
  heroPhoto.src = card.photo;
  heroRank.textContent = card.rank;

  window.setTimeout(() => heroCard.classList.add("flipped"), 280);
  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    if (card.rank === "A") {
      statusEl.textContent = "אס זוכה!";
      showResult("ace");
    } else {
      statusEl.textContent = "קינג בוכה";
      showResult("king");
    }
  }, 950);
}

cubeButton.addEventListener("click", flip);
jackpot.addEventListener("click", hideResult);
