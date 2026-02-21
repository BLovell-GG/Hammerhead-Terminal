// =============================
// UNSC TERMINAL (app.js)
// Power -> Login -> App Shell
// + Sidebar routing
// + Telemetry graphs
// + Shipboard time + campaign meta
// =============================

// ----- Login / terminal elements -----
const terminal = document.getElementById("terminal");
const loginBtn = document.getElementById("loginBtn");
const powerBtn = document.getElementById("powerBtn");
const terminalStatus = document.getElementById("terminalStatus");
const powerNote = document.getElementById("powerNote");
const authModule = document.getElementById("authModule");

const uiUser = document.getElementById("uiUser");
const uiPass = document.getElementById("uiPass");

const loginPanel = document.getElementById("loginPanel");
const appShell = document.getElementById("appShell");

// ----- App shell UI -----
const menuBtn = document.getElementById("menuBtn");
const sideNav = document.getElementById("sideNav");
const sideClose = document.getElementById("sideClose");
const sideBtns = Array.from(document.querySelectorAll(".sideBtn"));
const views = Array.from(document.querySelectorAll(".mapPane .view"));
const nodeSelection = document.getElementById("nodeSelection");
const nodeHint = document.getElementById("nodeHint");

// ----- Time HUD -----
const campDateEl = document.getElementById("campDate");
const shipTimeEl = document.getElementById("shipTime");
const starSystemEl = document.getElementById("starSystem");

// =============================
// MUSIC PLAYLIST
// =============================
const playlist = [
  { title: "Insignificantia", file: "assets/music/halo_wars_insignificantia.ogg" },
  { title: "Spirit of Fire", file: "assets/music/halo_wars_spirit_of_fire.ogg" },
  { title: "Atonement", file: "assets/music/halo4_atonement.ogg" },
  { title: "Defence For Darkness", file: "assets/music/halo3_odst_darkness.ogg" },
  { title: "Vanirs Legacy", file: "assets/music/ixion_vanirs_legacy.ogg" },
];

let currentTrack = 0;
const music = new Audio();
music.loop = true;
music.volume = 0.35;

const musicTrackLabel = document.getElementById("musicTrack");
const musicToggle = document.getElementById("musicToggle");
const musicVol = document.getElementById("musicVol");
const nextTrackBtn = document.getElementById("nextTrack");
const prevTrackBtn = document.getElementById("prevTrack");

function loadTrack(index) {
  currentTrack = index;
  music.src = playlist[currentTrack].file;
  musicTrackLabel.textContent = playlist[currentTrack].title;
  music.load();
}

async function playMusic() {
  try {
    music.volume = 0;
    await music.play();
    musicToggle.textContent = "PAUSE";
    document.getElementById("musicHud").classList.add("playing");

    const targetVolume = Number(musicVol.value) / 100;
    const fadeDuration = 2000;
    const steps = 40;
    const stepTime = fadeDuration / steps;

    for (let i = 0; i <= steps; i++) {
      music.volume = (targetVolume * i) / steps;
      await new Promise((r) => setTimeout(r, stepTime));
    }
  } catch (e) {
    // Autoplay policies may block until user interacts
  }
}

function pauseMusic() {
  music.pause();
  musicToggle.textContent = "PLAY";
  document.getElementById("musicHud").classList.remove("playing");
}

musicToggle.addEventListener("click", () => {
  if (music.paused) playMusic();
  else pauseMusic();
});

nextTrackBtn.addEventListener("click", () => {
  loadTrack((currentTrack + 1) % playlist.length);
  playMusic();
});

prevTrackBtn.addEventListener("click", () => {
  loadTrack((currentTrack - 1 + playlist.length) % playlist.length);
  playMusic();
});

musicVol.addEventListener("input", () => {
  music.volume = Number(musicVol.value) / 100;
});

loadTrack(0);
pauseMusic();

// =============================
// Terminal helpers
// =============================
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function scrollTerminal() {
  terminal.scrollTop = terminal.scrollHeight;
}

function addLine(text, cls = "") {
  const div = document.createElement("div");
  div.className = `line ${cls}`.trim();
  div.textContent = text;
  terminal.appendChild(div);
  scrollTerminal();
  return div;
}

