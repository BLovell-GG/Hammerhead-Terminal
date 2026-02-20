const terminal = document.getElementById("terminal");
const loginBtn = document.getElementById("loginBtn");
const skipBtn = document.getElementById("skipBtn");

const loginPanel = document.getElementById("loginPanel");
const appShell = document.getElementById("appShell");

function addLine(text, cls = "") {
  const div = document.createElement("div");
  div.className = `line ${cls}`.trim();
  div.textContent = text;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
  return div;
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function typeLine(prefix, typedText, opts = {}) {
  const { speed = 25, mask = false, cls = "" } = opts;
  const line = document.createElement("div");
  line.className = `line cursor ${cls}`.trim();
  line.textContent = prefix;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;

  for (let i = 0; i < typedText.length; i++) {
    const ch = typedText[i];
    line.textContent = prefix + (mask ? "•".repeat(i + 1) : typedText.slice(0, i + 1));
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(speed);
  }

  line.classList.remove("cursor");
  return line;
}

function setButtonsEnabled(enabled) {
  loginBtn.disabled = !enabled;
  skipBtn.disabled = !enabled;
}

function showApp() {
  loginPanel.style.display = "none";
  appShell.classList.remove("hidden");
}

async function runLoginSequence() {
  setButtonsEnabled(false);
  terminal.innerHTML = "";

  addLine("FM-FR-2521 RELAY NODE", "dim");
  addLine("MAINFRAME/COMM/OPERATIONS", "dim");
  addLine("—".repeat(34), "dim");
  await sleep(300);

  addLine("Initializing secure session…", "dim");
  await sleep(500);

  // Auto-typed credentials (immersion only)
  await typeLine("USERNAME: ", "CMD_101ST_NOVA", { speed: 30 });
  await sleep(200);
  await typeLine("PASSWORD: ", "NOVA-913-DELTA", { speed: 24, mask: true });
  await sleep(300);

  addLine("AUTHENTICATING…", "warn");
  await sleep(650);

  addLine("AUTH OK", "ok");
  await sleep(250);

  addLine("Loading BRIDGE interface…", "dim");
  await sleep(450);
  addLine("Syncing contract board…", "dim");
  await sleep(450);
  addLine("Mapping system nodes…", "dim");
  await sleep(450);

  addLine("READY", "ok");
  await sleep(400);

  // Transition
  showApp();
}

function skipToApp() {
  showApp();
}

loginBtn.addEventListener("click", runLoginSequence);
skipBtn.addEventListener("click", skipToApp);

// Optional: auto-show a hint line on load
terminal.innerHTML = "";
addLine("Awaiting user interaction…", "dim");