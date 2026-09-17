const models = [
  "../images/model1.png",
  "../images/model2.png",
  "../images/model3.png",
  "../images/model4.png",
  "../images/model5.png",
  "../images/model6.png",
  "../images/model7.png",
];

const LOOPS = 18;
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const statusEl = document.getElementById("status");
const jackpot = document.getElementById("jackpot");
const machine = document.getElementById("machine");
const strips = [...document.querySelectorAll("[data-strip]")];

models.forEach((src) => {
  const preload = new Image();
  preload.src = src;
});

strips.forEach((strip) => {
  strip.innerHTML = "";
  for (let loop = 0; loop < LOOPS; loop += 1) {
    models.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "בחורה";
      strip.appendChild(img);
    });
  }
});

let busy = false;
let currentStops = [0, 1, 2];

function itemHeight() {
  const sample = strips[0].querySelector("img");
  return sample?.getBoundingClientRect().height || strips[0].parentElement.clientHeight;
}

function layoutStrips() {
  strips.forEach((strip, index) => snapTo(strip, currentStops[index]));
}

function randomIndex() {
  return Math.floor(Math.random() * models.length);
}

function hideWin() {
  jackpot.hidden = true;
  jackpot.setAttribute("aria-hidden", "true");
  jackpot.classList.remove("visible");
  machine.classList.remove("winner");
  document.body.classList.remove("is-win");
}

function showWin() {
  statusEl.textContent = "";
  jackpot.hidden = false;
  jackpot.setAttribute("aria-hidden", "false");
  jackpot.classList.add("visible");
  machine.classList.add("winner");
  document.body.classList.add("is-win");
}

function snapTo(strip, stopIndex) {
  strip.style.transition = "none";
  strip.style.transform = `translateY(${-stopIndex * itemHeight()}px)`;
}

function spin(forcedStops) {
  if (busy) return;
  busy = true;
  hideWin();
  statusEl.textContent = "מסתובב...";
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;

  const stops = forcedStops ?? [randomIndex(), randomIndex(), randomIndex()];
  const height = itemHeight();

  strips.forEach((strip, index) => {
    snapTo(strip, currentStops[index]);
    void strip.offsetHeight;

    const extraLoops = 8 + index * 3;
    const target = extraLoops * models.length + stops[index];
    const duration = 1.1 + index * 0.55;

    strip.style.transition = `transform ${duration}s cubic-bezier(0.12, 0.72, 0.18, 1)`;
    strip.style.transform = `translateY(${-target * height}px)`;
  });

  const settleMs = (1.1 + 2 * 0.55) * 1000 + 180;
  window.setTimeout(() => {
    strips.forEach((strip, index) => snapTo(strip, stops[index]));
    currentStops = stops;
    cube.classList.remove("spin-fast");
    cubeButton.disabled = false;
    busy = false;

    const won = stops[0] === stops[1] && stops[1] === stops[2];
    if (won) {
      showWin();
    } else {
      statusEl.textContent = "נסה שוב";
    }
  }, settleMs);
}

cubeButton.addEventListener("click", () => spin());

jackpot.addEventListener("click", () => {
  hideWin();
  statusEl.textContent = "לחץ על הקוביה לסיבוב נוסף";
});

window.addEventListener("resize", () => {
  strips.forEach((strip, index) => snapTo(strip, currentStops[index]));
});

requestAnimationFrame(layoutStrips);
window.addEventListener("load", layoutStrips);
