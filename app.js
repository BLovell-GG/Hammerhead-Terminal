const terminal = document.getElementById("terminal");
const loginBtn = document.getElementById("loginBtn");

const uiUser = document.getElementById("uiUser");
const uiPass = document.getElementById("uiPass");

const loginPanel = document.getElementById("loginPanel");
const appShell = document.getElementById("appShell");


// ===== POWER GATE =====
const terminalStatus = document.getElementById("terminalStatus");
const powerBtn = document.getElementById("powerBtn");
const powerNote = document.getElementById("powerNote");
const authModule = document.getElementById("authModule");

let terminalPowered = false;

function setStatusOffline() {
    if (!terminalStatus) return;
    terminalStatus.classList.add("off");
    terminalStatus.classList.remove("online");
    terminalStatus.innerHTML = '<span class="dot"></span> STATUS: OFFLINE';
}

function setStatusOnline() {
    if (!terminalStatus) return;
    terminalStatus.classList.remove("off");
    terminalStatus.classList.add("online");
    terminalStatus.innerHTML = '<span class="dot"></span> STATUS: ONLINE';
}

async function runPowerOnSequence() {
    // Keep the vibe tight and UNSC
    terminal.innerHTML = "";
    addLine("FM-FR-2521 RELAY NODE", "dim");
    addLine("POWER SUBSYSTEM: INIT", "dim");
    addLine("—".repeat(34), "dim");
    await sleep(220);

    await typeLine("", "POWER ROUTING .......... OK", { speed: 16, cls: "dim" });
    await sleep(120);
    await typeLine("", "AUX BATTERY ............ ONLINE", { speed: 16, cls: "dim" });
    await sleep(120);
    await typeLine("", "CRYPTO MODULE .......... STANDBY", { speed: 16, cls: "dim" });
    await sleep(120);
    await typeLine("", "AUTH GATE .............. READY", { speed: 16, cls: "dim" });
    await sleep(180);

    addLine("TERMINAL ONLINE", "ok");
    await sleep(160);
}

function lockLoginUI() {
    // Hide auth module + disable login until powered
    if (authModule) authModule.classList.add("hidden");
    setButtonsEnabled(false);
    terminalPowered = false;
    setStatusOffline();
    if (powerBtn) powerBtn.disabled = false;
    if (powerNote) powerNote.textContent = "Terminal power is offline. Activation required.";
}

function unlockLoginUI() {
    if (authModule) authModule.classList.remove("hidden");
    setButtonsEnabled(true);
    terminalPowered = true;
    setStatusOnline();
    if (powerNote) powerNote.textContent = "Power established. Login required.";
}

document.addEventListener("DOMContentLoaded", () => {
    lockLoginUI();

    if (powerBtn) {
        powerBtn.addEventListener("click", async () => {
            if (terminalPowered) return;

            powerBtn.disabled = true;
            if (powerNote) powerNote.textContent = "Power sequence running…";

            await runPowerOnSequence();
            unlockLoginUI();
        });
    }
});
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
      await new Promise(r => setTimeout(r, stepTime));
    }

  } catch (e) {}
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

loginBtn.addEventListener("click", () => {
    if (!terminalPowered) return;
    runLoginSequence();
});

// Initial line
terminal.innerHTML = "";
addLine("STATUS: OFFLINE — POWER REQUIRED", "dim");