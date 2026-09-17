const START_BANK = 100;
const WHEEL_ORDER = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
  "00", 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
];
const RED_NUMS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const THIN = [1, 2, 7, 8, 9, 14, 15, 16, 17, 18];
const FAT = [3, 4, 5, 6, 10, 11, 12, 13];

const photoOf = {};
let thinI = 0;
let fatI = 0;
for (let n = 1; n <= 36; n += 1) {
  if (RED_NUMS.has(n)) {
    photoOf[n] = THIN[thinI % THIN.length];
    thinI += 1;
  } else {
    photoOf[n] = FAT[fatI % FAT.length];
    fatI += 1;
  }
}
photoOf[0] = THIN[0];
photoOf["00"] = FAT[0];

function pocketFrom(id) {
  const key = String(id);
  const color = id === 0 || id === "00" ? "green" : RED_NUMS.has(Number(id)) ? "red" : "black";
  const girl = photoOf[id];
  return {
    key,
    n: typeof id === "number" ? id : 0,
    label: key,
    color,
    src: "../images/model" + girl + ".png",
  };
}

const pockets = WHEEL_ORDER.map(pocketFrom);
const byKey = {};
pockets.forEach((p) => {
  byKey[p.key] = p;
});

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const layoutEl = document.getElementById("layout");
const bankEl = document.getElementById("bank");
const statusEl = document.getElementById("status");
const cubeButton = document.getElementById("cubeButton");
const cube = document.getElementById("cube");
const jackpot = document.getElementById("jackpot");
const winnerPhoto = document.getElementById("winnerPhoto");
const clearBtn = document.getElementById("clearBtn");
const reloadBtn = document.getElementById("reloadBtn");

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

function oddsFor(key) {
  if (key === "0" || key === "00" || /^\d+$/.test(key)) return 35;
  if (["d1", "d2", "d3", "c1", "c2", "c3"].includes(key)) return 2;
  return 1;
}

function hits(key, pocket) {
  if (key === pocket.key) return true;
  if (pocket.color === "green") return false;
  const n = pocket.n;
  if (key === "red") return pocket.color === "red";
  if (key === "black") return pocket.color === "black";
  if (key === "even") return n % 2 === 0;
  if (key === "odd") return n % 2 === 1;
  if (key === "low") return n >= 1 && n <= 18;
  if (key === "high") return n >= 19 && n <= 36;
  if (key === "d1") return n >= 1 && n <= 12;
  if (key === "d2") return n >= 13 && n <= 24;
  if (key === "d3") return n >= 25 && n <= 36;
  if (key === "c1") return n % 3 === 1;
  if (key === "c2") return n % 3 === 2;
  if (key === "c3") return n % 3 === 0;
  return false;
}

function paintMoney() {
  bankEl.textContent = String(bank);
  const broke = bank <= 0 && betTotal() === 0;
  reloadBtn.hidden = !broke;
  cubeButton.disabled = busy || broke;
}

function paintStacks() {
  document.querySelectorAll("[data-stack]").forEach((el) => {
    const n = bets[el.dataset.stack] || 0;
    el.textContent = n ? String(n) : "";
    el.classList.toggle("on", n > 0);
  });
  paintMoney();
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
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a0 + s);
    ctx.closePath();
    ctx.clip();
    ctx.rotate(a0 + s / 2 + Math.PI / 2);
    if (p.src && images[p.src]) {
      ctx.drawImage(images[p.src], -24, -r + 4, 48, 70);
    }
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.font = "bold 13px Heebo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(p.label, 0, -r + 82);
    ctx.fillText(p.label, 0, -r + 82);
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fillStyle = "#111827";
  ctx.fill();
  ctx.strokeStyle = "#f0c14b";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#f0c14b";
  ctx.font = "bold 13px Heebo, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("38", 0, 0);
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
  let straight = 0;
  Object.keys(bets).forEach((key) => {
    if (!hits(key, hit)) return;
    const odds = oddsFor(key);
    won += bets[key] * (odds + 1);
    if (odds === 35) straight += bets[key];
  });
  return { won, straight };
}

