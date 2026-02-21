/* FM-FR-2521 // UNSC Command Terminal (static web) */
/* Cold UNSC bridge console UI — power-on → login → app shell */

(() => {
    // ---------- CONFIG ----------
    // Change these when you want.
    const CAMPAIGN_DATE = "21 FEB 2518";
    const STAR_SYSTEM = "UNKNOWN";
    const REQUIRED_PASSWORD = "FR-2521"; // placeholder (can be changed later)

    // Music playlist (ogg). Paths are relative to site root.
    const PLAYLIST = [
        { name: "INSIGNIFICANTIA", src: "assets/music/halo_wars_insignificantia.ogg" },
        { name: "SPIRIT OF FIRE", src: "assets/music/halo_wars_spirit_of_fire.ogg" },
        { name: "ODST // DARKNESS", src: "assets/music/halo3_odst_darkness.ogg" },
        { name: "ATONEMENT", src: "assets/music/halo4_atonement.ogg" },
        { name: "IXION // VANIR'S LEGACY", src: "assets/music/ixion_vanirs_legacy.ogg" },
    ];

    // ---------- DOM ----------
    const $ = (sel) => document.querySelector(sel);

    const powerBtn = $("#powerBtn");
    const powerNote = $("#powerNote");
    const terminalStatus = $("#terminalStatus");

    const authModule = $("#authModule");
    const terminal = $("#terminal");
    const loginBtn = $("#loginBtn");
    const uiUser = $("#uiUser");
    const uiPass = $("#uiPass");

    const loginScreen = $("#loginPanel") || $("#loginScreen");
    const appShell = $("#appShell");
    const appEl = document.querySelector(".app");

    const menuBtn = $("#menuBtn");
    const sideNav = document.getElementById("sideNav");
    const sideClose = $("#sideClose");
    const sideOverlay = document.getElementById("sideOverlay");
    const sideBtns = Array.from(document.querySelectorAll(".sideBtn"));
    const views = Array.from(document.querySelectorAll(".view[data-view]"));

    const appTitle = $("#appTitle");
    const appSub = $("#appSub");

    // Telemetry graphs
    const netVal = $("#netVal");
    const cpuVal = $("#cpuVal");
    const netGraph = $("#netCanvas");
    const cpuGraph = $("#cpuCanvas");

    // Music HUD
    const musicTrack = $("#musicTrack");
    const musicToggle = $("#musicToggle");
    const prevTrack = $("#prevTrack");
    const nextTrack = $("#nextTrack");
    const musicVol = $("#musicVol");
    const musicProgress = $("#musicProgress");
    const mTimeCur = $("#mTimeCur");
    const mTimeDur = $("#mTimeDur");

    // Time HUD
    const campDate = $("#campDate");
    const shipTime = $("#shipTime");
    const starSystem = $("#starSystem");

    // ---------- SAFE GUARDS ----------
    if (!powerBtn || !loginBtn || !terminal || !appShell) return;

    // ---------- HELPERS ----------
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function setText(el, txt) {
        if (el) el.textContent = txt;
    }

    function setStatus(mode, label) {
        // mode: "offline" | "online" | "pending"
        loginScreen?.classList.remove("status-offline", "status-online", "status-pending");
        loginScreen?.classList.add(`status-${mode}`);
        setText(terminalStatus, label);
    }

    // terminal output helpers (monospace)
    function line(text = "") {
        const div = document.createElement("div");
        div.className = "tLine";
        div.textContent = text;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
        return div;
    }

    async function typeLine(text, { delay = 14, prefix = "" } = {}) {
        const el = line(prefix);
        for (let i = 0; i < text.length; i++) {
            el.textContent = prefix + text.slice(0, i + 1);
            terminal.scrollTop = terminal.scrollHeight;
            await sleep(delay);
        }
        return el;
    }

    function clearTerminal() {
        terminal.innerHTML = "";
    }

    // ---------- MUSIC ----------
    const music = new Audio();
    music.preload = "auto";
    music.loop = false;

    let trackIndex = 0;
    let playing = false;


    function fmtTime(sec) {
        if (!isFinite(sec) || sec < 0) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ":" + String(s).padStart(2, "0");
    }

    function syncProgress() {
        if (!musicProgress) return;
        const dur = music.duration || 0;
        const cur = music.currentTime || 0;

        if (mTimeCur) mTimeCur.textContent = fmtTime(cur);
        if (mTimeDur) mTimeDur.textContent = fmtTime(dur);

        // map 0..dur to 0..1000 to avoid float precision in range
        const val = dur > 0 ? Math.round((cur / dur) * 1000) : 0;
        musicProgress.value = String(val);
    }

    function loadTrack(i) {
        trackIndex = (i + PLAYLIST.length) % PLAYLIST.length;
        const t = PLAYLIST[trackIndex];
        music.src = t.src;
        setText(musicTrack, t.name);
        // reset progress UI until metadata loads
        if (musicProgress) musicProgress.value = "0";
        if (mTimeCur) mTimeCur.textContent = "0:00";
        if (mTimeDur) mTimeDur.textContent = "0:00";
    }

    function setMusicVol() {
        const v = Math.max(0, Math.min(100, Number(musicVol?.value ?? 35)));
        music.volume = v / 100;
    }

    function setMusicBtn() {
        if (!musicToggle) return;
        musicToggle.textContent = playing ? "PAUSE" : "PLAY";
    }

    async function fadeInMusic(ms = 900) {
        if (!PLAYLIST.length) return;
        setMusicVol();
        const target = music.volume;
        music.volume = 0;
        try { await music.play(); playing = true; } catch { /* autoplay restrictions */ }
        setMusicBtn();

        const steps = 30;
        for (let s = 1; s <= steps; s++) {
            music.volume = (target * s) / steps;
            await sleep(ms / steps);
        }
    }

    function toggleMusic() {
        if (!PLAYLIST.length) return;
        if (music.src === "") loadTrack(0);

        if (playing) {
            music.pause();
            playing = false;
        } else {
            music.play().then(() => {
                playing = true;
                setMusicVol();
                setMusicBtn();
            }).catch(() => { });
        }
        setMusicBtn();
    }

    // If the user is already in PLAY state, ensure we resume once the browser can play.
    music.addEventListener("canplay", () => {
        if (playing) music.play().catch(() => { });
    });


    prevTrack?.addEventListener("click", () => {
        loadTrack(trackIndex - 1);
        if (playing) music.play().catch(() => { });
    });

    nextTrack?.addEventListener("click", () => {
        loadTrack(trackIndex + 1);
        if (playing) music.play().catch(() => { });
    });

    musicToggle?.addEventListener("click", toggleMusic);
    musicVol?.addEventListener("input", () => setMusicVol());

    musicProgress?.addEventListener("input", () => {
        const dur = music.duration || 0;
        if (dur <= 0) return;
        const v = Number(musicProgress.value || 0) / 1000;
        music.currentTime = v * dur;
        syncProgress();
    });

    music.addEventListener("timeupdate", syncProgress);
    music.addEventListener("loadedmetadata", syncProgress);

    // Auto-advance to next track; loop playlist when finished.
    music.addEventListener("ended", () => {
        loadTrack(trackIndex + 1);
        // keep playing if user had music on
        if (playing) {
            music.play().catch(() => { /* ignore */ });
        }
    });

    // ---------- TELEMETRY ----------
    function drawSpark(canvas, samples) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // grid
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = "rgba(0,200,255,0.35)";
        ctx.lineWidth = 1;

        const gx = 5;
        for (let i = 1; i < gx; i++) {
            const x = (w * i) / gx;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        const gy = 3;
        for (let j = 1; j < gy; j++) {
            const y = (h * j) / gy;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // line
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(70,227,255,0.95)";
        ctx.lineWidth = 2;

        const n = samples.length;
        const min = Math.min(...samples);
        const max = Math.max(...samples);
        const span = Math.max(1e-6, max - min);

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const x = (w * i) / (n - 1);
            const y = h - ((samples[i] - min) / span) * (h - 6) - 3;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // fill
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "rgba(0,200,255,0.9)";
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    const netSamples = Array.from({ length: 24 }, () => 1.8 + Math.random() * 0.7);
    const cpuSamples = Array.from({ length: 24 }, () => 20 + Math.random() * 50);

    setInterval(() => {
        // network
        netSamples.shift();
        netSamples.push(1.6 + Math.random() * 1.2);
        drawSpark(netGraph, netSamples);
        setText(netVal, netSamples[netSamples.length - 1].toFixed(2));

        // cpu
        cpuSamples.shift();
        const next = Math.max(5, Math.min(98, cpuSamples[cpuSamples.length - 1] + (Math.random() - 0.5) * 14));
        cpuSamples.push(next);
        drawSpark(cpuGraph, cpuSamples);
        setText(cpuVal, `${Math.round(next)}%`);
    }, 650);

    // ---------- TIME HUD ----------
    function tickTime() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        setText(shipTime, `${hh}:${mm}:${ss}`);
    }
    setText(campDate, CAMPAIGN_DATE);
    setText(starSystem, STAR_SYSTEM);
    tickTime();
    setInterval(tickTime, 1000);

    // ---------- NAV / ROUTES ----------
    const ROUTE_TITLES = {
        map: "BRIDGE / SYSTEM MAP",
        contracts: "BRIDGE / CONTRACTS",
        factions: "BRIDGE / FACTIONS",
        ship: "BRIDGE / SHIP STATUS",
        logs: "BRIDGE / LOGS",
        settings: "BRIDGE / SETTINGS",
        lock: "LOCK TERMINAL",
    };

    function setRoute(route) {
        // views
        for (const v of views) {
            v.classList.toggle("active", v.dataset.view === route);
        }
        // buttons
        for (const b of sideBtns) {
            b.classList.toggle("active", b.dataset.route === route);
        }
        setText(appTitle, ROUTE_TITLES[route] ?? "BRIDGE / SYSTEM");
    }

    function openSidebar() {
        sideNav?.classList.add("open");
        sideOverlay?.classList.add("open");
        appEl?.classList.add("hasSidebar");
        menuBtn?.classList.add("open");               // flip arrow
        menuBtn?.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
        sideNav?.classList.remove("open");
        sideOverlay?.classList.remove("open");
        appEl?.classList.remove("hasSidebar");
        menuBtn?.classList.remove("open");            // flip back
        menuBtn?.setAttribute("aria-expanded", "false");
    }

    function toggleSidebar() {
        const isOpen = sideNav?.classList.contains("open");
        if (isOpen) closeSidebar();
        else openSidebar();
    }

    menuBtn?.addEventListener("click", toggleSidebar);
    sideClose?.addEventListener("click", closeSidebar);
    sideOverlay?.addEventListener("click", closeSidebar);

    sideBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const route = btn.dataset.route;
            if (!route) return;
            if (route === "lock") {
                // lock resets to power screen
                closeSidebar();
                lockTerminal();
                return;
            }
            setRoute(route);
            closeSidebar();
        });
    });

    // ---------- FLOW: POWER ON → LOGIN → APP ----------
    let powered = false;
    let authed = false;

    function showLogin() {
        loginScreen?.classList.remove("hidden");
        appShell?.classList.add("hidden");
    }
    function showApp() {
        appShell?.classList.remove("hidden");
        loginScreen?.classList.add("hidden");
    }

    function lockTerminal() {
        powered = false;
        authed = false;

        // reset UI
        authModule?.classList.add("hidden");
        clearTerminal();
        setText(uiUser, "—");
        setText(uiPass, "—");
        loginBtn.disabled = true;

        setStatus("offline", "STATUS: OFFLINE");
        powerBtn.disabled = false;
        powerBtn.textContent = "POWER ON";
        setText(powerNote, "TERMINAL POWER IS OFFLINE. ACTIVATION REQUIRED.");

        showLogin();
        setRoute("map");
    }

    async function runPowerBoot() {
        authModule?.classList.remove("hidden");
        clearTerminal();

        await typeLine("FM-FR-2521 RELAY NODE", { delay: 10 });
        await typeLine("POWER SUBSYSTEM: INIT", { delay: 10 });
        await sleep(150);
        await typeLine("POWER ROUTING ............ OK", { delay: 8 });
        await typeLine("AUX BATTERY .............. ONLINE", { delay: 8 });
        await typeLine("CRYPTO MODULE ............ STANDBY", { delay: 8 });
        await typeLine("AUTH GATE ................ READY", { delay: 8 });
        await sleep(200);
        await typeLine("LOGIN REQUIRED.", { delay: 12 });

        loginBtn.disabled = false;
    }

    powerBtn.addEventListener("click", async () => {
        if (powered) return;
        powered = true;

        powerBtn.disabled = true;
        setStatus("pending", "STATUS: PENDING");
        setText(powerNote, "POWER ESTABLISHED. LOGIN REQUIRED.");

        // Start music only after a user gesture (helps autoplay policies)
        if (PLAYLIST.length) {
            if (!music.src) loadTrack(0);
            // do not force play; user can hit play — but fade-in on power on feels good
            fadeInMusic(1100).catch(() => { });
        }

        await runPowerBoot();
        setStatus("online", "STATUS: ONLINE");
    });

    loginBtn.addEventListener("click", async () => {
        if (!powered || authed) return;
        authed = true;
        loginBtn.disabled = true;

        // fake credential entry (swap for real inputs later)
        setText(uiUser, "GUEST");
        setText(uiPass, "••••••••");

        await typeLine("AUTH REQUEST: INITIATED", { delay: 10 });
        await sleep(140);
        await typeLine("CREDENTIALS .............. SUBMITTED", { delay: 8 });
        await typeLine("VERIFYING ACCESS ..........", { delay: 8 });
        await sleep(420);

        // Password gate placeholder (swap for real input later)
        const ok = REQUIRED_PASSWORD && REQUIRED_PASSWORD.length > 0;

        if (!ok) {
            await typeLine("ACCESS DENIED", { delay: 14 });
            await typeLine("RETURNING TO LOGIN", { delay: 10 });
            authed = false;
            loginBtn.disabled = false;
            return;
        }

        await typeLine("ACCESS GRANTED", { delay: 14 });
        await sleep(220);

        // Transition
        showApp();
        setText(appSub, "FM-FR-2521 • RELAY STATUS: ACTIVE");
        setRoute("map");
    });

    // init
    lockTerminal();
})();
