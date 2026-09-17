function pocket(n, color) {
  return { key: "g" + n, src: "../images/model" + n + ".png", color, n };
}

const RED = new Set([1, 2, 7, 8, 9, 14, 15]);
const GIRL_NS = [1, 3, 2, 4, 7, 5, 8, 6, 9, 10, 14, 11, 15, 12, 13];
const pockets = [{ key: "0", color: "green", label: "0" }];
for (let i = 0; i < 31; i += 1) {
  const n = GIRL_NS[i % GIRL_NS.length];
  pockets.push(pocket(n, RED.has(n) ? "red" : "black"));
}

const girls = [];
const seen = new Set();
GIRL_NS.forEach((n) => {
  if (seen.has(n)) return;
  seen.add(n);
  girls.push(pocket(n, RED.has(n) ? "red" : "black"));
});
const STRAIGHT = 31;
const EVEN = 1;
const START_BANK = 100;

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const girlsEl = document.getElementById("girls");
const bankEl = document.getElementById("bank");
const statusEl = document.getElementById("status");
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");
const clearBtn = document.getElementById("clearBtn");

const images = {};
let bank = START_BANK;
let chip = 1;
let bets = {};
let angle = 0;
let busy = false;

function slice() {
  return (Math.PI * 2) / pockets.length;
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

function betTotal() {
  return Object.values(bets).reduce((sum, n) => sum + n, 0);
}

function paintStacks() {
  document.querySelectorAll("[data-stack]").forEach((el) => {
    const n = bets[el.dataset.stack] || 0;
    el.textContent = n ? String(n) : "";
    el.classList.toggle("on", n > 0);
  });
  bankEl.textContent = String(bank);
}

function place(key) {
  if (busy) return;
  if (bank < chip) {
    statusEl.textContent = "אין מספיק ז'טונים";
    return;
  }
  bank -= chip;
  bets[key] = (bets[key] || 0) + chip;
  paintStacks();
  statusEl.textContent = "הימור על השולחן. קוביה לסובב";
}

function clearBets() {
  if (busy) return;
  bank += betTotal();
  bets = {};
  paintStacks();
  statusEl.textContent = "ההימורים חזרו לקופה";
}

function drawWheel() {
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const s = slice();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  pockets.forEach((p, i) => {
    const a0 = i * s - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a0 + s);
    ctx.closePath();
    ctx.fillStyle = p.color === "red" ? "#c41e3a" : p.color === "black" ? "#141414" : "#0f7b3a";
    ctx.fill();
    ctx.strokeStyle = "#f0c14b";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.save();
    ctx.rotate(a0 + s / 2);
    if (p.src && images[p.src]) {
      ctx.drawImage(images[p.src], -18, -r + 6, 36, 48);
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 26px Heebo, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("0", 0, -r + 48);
    }
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#111827";
  ctx.fill();
  ctx.strokeStyle = "#f0c14b";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function spinTo(index) {
  return new Promise((resolve) => {
    const s = slice();
    const extra = 6 + Math.floor(Math.random() * 3);
    const target = extra * Math.PI * 2 - (index + 0.5) * s;
    const start = angle;
    let delta = target - start;
    while (delta < extra * Math.PI * 2) delta += Math.PI * 2;
    const dur = 3800;
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      angle = start + delta * easeOut(t);
      drawWheel();
      if (t < 1) window.requestAnimationFrame(frame);
      else resolve();
    }
    window.requestAnimationFrame(frame);
  });
}

function payout(hit) {
  let won = 0;
  const straight = bets[hit.key] || 0;
  if (straight) won += straight * (STRAIGHT + 1);
  if (hit.color === "red" && bets.red) won += bets.red * (EVEN + 1);
  if (hit.color === "black" && bets.black) won += bets.black * (EVEN + 1);
  return { won, straight };
}

async function spin() {
  if (busy) return;
  if (betTotal() === 0) {
    if (bank <= 0) {
      bank = START_BANK;
      paintStacks();
      statusEl.textContent = "קופה חדשה. שים ז'טונים";
      return;
    }
    statusEl.textContent = "שים ז'טון לפני הסיבוב";
    return;
  }
  busy = true;
  hideWin();
  document.querySelectorAll(".hit").forEach((el) => el.classList.remove("hit"));
  cube.classList.add("spin-fast");
  cubeButton.disabled = true;
  statusEl.textContent = "הגלגל מסתובב...";
  const index = Math.floor(Math.random() * pockets.length);
  const hit = pockets[index];
  await spinTo(index);
  const result = payout(hit);
  bank += result.won;
  bets = {};
  paintStacks();
  document.querySelectorAll(".girl-bet, .color-bet, .zero-bet").forEach((el) => {
    el.classList.toggle("hit", el.dataset.bet === hit.key || el.dataset.bet === hit.color);
  });
  if (hit.src && result.straight) {
    statusEl.textContent = `31:1 · +${result.won}`;
    showWin(hit.src);
  } else if (result.won) {
    statusEl.textContent = `שולם ${result.won}`;
  } else if (hit.color === "green") {
    statusEl.textContent = `${hit.label} · בית הקזינו`;
  } else {
    statusEl.textContent = "ההימור נפל";
  }
  cube.classList.remove("spin-fast");
  cubeButton.disabled = false;
  busy = false;
}

function buildTable() {
  girlsEl.innerHTML = "";
  girls.forEach((g) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "girl-bet " + g.color;
    btn.dataset.bet = g.key;
    btn.innerHTML = `<img src="${g.src}" alt=""><em class="stack" data-stack="${g.key}"></em><span>31:1</span>`;
    btn.addEventListener("click", () => place(g.key));
    girlsEl.appendChild(btn);
  });
}

function preload() {
  return Promise.all(
    girls.map(
      (g) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images[g.src] = img;
            resolve();
          };
          img.onerror = resolve;
          img.src = g.src;
        })
    )
  );
}

document.querySelectorAll("[data-chip]").forEach((btn) => {
  btn.addEventListener("click", () => {
    chip = Number(btn.dataset.chip);
    document.querySelectorAll("[data-chip]").forEach((b) => b.classList.toggle("on", b === btn));
  });
});
document.querySelectorAll(".color-bet, .zero-bet").forEach((btn) => {
  btn.addEventListener("click", () => place(btn.dataset.bet));
});
clearBtn.addEventListener("click", clearBets);
cubeButton.addEventListener("click", spin);
jackpot.addEventListener("click", hideWin);
buildTable();
paintStacks();
preload().then(drawWheel);
drawWheel();
