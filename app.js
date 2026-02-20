const terminal = document.getElementById("terminal");
const loginBtn = document.getElementById("loginBtn");

const uiUser = document.getElementById("uiUser");
const uiPass = document.getElementById("uiPass");

const loginPanel = document.getElementById("loginPanel");
const appShell = document.getElementById("appShell");

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