const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const gameOverPanel = document.getElementById("gameOver");
const playButton = document.getElementById("playButton");
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton");
const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const multiplierEl = document.getElementById("multiplier");
const finalScoreEl = document.getElementById("finalScore");
const finalCoinsEl = document.getElementById("finalCoins");
const bestScoreEl = document.getElementById("bestScore");
const bankCoinsEl = document.getElementById("bankCoins");

const storage = {
  best: Number(localStorage.getItem("rrr-best") || 0),
  coins: Number(localStorage.getItem("rrr-coins") || 0)
};

const state = {
  mode: "menu",
  lastTime: 0,
  distance: 0,
  score: 0,
  coins: 0,
  speed: 24,
  spawnTimer: 0,
  coinTimer: 0,
  patternTimer: 0,
  multiplier: 1,
  shake: 0
};

const player = {
  lane: 1,
  targetLane: 1,
  x: 0,
  y: 0,
  z: 0,
  vz: 0,
  sliding: 0
};

let obstacles = [];
let coins = [];
let particles = [];

const lanes = [-1, 0, 1];
const laneColors = ["#b87735", "#d08b3c", "#b87735"];

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function resetGame() {
  state.mode = "running";
  state.lastTime = performance.now();
  state.distance = 0;
  state.score = 0;
  state.coins = 0;
  state.speed = 24;
  state.spawnTimer = 0;
  state.coinTimer = 0;
  state.patternTimer = 0;
  state.multiplier = 1;
  state.shake = 0;
  player.lane = 1;
  player.targetLane = 1;
  player.z = 0;
  player.vz = 0;
  player.sliding = 0;
  obstacles = [];
  coins = [];
  particles = [];
  menu.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  hud.classList.remove("hidden");
  updateHud();
}

function endGame() {
  state.mode = "over";
  state.shake = 18;
  storage.best = Math.max(storage.best, Math.floor(state.score));
  storage.coins += state.coins;
  localStorage.setItem("rrr-best", storage.best);
  localStorage.setItem("rrr-coins", storage.coins);
  finalScoreEl.textContent = Math.floor(state.score);
  finalCoinsEl.textContent = state.coins;
  bestScoreEl.textContent = storage.best;
  bankCoinsEl.textContent = storage.coins;
  gameOverPanel.classList.remove("hidden");
}

function togglePause() {
  if (state.mode === "running") {
    state.mode = "paused";
    pauseButton.textContent = ">";
  } else if (state.mode === "paused") {
    state.mode = "running";
    state.lastTime = performance.now();
    pauseButton.textContent = "II";
  }
}

function jump() {
  if (state.mode !== "running" || player.z > 0) return;
  player.vz = 19;
}

function slide() {
  if (state.mode !== "running") return;
  player.sliding = 0.52;
}

function moveLane(dir) {
  if (state.mode !== "running") return;
  player.targetLane = Math.max(0, Math.min(2, player.targetLane + dir));
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const types = ["train", "barrier", "low"];
  const type = types[Math.floor(Math.random() * types.length)];
  obstacles.push({
    lane,
    type,
    y: -180,
    length: type === "train" ? 185 : 62,
    hit: false
  });

  if (Math.random() < 0.42) {
    const safeLane = (lane + (Math.random() < 0.5 ? 1 : 2)) % 3;
    spawnCoinLine(safeLane, -250, 7);
  }
}

function spawnCoinLine(lane, startY, count) {
  for (let i = 0; i < count; i += 1) {
    coins.push({
      lane,
      y: startY - i * 58,
      z: i % 3 === 1 ? 30 : 0,
      taken: false,
      spin: Math.random() * Math.PI
    });
  }
}

function addParticles(x, y, color) {
  for (let i = 0; i < 8; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.5) * 220,
      life: 0.38,
      color
    });
  }
}

