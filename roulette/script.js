const models = girlModels();

const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");
const wheel = document.getElementById("wheel");
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");

const photos = models.map((src) => {
  const image = new Image();
  image.src = src;
  return image;
});

let busy = false;
let currentRotation = 0;
let lastIndex = -1;

function sliceAngle() {
  return (Math.PI * 2) / models.length;
}

function sliceDeg() {
  return 360 / models.length;
}

function drawWheel() {
  const size = wheel.clientWidth;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 2;
  const slice = sliceAngle();

  photos.forEach((photo, index) => {
    const start = -Math.PI / 2 + index * slice;
    const end = start + slice;
    const mid = start + slice / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.clip();

    ctx.translate(cx, cy);
    ctx.rotate(mid + Math.PI / 2);
    const width = Math.max(radius * 1.2, 2 * radius * Math.sin(slice / 2) + 40);
    ctx.drawImage(photo, -width / 2, -radius, width, radius);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.strokeStyle = "#f0c14b";
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.setAttribute("aria-hidden", "true");
  jackpot.classList.remove("visible");
}

function showWin(index) {
  winnerPhoto.src = models[index];
  jackpot.hidden = false;
  jackpot.setAttribute("aria-hidden", "false");
  jackpot.classList.add("visible");
}

function randomIndex() {
  let index = Math.floor(Math.random() * models.length);
  if (models.length > 1) {
    while (index === lastIndex) {
      index = Math.floor(Math.random() * models.length);
    }
  }
  lastIndex = index;
  return index;
}

function spin() {
  if (busy) return;
  busy = true;
  hideWin();
  statusEl.textContent = "מסתובב...";
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;

  const index = randomIndex();
  const extraTurns = 5 + Math.floor(Math.random() * 3);
  const landing = 360 - (index * sliceDeg() + sliceDeg() / 2);
  const base = Math.ceil(currentRotation / 360) * 360;
  const target = base + extraTurns * 360 + landing;
  currentRotation = target;

  wheel.style.transition = "transform 4.6s cubic-bezier(0.12, 0.65, 0.08, 1)";
  wheel.style.transform = `rotate(${target}deg)`;

  window.setTimeout(() => {
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;
    statusEl.textContent = "זכית בבחורה";
    showWin(index);
  }, 4700);
}

cubeButton.addEventListener("click", spin);
jackpot.addEventListener("click", hideWin);
window.addEventListener("resize", drawWheel);

Promise.all(
  photos.map(
    (photo) =>
      new Promise((resolve) => {
        if (photo.complete) {
          resolve();
          return;
        }
        photo.onload = () => resolve();
        photo.onerror = () => resolve();
      })
  )
).then(drawWheel);
