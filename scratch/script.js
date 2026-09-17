const models = girlModels();

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const spots = [...document.querySelectorAll("[data-spot]")];

let current = [0, 1, 2];
let revealed = [false, false, false];
let judged = false;
let activeIndex = -1;

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

function paintFoil(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  gradient.addColorStop(0, "#cfd8dc");
  gradient.addColorStop(0.5, "#90a4ae");
  gradient.addColorStop(1, "#eceff1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "rgba(80, 80, 80, 0.75)";
  ctx.font = "700 18px Heebo, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("גרד כאן", rect.width / 2, rect.height / 2);
}

function scratchedPercent(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let clear = 0;
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] < 40) clear += 1;
  }
  return clear / (data.length / 16);
}

function scratchAt(index, event) {
  const canvas = spots[index].querySelector("canvas");
  const rect = canvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  const x = point.clientX - rect.left;
  const y = point.clientY - rect.top;
  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
}

function maybeReveal(index) {
  if (revealed[index]) return;
  const canvas = spots[index].querySelector("canvas");
  if (scratchedPercent(canvas) < 0.42) return;
  revealed[index] = true;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  if (revealed.every(Boolean) && !judged) {
    judged = true;
    const won = current[0] === current[1] && current[1] === current[2];
    if (won) {
      statusEl.textContent = "שלוש זהות!";
      showWin();
    } else {
      statusEl.textContent = "נסה כרטיס חדש";
    }
  }
}

function newTicket() {
  hideWin();
  judged = false;
  revealed = [false, false, false];
  activeIndex = -1;
  current = [randomIndex(), randomIndex(), randomIndex()];
  statusEl.textContent = "גרד את הכסף כדי לחשוף";
  cube.classList.add("spin-fast");

  spots.forEach((spot, index) => {
    spot.querySelector("img").src = models[current[index]];
    paintFoil(spot.querySelector("canvas"));
  });

  window.setTimeout(() => cube.classList.remove("spin-fast"), 700);
}

spots.forEach((spot, index) => {
  const canvas = spot.querySelector("canvas");
  canvas.addEventListener("pointerdown", (event) => {
    activeIndex = index;
    canvas.setPointerCapture(event.pointerId);
    scratchAt(index, event);
    event.preventDefault();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (activeIndex !== index) return;
    scratchAt(index, event);
    maybeReveal(index);
  });
  canvas.addEventListener("pointerup", () => {
    if (activeIndex === index) maybeReveal(index);
    activeIndex = -1;
  });
});

cubeButton.addEventListener("click", newTicket);
jackpot.addEventListener("click", hideWin);
window.addEventListener("resize", () => {
  spots.forEach((spot, index) => {
    if (!revealed[index]) paintFoil(spot.querySelector("canvas"));
  });
});

window.addEventListener("load", newTicket);