function update(dt) {
  if (state.mode !== "running") return;
  state.distance += state.speed * dt;
  state.speed = Math.min(48, state.speed + dt * 0.55);
  state.multiplier = Math.min(6, 1 + Math.floor(state.distance / 550));
  state.score += state.speed * dt * 9 * state.multiplier;
  state.spawnTimer -= dt;
  state.coinTimer -= dt;

  if (state.spawnTimer <= 0) {
    spawnObstacle();
    state.spawnTimer = Math.max(0.62, 1.35 - state.speed / 60);
  }

  if (state.coinTimer <= 0) {
    spawnCoinLine(Math.floor(Math.random() * 3), -160, 6);
    state.coinTimer = 1.15;
  }

  const laneEase = 1 - Math.pow(0.001, dt);
  player.lane += (player.targetLane - player.lane) * laneEase;
  player.vz -= 45 * dt;
  player.z = Math.max(0, player.z + player.vz * dt);
  if (player.z === 0 && player.vz < 0) player.vz = 0;
  player.sliding = Math.max(0, player.sliding - dt);

  const scroll = state.speed * dt * 56;
  obstacles.forEach((item) => {
    item.y += scroll;
  });
  coins.forEach((coin) => {
    coin.y += scroll;
    coin.spin += dt * 8;
  });

  const p = projectLane(player.lane, 620);
  player.x = p.x;
  player.y = p.y - player.z;

  obstacles.forEach((item) => {
    if (item.hit) return;
    const nearPlayer = item.y > 545 && item.y < 710;
    const sameLane = Math.abs(item.lane - player.lane) < 0.34;
    if (!nearPlayer || !sameLane) return;

    if (item.type === "low" && player.sliding > 0) return;
    if (item.type === "barrier" && player.z > 58) return;
    endGame();
    item.hit = true;
  });

  coins.forEach((coin) => {
    if (coin.taken) return;
    const nearPlayer = coin.y > 560 && coin.y < 705;
    const sameLane = Math.abs(coin.lane - player.lane) < 0.42;
    const heightOk = Math.abs(coin.z - player.z) < 58;
    if (nearPlayer && sameLane && heightOk) {
      coin.taken = true;
      state.coins += 1;
      state.score += 80 * state.multiplier;
      const c = projectLane(coin.lane, coin.y);
      addParticles(c.x, c.y - coin.z, "#ffe23a");
    }
  });

  particles.forEach((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  });

  obstacles = obstacles.filter((item) => item.y < window.innerHeight + 260);
  coins = coins.filter((coin) => !coin.taken && coin.y < window.innerHeight + 120);
  particles = particles.filter((particle) => particle.life > 0);
  updateHud();
}

function projectLane(lane, y) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const horizon = h * 0.24;
  const depth = Math.max(0, Math.min(1, (y - horizon) / (h * 0.76)));
  const laneWidth = 36 + depth * 145;
  const center = w / 2;
  return {
    x: center + lanes[Math.round(lane)] * laneWidth + (lane - Math.round(lane)) * laneWidth,
    y
  };
}

function laneX(lane, y) {
  return projectLane(lane, y).x;
}

function drawWorld() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const horizon = h * 0.24;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#77cbff");
  sky.addColorStop(0.5, "#8de4ff");
  sky.addColorStop(1, "#f6bd58");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawSun(w * 0.73, h * 0.13);
  drawMountains(horizon);
  drawMarket(horizon);
  drawTracks(horizon);
}