async function typeLine(prefix, typedText, opts = {}) {
  const { speed = 26, mask = false, cls = "" } = opts;
  const line = document.createElement("div");
  line.className = `line cursor ${cls}`.trim();
  line.textContent = prefix;
  terminal.appendChild(line);
  scrollTerminal();

  for (let i = 0; i < typedText.length; i++) {
    line.textContent =
      prefix + (mask ? "•".repeat(i + 1) : typedText.slice(0, i + 1));
    scrollTerminal();
    await sleep(speed);
  }

  line.classList.remove("cursor");
  return line;
}

function setButtonsEnabled(enabled) {
  loginBtn.disabled = !enabled;
}

// =============================
// Power -> Login flow
// =============================
let powered = false;

function setStatusOnline() {
  terminalStatus.classList.remove("off");
  terminalStatus.classList.add("on");
  terminalStatus.innerHTML = '<span class="dot"></span>STATUS: ONLINE';
}

function setStatusOffline() {
  terminalStatus.classList.remove("on");
  terminalStatus.classList.add("off");
  terminalStatus.innerHTML = '<span class="dot"></span>STATUS: OFFLINE';
}

function showAuth() {
  authModule.classList.remove("hidden");
}

function showApp() {
  loginPanel.classList.add("fadeOut");
  setTimeout(() => {
    loginPanel.style.display = "none";
    appShell.classList.remove("hidden");
  }, 460);
}

async function runPowerSequence() {
  if (powered) return;
  powered = true;

  powerBtn.disabled = true;
  powerBtn.textContent = "POWERING…";
  powerNote.textContent = "Power subsystem initializing…";

  terminal.innerHTML = "";
  addLine("FM-FR-2521 RELAY NODE", "dim");
  addLine("POWER SUBSYSTEM: INIT", "dim");
  addLine("—".repeat(34), "dim");
  await sleep(260);

  addLine("Aux battery… ONLINE", "dim");
  await sleep(240);
  addLine("Crypto module… STANDBY", "dim");
  await sleep(240);
  addLine("Routing table… OK", "dim");
  await sleep(260);
  addLine("Terminal power… ONLINE", "ok");
  await sleep(220);

  setStatusOnline();
  showAuth();
  powerBtn.textContent = "POWER ON";
  powerNote.textContent = "Power established. Login required.";
  setButtonsEnabled(true);
}

async function runLoginSequence() {
  if (!powered) return;

  setButtonsEnabled(false);

  // Reset UI
  uiUser.textContent = "—";
  uiPass.textContent = "—";
  terminal.innerHTML = "";

  addLine("FM-FR-2521 RELAY NODE", "dim");
  addLine("MAINFRAME/COMM/OPERATIONS", "dim");
  addLine("—".repeat(34), "dim");
  await sleep(280);

  addLine("Initializing secure session…", "dim");
  await sleep(420);

  // Username
  const user = "CMD_101ST_NOVA";
  uiUser.textContent = "";
  await typeLine("USERNAME: ", user, { speed: 78 });
  uiUser.textContent = user;
  await sleep(180);

  // Password
  const pass = "NOVA-913-DELTA";
  uiPass.textContent = "";
  await typeLine("PASSWORD: ", pass, { speed: 46, mask: true });
  uiPass.textContent = "•".repeat(12);
  await sleep(240);

  addLine("AUTHENTICATING…", "warn");
  await sleep(620);

  addLine("AUTH OK", "ok");
  await sleep(200);

  addLine("Loading BRIDGE interface…", "dim");
  await sleep(360);
  addLine("Syncing contract board…", "dim");
  await sleep(360);
  addLine("Mapping system nodes…", "dim");
  await sleep(360);

  addLine("READY", "ok");
  await sleep(320);

  showApp();
}

powerBtn.addEventListener("click", runPowerSequence);
loginBtn.addEventListener("click", runLoginSequence);

// Initial state
setStatusOffline();
setButtonsEnabled(false);

// =============================
// Sidebar routing
// =============================
const ROUTE_META = {
  map: {
    title: "BRIDGE / SYSTEM MAP",
    hint: "Click a planet to view regions & contracts.",
  },
  contracts: {
    title: "BRIDGE / CONTRACT BOARD",
    hint: "Select a contract to view objectives, payout, and issuer.",
  },
  factions: {
    title: "BRIDGE / FACTION INDEX",
    hint: "Select a faction to view reputation and standing.",
  },
  ship: {
    title: "BRIDGE / SHIP STATUS",
    hint: "Select a module to view integrity and loadout.",
  },
  logs: {
    title: "BRIDGE / OPERATION LOGS",
    hint: "Review system events. Filter by date or tag.",
  },
  settings: {
    title: "BRIDGE / SETTINGS",
    hint: "Adjust audio, visuals, and terminal behavior.",
  },
  lock: {
    title: "BRIDGE / LOCK TERMINAL",
    hint: "Lock returns you to login (future: clearance checks).",
  },
};

