const models = [
  "../images/model1.png",
  "../images/model2.png",
  "../images/model7.png",
  "../images/model8.png",
  "../images/model9.png",
  "../images/model14.png",
  "../images/model15.png",
];

const board = document.getElementById("board");
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");

let cards = [];
let open = [];
let matched = 0;
let busy = false;
let lastMatch = "";

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

function deal() {
  hideWin();
  open = [];
  matched = 0;
  lastMatch = "";
  busy = false;
  const pairSrc = shuffle(models).slice(0, 6);
  cards = shuffle([...pairSrc, ...pairSrc]);
  board.innerHTML = "";
  cards.forEach((src, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "mem-card";
    card.innerHTML = `
      <div class="inner">
        <div class="mem-back"></div>
        <div class="mem-front"><img src="${src}" alt=""></div>
      </div>
    `;
    card.addEventListener("click", () => flip(i, card));
    board.appendChild(card);
  });
  statusEl.textContent = "מצא זוגות";
}

function flip(i, card) {
  if (busy || card.classList.contains("open") || card.classList.contains("done")) return;
  card.classList.add("open");
  open.push({ i, card, src: cards[i] });
  if (open.length < 2) return;
  busy = true;
  const [a, b] = open;
  if (a.src === b.src) {
    a.card.classList.add("done");
    b.card.classList.add("done");
    matched += 1;
    lastMatch = a.src;
    open = [];
    busy = false;
    if (matched === 6) {
      statusEl.textContent = "כל הזוגות!";
      showWin(lastMatch);
    } else {
      statusEl.textContent = `${matched} מתוך 6`;
    }
  } else {
    window.setTimeout(() => {
      a.card.classList.remove("open");
      b.card.classList.remove("open");
      open = [];
      busy = false;
    }, 750);
  }
}

cubeButton.addEventListener("click", () => {
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  deal();
  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
  }, 500);
});
jackpot.addEventListener("click", hideWin);
deal();