function drawSun(x, y) {
  ctx.fillStyle = "#ffe369";
  ctx.beginPath();
  ctx.arc(x, y, 44, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountains(horizon) {
  const w = window.innerWidth;
  ctx.fillStyle = "#26a8dc";
  ctx.beginPath();
  ctx.moveTo(0, horizon + 25);
  for (let x = 0; x <= w + 120; x += 120) {
    ctx.lineTo(x + 65, horizon - 88 - Math.sin(x) * 22);
    ctx.lineTo(x + 130, horizon + 25);
  }
  ctx.lineTo(w, horizon + 80);
  ctx.lineTo(0, horizon + 80);
  ctx.fill();
}

function drawMarket(horizon) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (let i = 0; i < 9; i += 1) {
    const y = horizon + i * 82;
    const scale = i / 9;
    drawStall(30 + scale * 50, y, "left", i);
    drawStall(w - 30 - scale * 50, y, "right", i);
  }
  ctx.fillStyle = "#176c32";
  for (let i = 0; i < 8; i += 1) {
    const x = (i % 2 === 0 ? 65 : w - 65) + Math.sin(i) * 22;
    const y = horizon + i * 105;
    ctx.fillRect(x - 9, y - 80, 18, 95);
    ctx.beginPath();
    ctx.moveTo(x, y - 150);
    ctx.lineTo(x - 92, y - 70);
    ctx.lineTo(x + 12, y - 92);
    ctx.lineTo(x + 82, y - 64);
    ctx.closePath();
    ctx.fill();
  }
}

function drawStall(x, y, side, i) {
  const depth = Math.min(1, y / window.innerHeight);
  const width = 90 + depth * 120;
  const height = 36 + depth * 80;
  const dir = side === "left" ? 1 : -1;
  ctx.fillStyle = i % 2 ? "#b7432d" : "#8e623b";
  ctx.fillRect(x - (side === "left" ? width : 0), y - height, width, height);
  const awning = ["#ff4935", "#1f75ff", "#ffd829", "#10bd78"][i % 4];
  ctx.fillStyle = awning;
  ctx.beginPath();
  ctx.moveTo(x, y - height);
  ctx.lineTo(x + dir * width * 0.9, y - height + 5);
  ctx.lineTo(x + dir * width * 0.7, y - height + 28);
  ctx.lineTo(x - dir * 8, y - height + 22);
  ctx.closePath();
  ctx.fill();
}

function drawTracks(horizon) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.fillStyle = "#e2ad5b";
  ctx.beginPath();
  ctx.moveTo(w * 0.42, horizon);
  ctx.lineTo(w * 0.58, horizon);
  ctx.lineTo(w * 0.86, h);
  ctx.lineTo(w * 0.14, h);
  ctx.closePath();
  ctx.fill();

  for (let lane = 0; lane < 3; lane += 1) {
    ctx.fillStyle = laneColors[lane];
    const topLeft = laneX(lane, horizon) - 18;
    const topRight = laneX(lane, horizon) + 18;
    const botLeft = laneX(lane, h) - 74;
    const botRight = laneX(lane, h) + 74;
    ctx.beginPath();
    ctx.moveTo(topLeft, horizon);
    ctx.lineTo(topRight, horizon);
    ctx.lineTo(botRight, h);
    ctx.lineTo(botLeft, h);
    ctx.closePath();
    ctx.fill();
  }

  for (let lane = 0; lane < 3; lane += 1) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.strokeStyle = "#465d5d";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(laneX(lane, horizon) + side * 18, horizon);
      ctx.lineTo(laneX(lane, h) + side * 74, h);
      ctx.stroke();
      ctx.strokeStyle = "#a8c0b7";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#8a5229";
  for (let y = horizon + 18; y < h + 80; y += 62) {
    const depth = (y - horizon) / (h - horizon);
    for (let lane = 0; lane < 3; lane += 1) {
      const x = laneX(lane, y);
      const len = 36 + depth * 70;
      ctx.fillRect(x - len / 2, y, len, 10 + depth * 8);
    }
  }
}

function drawObstacle(item) {
  const p = projectLane(item.lane, item.y);
  const depth = Math.max(0.18, item.y / window.innerHeight);
  const width = item.type === "train" ? 92 * depth : 82 * depth;
  const height = item.type === "train" ? 150 * depth : 78 * depth;

  if (item.type === "train") {
    ctx.fillStyle = "#df3e24";
    ctx.fillRect(p.x - width / 2, p.y - height, width, height);
    ctx.fillStyle = "#f3eee2";
    ctx.fillRect(p.x - width * 0.36, p.y - height * 0.82, width * 0.72, height * 0.36);
    ctx.fillStyle = "#173d45";
    ctx.fillRect(p.x - width * 0.22, p.y - height * 0.75, width * 0.44, height * 0.2);
    ctx.fillStyle = "#333333";
    ctx.fillRect(p.x - width / 2, p.y - height * 0.12, width, height * 0.12);
    return;
  }

  if (item.type === "barrier") {
    ctx.fillStyle = "#e3382b";
    ctx.fillRect(p.x - width / 2, p.y - height, width, height);
    ctx.fillStyle = "#ffffff";
    for (let i = -1; i <= 1; i += 1) {
      ctx.fillRect(p.x + i * width * 0.24 - 8 * depth, p.y - height, 16 * depth, height);
    }
    return;
  }

  ctx.fillStyle = "#6b3d24";
  ctx.fillRect(p.x - width / 2, p.y - height * 0.45, width, height * 0.45);
  ctx.fillStyle = "#ffdc37";
  ctx.fillRect(p.x - width / 2, p.y - height * 0.58, width, height * 0.16);
}