async function spin() {
  if (busy) return;
  if (betTotal() === 0) {
    if (bank <= 0) {
      paintMoney();
      statusEl.textContent = "נגמרו הז'טונים";
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
  document.querySelectorAll("[data-bet]").forEach((el) => {
    el.classList.toggle("hit", hits(el.dataset.bet, hit));
  });
  if (result.straight) {
    statusEl.textContent = `${hit.label} · 35:1 · +${result.won}`;
    showWin(hit.src);
  } else if (result.won) {
    statusEl.textContent = `${hit.label} · שולם ${result.won}`;
  } else if (hit.color === "green") {
    statusEl.textContent = `${hit.label} · בית הקזינו`;
  } else {
    statusEl.textContent = `${hit.label} · ההימור נפל`;
  }
  cube.classList.remove("spin-fast");
  cubeButton.disabled = false;
  busy = false;
  paintMoney();
}

function spot(key, className, inner) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.dataset.bet = key;
  btn.innerHTML = inner + `<em class="stack" data-stack="${key}"></em>`;
  btn.addEventListener("click", () => place(key));
  return btn;
}

function numSpot(id) {
  const p = byKey[String(id)];
  return spot(
    p.key,
    "spot num " + p.color,
    `<img src="${p.src}" alt=""><span class="num-label">${p.label}</span>`
  );
}

function buildTable() {
  layoutEl.innerHTML = "";
  const zeros = document.createElement("div");
  zeros.className = "zeros";
  zeros.appendChild(numSpot("00"));
  zeros.appendChild(numSpot(0));
  layoutEl.appendChild(zeros);

  const numsWrap = document.createElement("div");
  numsWrap.className = "nums-wrap";
  const nums = document.createElement("div");
  nums.className = "nums";
  for (let col = 0; col < 12; col += 1) {
    nums.appendChild(numSpot(col * 3 + 3));
    nums.appendChild(numSpot(col * 3 + 2));
    nums.appendChild(numSpot(col * 3 + 1));
  }
  const cols = document.createElement("div");
  cols.className = "cols";
  cols.appendChild(spot("c3", "spot outside", `<span>2:1</span>`));
  cols.appendChild(spot("c2", "spot outside", `<span>2:1</span>`));
  cols.appendChild(spot("c1", "spot outside", `<span>2:1</span>`));
  numsWrap.appendChild(nums);
  numsWrap.appendChild(cols);
  layoutEl.appendChild(numsWrap);

  const dozens = document.createElement("div");
  dozens.className = "dozens";
  dozens.appendChild(spot("d1", "spot outside", `<span>1st 12</span><strong>2:1</strong>`));
  dozens.appendChild(spot("d2", "spot outside", `<span>2nd 12</span><strong>2:1</strong>`));
  dozens.appendChild(spot("d3", "spot outside", `<span>3rd 12</span><strong>2:1</strong>`));
  layoutEl.appendChild(dozens);

  const outside = document.createElement("div");
  outside.className = "outside-row";
  outside.appendChild(spot("low", "spot outside", `<span>1-18</span><strong>1:1</strong>`));
  outside.appendChild(spot("even", "spot outside", `<span>EVEN</span><strong>1:1</strong>`));
  outside.appendChild(spot("red", "spot outside red", `<span>אדום</span><strong>1:1</strong>`));
  outside.appendChild(spot("black", "spot outside black", `<span>שחור</span><strong>1:1</strong>`));
  outside.appendChild(spot("odd", "spot outside", `<span>ODD</span><strong>1:1</strong>`));
  outside.appendChild(spot("high", "spot outside", `<span>19-36</span><strong>1:1</strong>`));
  layoutEl.appendChild(outside);
}

function preload() {
  const srcs = [...new Set(pockets.map((p) => p.src))];
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images[src] = img;
            resolve();
          };
          img.onerror = resolve;
          img.src = src;
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
clearBtn.addEventListener("click", clearBets);
cubeButton.addEventListener("click", spin);
reloadBtn.addEventListener("click", () => {
  bank = START_BANK;
  bets = {};
  paintStacks();
  statusEl.textContent = "נטענו 100 ז'טונים";
});
jackpot.addEventListener("click", hideWin);
buildTable();
paintStacks();
preload().then(drawWheel);
drawWheel();
