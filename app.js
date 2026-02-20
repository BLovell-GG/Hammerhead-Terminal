const terminal = document.getElementById("terminal");
const loginBtn = document.getElementById("loginBtn");

const uiUser = document.getElementById("uiUser");
const uiPass = document.getElementById("uiPass");

const loginPanel = document.getElementById("loginPanel");
const appShell = document.getElementById("appShell");

// ===== MUSIC PLAYLIST =====
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

// HUD elements
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
    await music.play();
    musicToggle.textContent = "PAUSE";
  } catch (e) {
    // Browser blocked (no user gesture yet) — safe to ignore
  }
}

function pauseMusic() {
  music.pause();
  musicToggle.textContent = "PLAY";
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

// Initialize track label without autoplay
loadTrack(0);
pauseMusic();

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
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
        line.textContent = prefix + (mask ? "•".repeat(i + 1) : typedText.slice(0, i + 1));
        scrollTerminal();
        await sleep(speed);
    }

    line.classList.remove("cursor");
    return line;
}

function setButtonsEnabled(enabled) {
    loginBtn.disabled = !enabled;
}

function showApp() {
    loginPanel.classList.add("fadeOut");
    setTimeout(() => {
        loginPanel.style.display = "none";
        appShell.classList.remove("hidden");
    }, 460);
}

async function runLoginSequence() {
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

loginBtn.addEventListener("click", runLoginSequence);

// Initial line
terminal.innerHTML = "";
addLine("Awaiting user interaction…", "dim");