function drawCoin(coin) {
  const p = projectLane(coin.lane, coin.y);
  const depth = Math.max(0.18, coin.y / window.innerHeight);
  const radius = 15 * depth;
  const squash = Math.abs(Math.cos(coin.spin)) * 0.75 + 0.25;
  ctx.save();
  ctx.translate(p.x, p.y - coin.z * depth);
  ctx.scale(squash, 1);
  ctx.fillStyle = "#ffb11f";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff06c";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;
  const slide = player.sliding > 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 48 + player.z, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.scale(slide ? 1.18 : 1, slide ? 0.66 : 1);
  ctx.fillStyle = "#e34426";
  ctx.beginPath();
  ctx.arc(0, -58, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd09b";
  ctx.beginPath();
  ctx.arc(0, -39, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f9bd1";
  ctx.fillRect(-17, -18, 34, 42);
  ctx.fillStyle = "#f04f35";
  ctx.fillRect(-24, -18, 48, 14);
  ctx.strokeStyle = "#ffd09b";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-18, -8);
  ctx.lineTo(-34, 17);
  ctx.moveTo(18, -8);
  ctx.lineTo(34, 17);
  ctx.stroke();
  ctx.strokeStyle = "#264b7c";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-10, 22);
  ctx.lineTo(-18, 52);
  ctx.moveTo(10, 22);
  ctx.lineTo(20, 52);
  ctx.stroke();
  ctx.fillStyle = "#2ebc65";
  ctx.fillRect(-28, 48, 20, 9);
  ctx.fillRect(8, 48, 22, 9);
  ctx.restore();
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life / 0.38);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function render() {
  ctx.save();
  if (state.shake > 0) {
    state.shake *= 0.82;
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }
  drawWorld();
  [...coins].sort((a, b) => a.y - b.y).forEach(drawCoin);
  [...obstacles].sort((a, b) => a.y - b.y).forEach(drawObstacle);
  drawPlayer();
  drawParticles();
  if (state.mode === "paused") drawPauseOverlay();
  ctx.restore();
}

function drawPauseOverlay() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 54px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Paused", window.innerWidth / 2, window.innerHeight / 2);
}

function updateHud() {
  scoreEl.textContent = String(Math.floor(state.score)).padStart(6, "0");
  coinsEl.textContent = state.coins;
  multiplierEl.textContent = `x${state.multiplier}`;
}

function gameLoop(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function handleKey(event) {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") moveLane(-1);
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") moveLane(1);
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w" || event.key === " ") jump();
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") slide();
  if (event.key.toLowerCase() === "p") togglePause();
}

let touchStart = null;
function onTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd(event) {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    moveLane(dx > 0 ? 1 : -1);
  } else if (dy < 0) {
    jump();
  } else {
    slide();
  }
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", handleKey);
canvas.addEventListener("touchstart", onTouchStart, { passive: true });
canvas.addEventListener("touchend", onTouchEnd, { passive: true });
playButton.addEventListener("click", resetGame);
restartButton.addEventListener("click", resetGame);
pauseButton.addEventListener("click", togglePause);

bestScoreEl.textContent = storage.best;
bankCoinsEl.textContent = storage.coins;
resize();
requestAnimationFrame(gameLoop);