function setRoute(route) {
  // Update active button
  sideBtns.forEach((b) => b.classList.toggle("active", b.dataset.route === route));

  // Swap view
  views.forEach((v) => v.classList.toggle("active", v.dataset.view === route));

  // Update app title and node pane
  const appTitle = document.querySelector(".appTitle");
  const meta = ROUTE_META[route] || ROUTE_META.map;
  appTitle.textContent = meta.title;

  nodeSelection.textContent = "None";
  nodeHint.textContent = meta.hint;

  // Special route behavior
  if (route === "lock") {
    // Return to login panel (simple lock)
    location.reload();
  }
}

function openSideNav() {
  sideNav.classList.remove("hidden");
  // allow layout to apply before transition
  requestAnimationFrame(() => sideNav.classList.add("open"));
}

function closeSideNav() {
  sideNav.classList.remove("open");
  // wait for transition
  setTimeout(() => sideNav.classList.add("hidden"), 240);
}

menuBtn?.addEventListener("click", openSideNav);
sideClose?.addEventListener("click", closeSideNav);

sideBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const route = btn.dataset.route;
    setRoute(route);
    closeSideNav();
  });
});

// Default route
setRoute("map");

// =============================
// Telemetry graphs (random walk)
// =============================
const netCanvas = document.getElementById("netGraph");
const cpuCanvas = document.getElementById("cpuGraph");
const netVal = document.getElementById("netVal");
const cpuVal = document.getElementById("cpuVal");

function makeSeries(len, start) {
  const arr = [];
  for (let i = 0; i < len; i++) arr.push(start);
  return arr;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function drawSeries(canvas, series, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // background grid
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(0,200,255,0.10)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }

  // line
  ctx.strokeStyle = "rgba(0,200,255,0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  const min = opts.min ?? 0;
  const max = opts.max ?? 1;
  const dx = w / (series.length - 1);

  for (let i = 0; i < series.length; i++) {
    const v = (series[i] - min) / (max - min);
    const x = i * dx;
    const y = h - v * (h - 2) - 1;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // subtle fill
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "rgba(0,200,255,0.55)";
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

const NET_LEN = 34;
const CPU_LEN = 34;
let netSeries = makeSeries(NET_LEN, 0.35);
let cpuSeries = makeSeries(CPU_LEN, 0.22);

function stepSeries(series, step, min, max) {
  const last = series[series.length - 1];
  const next = clamp(last + (Math.random() - 0.5) * step, min, max);
  series.push(next);
  series.shift();
  return next;
}

setInterval(() => {
  const netNow = stepSeries(netSeries, 0.18, 0.05, 0.95);
  const cpuNow = stepSeries(cpuSeries, 0.14, 0.02, 0.98);

  if (netVal) netVal.textContent = (netNow * 9.81).toFixed(2);
  if (cpuVal) cpuVal.textContent = `${Math.round(cpuNow * 100)}%`;

  drawSeries(netCanvas, netSeries, { min: 0, max: 1 });
  drawSeries(cpuCanvas, cpuSeries, { min: 0, max: 1 });
}, 420);

// =============================
// Time + campaign meta
// =============================
const DEFAULT_CAMPAIGN_DATE = "21 FEB 2518"; // edit later
const DEFAULT_STAR_SYSTEM = "UNKNOWN"; // edit later

function loadMeta() {
  const storedDate = localStorage.getItem("campaignDate");
  const storedSystem = localStorage.getItem("starSystem");

  campDateEl.textContent = storedDate || DEFAULT_CAMPAIGN_DATE;
  starSystemEl.textContent = storedSystem || DEFAULT_STAR_SYSTEM;
}

function updateShipTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  shipTimeEl.textContent = `${hh}:${mm}:${ss}`;
}

// Expose setters (for quick iteration without editing files)
window.setCampaignDate = (value) => {
  localStorage.setItem("campaignDate", String(value));
  loadMeta();
};
window.setStarSystem = (value) => {
  localStorage.setItem("starSystem", String(value));
  loadMeta();
};

loadMeta();
updateShipTime();
setInterval(updateShipTime, 1000);
