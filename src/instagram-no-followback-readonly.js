/**
 * Instagram No-Follow-Back Scanner — Read Only
 * Versión: 1.0.0
 * Fecha: 2026-08-05
 *
 * Uso:
 * 1) Abre https://www.instagram.com/ e inicia sesión.
 * 2) Abre la consola del navegador.
 * 3) Pega TODO este archivo y presiona Enter.
 * 4) Pulsa "Iniciar escaneo".
 *
 * Seguridad:
 * - Solo realiza solicitudes GET a www.instagram.com.
 * - No solicita ni envía tu contraseña.
 * - No incluye ninguna función para dejar de seguir cuentas.
 * - No manda información a servidores externos.
 *
 * Inspirado en la estrategia de lectura de:
 * https://github.com/davidarroyo1234/InstagramUnfollowers
 */

(() => {
  "use strict";

  const APP_KEY = "__igNoFollowBackReadOnlyV1";
  const VERSION = "1.0.0";
  const REQUIRED_HOST = "www.instagram.com";
  const QUERY_HASH = "3dec7e2c57367ef3da3d987d89f9dbc8";
  const PAGE_SIZE = 24;

  if (location.hostname !== REQUIRED_HOST) {
    alert("Abre https://www.instagram.com/ e inicia sesión antes de ejecutar el script.");
    return;
  }

  if (window[APP_KEY]?.destroy) {
    window[APP_KEY].focus?.();
    return;
  }

  const defaultSettings = Object.freeze({
    delayMinMs: 1400,
    delayMaxMs: 2800,
    longPauseEveryPages: 6,
    longPauseMinMs: 12000,
    longPauseMaxMs: 22000,
    maxRetries: 3,
    retryBaseMs: 2500,
    rowsPerPage: 50,
  });

  const state = {
    status: "idle", // idle | running | paused | stopping | completed | error
    abortRequested: false,
    currentAbortController: null,
    usersById: new Map(),
    totalExpected: null,
    pagesLoaded: 0,
    cursor: null,
    seenCursors: new Set(),
    activeTab: "nonfollowers",
    search: "",
    tablePage: 1,
    settings: { ...defaultSettings },
    startedAt: null,
    endedAt: null,
    lastError: null,
    log: [],
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (Math.max(min, max) - Math.min(min, max) + 1)) +
    Math.min(min, max);

  function getCookie(name) {
    const prefix = `${name}=`;
    return document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(prefix))
      ?.slice(prefix.length) ?? null;
  }

  function addLog(message, level = "info") {
    const entry = {
      time: new Date().toISOString(),
      level,
      message: String(message),
    };
    state.log.push(entry);
    if (state.log.length > 300) state.log.shift();
    renderLog();
  }

  function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  }

  function downloadText(filename, text, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function makeQueryUrl(cursor) {
    const userId = getCookie("ds_user_id");
    if (!userId) {
      throw new Error(
        "No se encontró la cookie ds_user_id. Confirma que iniciaste sesión y recarga Instagram."
      );
    }

    const variables = {
      id: userId,
      include_reel: true,
      fetch_mutual: false,
      first: PAGE_SIZE,
    };

    if (cursor) variables.after = cursor;

    const url = new URL("/graphql/query/", location.origin);
    url.searchParams.set("query_hash", QUERY_HASH);
    url.searchParams.set("variables", JSON.stringify(variables));
    return url.toString();
  }

  function isConnectionObject(value) {
    if (!value || typeof value !== "object") return false;
    if (!Array.isArray(value.edges)) return false;
    if (!value.page_info || typeof value.page_info !== "object") return false;
    if (value.edges.length === 0) return typeof value.count === "number";

    const sample = value.edges[0]?.node;
    return Boolean(
      sample &&
      typeof sample === "object" &&
      typeof sample.username === "string" &&
      ("follows_viewer" in sample || "followed_by_viewer" in sample)
    );
  }

  function findFollowingConnection(root) {
    const direct = root?.data?.user?.edge_follow;
    if (isConnectionObject(direct)) return direct;

    const queue = [{ value: root, depth: 0 }];
    const visited = new WeakSet();

    while (queue.length) {
      const { value, depth } = queue.shift();
      if (!value || typeof value !== "object" || depth > 8) continue;
      if (visited.has(value)) continue;
      visited.add(value);

      if (isConnectionObject(value)) return value;

      for (const child of Object.values(value)) {
        if (child && typeof child === "object") {
          queue.push({ value: child, depth: depth + 1 });
        }
      }
    }

    return null;
  }

  function normalizeUser(node) {
    if (!node || typeof node !== "object") return null;

    const id = node.id == null ? "" : String(node.id);
    const username = typeof node.username === "string" ? node.username.trim() : "";

    if (!id || !username) return null;

    return {
      id,
      username,
      fullName: typeof node.full_name === "string" ? node.full_name : "",
      profilePicUrl:
        typeof node.profile_pic_url === "string" ? node.profile_pic_url : "",
      isPrivate: Boolean(node.is_private),
      isVerified: Boolean(node.is_verified),
      followedByViewer:
        typeof node.followed_by_viewer === "boolean"
          ? node.followed_by_viewer
          : null,
      followsViewer:
        typeof node.follows_viewer === "boolean" ? node.follows_viewer : null,
      requestedByViewer:
        typeof node.requested_by_viewer === "boolean"
          ? node.requested_by_viewer
          : null,
    };
  }

  function classifyUser(user) {
    if (user.followsViewer === false) return "nonfollowers";
    if (user.followsViewer === true) return "mutuals";
    return "uncertain";
  }

  function getAllUsers() {
    return [...state.usersById.values()].sort((a, b) =>
      a.username.localeCompare(b.username, "es", {
        sensitivity: "base",
        numeric: true,
      })
    );
  }

  function getCounts() {
    const counts = {
      all: 0,
      nonfollowers: 0,
      mutuals: 0,
      uncertain: 0,
    };

    for (const user of state.usersById.values()) {
      counts.all += 1;
      counts[classifyUser(user)] += 1;
    }

    return counts;
  }

  function getFilteredUsers() {
    const query = state.search.trim().toLowerCase();
    let users = getAllUsers();

    if (state.activeTab !== "all") {
      users = users.filter((user) => classifyUser(user) === state.activeTab);
    }

    if (query) {
      users = users.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.fullName.toLowerCase().includes(query)
      );
    }

    return users;
  }

  async function fetchPageWithRetry(cursor) {
    let lastError = null;

    for (let attempt = 0; attempt <= state.settings.maxRetries; attempt += 1) {
      if (state.abortRequested) throw new DOMException("Escaneo detenido", "AbortError");

      const controller = new AbortController();
      state.currentAbortController = controller;

      try {
        const response = await fetch(makeQueryUrl(cursor), {
          method: "GET",
          credentials: "include",
          mode: "cors",
          cache: "no-store",
          headers: {
            accept: "*/*",
            "x-requested-with": "XMLHttpRequest",
          },
          signal: controller.signal,
        });

        if ([401, 403].includes(response.status)) {
          throw new FatalScanError(
            `Instagram rechazó la sesión (${response.status}). Recarga la página e inicia sesión nuevamente.`
          );
        }

        if (response.status === 429) {
          throw new FatalScanError(
            "Instagram aplicó un límite temporal (HTTP 429). Detén el escaneo y no lo repitas de inmediato."
          );
        }

        if (!response.ok) {
          throw new Error(`Respuesta HTTP ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const connection = findFollowingConnection(json);

        if (!connection) {
          const topLevelKeys =
            json && typeof json === "object" ? Object.keys(json).join(", ") : "sin claves";
          throw new FatalScanError(
            `Instagram devolvió una estructura no reconocida. Claves principales: ${topLevelKeys}.`
          );
        }

        return connection;
      } catch (error) {
        state.currentAbortController = null;

        if (error?.name === "AbortError") throw error;
        if (error instanceof FatalScanError) throw error;

        lastError = error;
        if (attempt >= state.settings.maxRetries) break;

        const waitMs =
          state.settings.retryBaseMs * 2 ** attempt + randomInt(250, 1200);
        addLog(
          `Fallo temporal en la consulta. Reintento ${attempt + 1}/${state.settings.maxRetries} en ${formatDuration(waitMs)}: ${error.message}`,
          "warn"
        );
        await sleep(waitMs);
      } finally {
        state.currentAbortController = null;
      }
    }

    throw new Error(
      `No fue posible consultar Instagram después de varios intentos: ${
        lastError?.message ?? "error desconocido"
      }`
    );
  }

  class FatalScanError extends Error {
    constructor(message) {
      super(message);
      this.name = "FatalScanError";
    }
  }

  async function waitWhilePaused() {
    while (state.status === "paused" && !state.abortRequested) {
      await sleep(300);
    }
  }

  async function runScan() {
    if (["running", "paused", "stopping"].includes(state.status)) return;

    resetScanData();
    readSettingsFromUI();

    state.status = "running";
    state.startedAt = Date.now();
    state.endedAt = null;
    updateUI();

    addLog("Escaneo iniciado. Solo se realizarán consultas de lectura.", "success");

    let hasNextPage = true;

    try {
      while (hasNextPage && !state.abortRequested) {
        await waitWhilePaused();
        if (state.abortRequested) break;

        const connection = await fetchPageWithRetry(state.cursor);

        if (state.totalExpected == null && Number.isFinite(connection.count)) {
          state.totalExpected = Number(connection.count);
        }

        const edges = Array.isArray(connection.edges) ? connection.edges : [];
        let added = 0;
        let invalid = 0;

        for (const edge of edges) {
          const user = normalizeUser(edge?.node);
          if (!user) {
            invalid += 1;
            continue;
          }

          if (!state.usersById.has(user.id)) added += 1;
          state.usersById.set(user.id, user);
        }

        state.pagesLoaded += 1;
        addLog(
          `Página ${state.pagesLoaded}: ${edges.length} registros, ${added} nuevos${
            invalid ? `, ${invalid} inválidos` : ""
          }.`
        );

        const pageInfo = connection.page_info ?? {};
        hasNextPage = Boolean(pageInfo.has_next_page);
        const nextCursor =
          typeof pageInfo.end_cursor === "string" ? pageInfo.end_cursor : null;

        if (hasNextPage && !nextCursor) {
          throw new FatalScanError(
            "Instagram indicó que existe otra página, pero no entregó un cursor."
          );
        }

        if (nextCursor && state.seenCursors.has(nextCursor)) {
          throw new FatalScanError(
            "Instagram repitió el mismo cursor. El escaneo se detuvo para evitar un ciclo infinito."
          );
        }

        if (nextCursor) state.seenCursors.add(nextCursor);
        state.cursor = nextCursor;

        state.tablePage = 1;
        updateUI();

        if (!hasNextPage) break;

        if (
          state.settings.longPauseEveryPages > 0 &&
          state.pagesLoaded % state.settings.longPauseEveryPages === 0
        ) {
          const longWait = randomInt(
            state.settings.longPauseMinMs,
            state.settings.longPauseMaxMs
          );
          addLog(
            `Pausa preventiva después de ${state.pagesLoaded} páginas: ${formatDuration(longWait)}.`
          );
          await interruptibleSleep(longWait);
        } else {
          const waitMs = randomInt(
            state.settings.delayMinMs,
            state.settings.delayMaxMs
          );
          await interruptibleSleep(waitMs);
        }
      }

      if (state.abortRequested) {
        state.status = "idle";
        addLog("Escaneo detenido por el usuario.", "warn");
      } else {
        state.status = "completed";
        addLog(
          `Escaneo terminado: ${state.usersById.size} cuentas procesadas.`,
          "success"
        );
      }
    } catch (error) {
      if (error?.name === "AbortError" && state.abortRequested) {
        state.status = "idle";
        addLog("Escaneo detenido por el usuario.", "warn");
      } else {
        state.status = "error";
        state.lastError = error;
        addLog(error?.message ?? String(error), "error");
      }
    } finally {
      state.endedAt = Date.now();
      state.currentAbortController = null;
      state.abortRequested = false;
      updateUI();
    }
  }

  async function interruptibleSleep(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (state.abortRequested) return;
      await waitWhilePaused();
      if (state.abortRequested) return;
      await sleep(Math.min(300, end - Date.now()));
    }
  }

  function resetScanData() {
    state.abortRequested = false;
    state.currentAbortController?.abort();
    state.currentAbortController = null;
    state.usersById.clear();
    state.totalExpected = null;
    state.pagesLoaded = 0;
    state.cursor = null;
    state.seenCursors.clear();
    state.tablePage = 1;
    state.lastError = null;
    state.log = [];
  }

  function pauseScan() {
    if (state.status !== "running") return;
    state.status = "paused";
    addLog("Escaneo pausado.", "warn");
    updateUI();
  }

  function resumeScan() {
    if (state.status !== "paused") return;
    state.status = "running";
    addLog("Escaneo reanudado.", "success");
    updateUI();
  }

  function stopScan() {
    if (!["running", "paused"].includes(state.status)) return;
    state.status = "stopping";
    state.abortRequested = true;
    state.currentAbortController?.abort();
    addLog("Deteniendo el escaneo…", "warn");
    updateUI();
  }

  function exportCurrentCsv() {
    const users = getFilteredUsers();
    if (!users.length) return;

    const header = [
      "id",
      "username",
      "full_name",
      "classification",
      "follows_viewer",
      "followed_by_viewer",
      "is_private",
      "is_verified",
      "profile_url",
    ];

    const rows = users.map((user) => [
      user.id,
      user.username,
      user.fullName,
      classifyUser(user),
      user.followsViewer,
      user.followedByViewer,
      user.isPrivate,
      user.isVerified,
      `https://www.instagram.com/${user.username}/`,
    ]);

    const csv =
      "\uFEFF" +
      [header, ...rows]
        .map((row) => row.map(csvEscape).join(","))
        .join("\r\n");

    downloadText(
      `instagram_${state.activeTab}_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv;charset=utf-8"
    );
  }

  function exportAllJson() {
    const payload = {
      generatedAt: new Date().toISOString(),
      version: VERSION,
      source: "Instagram web session",
      totalExpected: state.totalExpected,
      pagesLoaded: state.pagesLoaded,
      counts: getCounts(),
      users: getAllUsers().map((user) => ({
        ...user,
        classification: classifyUser(user),
        profileUrl: `https://www.instagram.com/${user.username}/`,
      })),
      log: state.log,
    };

    downloadText(
      `instagram_scan_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
  }

  async function copyCurrentUsernames() {
    const users = getFilteredUsers();
    if (!users.length) return;
    await navigator.clipboard.writeText(
      users.map((user) => `@${user.username}`).join("\n")
    );
    addLog(`Se copiaron ${users.length} usuarios al portapapeles.`, "success");
  }

  function readSettingsFromUI() {
    const numeric = (id, fallback, min, max) => {
      const value = Number(elements[id].value);
      if (!Number.isFinite(value)) return fallback;
      return Math.min(max, Math.max(min, value));
    };

    const delayMinSeconds = numeric("delayMin", 1.4, 0.5, 30);
    const delayMaxSeconds = numeric("delayMax", 2.8, delayMinSeconds, 60);
    const longMinSeconds = numeric("longMin", 12, 5, 300);
    const longMaxSeconds = numeric("longMax", 22, longMinSeconds, 600);

    state.settings = {
      delayMinMs: Math.round(delayMinSeconds * 1000),
      delayMaxMs: Math.round(delayMaxSeconds * 1000),
      longPauseEveryPages: numeric("longEvery", 6, 1, 50),
      longPauseMinMs: Math.round(longMinSeconds * 1000),
      longPauseMaxMs: Math.round(longMaxSeconds * 1000),
      maxRetries: numeric("maxRetries", 3, 0, 5),
      retryBaseMs: 2500,
      rowsPerPage: numeric("rowsPerPage", 50, 10, 200),
    };
  }

  const host = document.createElement("div");
  host.id = "ig-nofollowback-readonly-host";
  host.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .shell {
        pointer-events: auto;
        position: fixed;
        inset: 18px;
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        color: #f8fafc;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 18px;
        box-shadow: 0 24px 80px rgba(0,0,0,.55);
        overflow: hidden;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .topbar {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:14px 16px;
        background:#111827;
        border-bottom:1px solid #334155;
      }
      .title { font-size:16px; font-weight:800; }
      .subtitle { font-size:12px; color:#94a3b8; margin-top:2px; }
      .top-actions { display:flex; gap:8px; flex-wrap:wrap; }
      button, input, select {
        font: inherit;
      }
      button {
        border:1px solid #475569;
        background:#1e293b;
        color:#f8fafc;
        border-radius:10px;
        padding:8px 11px;
        cursor:pointer;
        font-weight:700;
      }
      button:hover:not(:disabled) { background:#334155; }
      button.primary { background:#7c3aed; border-color:#7c3aed; }
      button.danger { background:#991b1b; border-color:#b91c1c; }
      button:disabled { opacity:.45; cursor:not-allowed; }
      .summary {
        padding:12px 16px;
        border-bottom:1px solid #334155;
        background:#0b1220;
      }
      .status-line {
        display:flex;
        justify-content:space-between;
        gap:12px;
        font-size:12px;
        color:#cbd5e1;
        margin-bottom:8px;
      }
      .progress {
        height:8px;
        border-radius:999px;
        background:#1e293b;
        overflow:hidden;
      }
      .progress > div {
        height:100%;
        width:0%;
        background:linear-gradient(90deg,#7c3aed,#22c55e);
        transition:width .2s ease;
      }
      .counts {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:8px;
        margin-top:10px;
      }
      .count {
        border:1px solid #334155;
        background:#111827;
        border-radius:12px;
        padding:9px 10px;
      }
      .count strong { display:block; font-size:19px; }
      .count span { color:#94a3b8; font-size:11px; }
      .body {
        min-height:0;
        display:grid;
        grid-template-columns:260px minmax(0,1fr);
      }
      aside {
        min-height:0;
        overflow:auto;
        padding:14px;
        border-right:1px solid #334155;
        background:#111827;
      }
      main {
        min-width:0;
        min-height:0;
        display:grid;
        grid-template-rows:auto auto minmax(0,1fr) auto;
        padding:14px;
        gap:10px;
      }
      .section {
        border:1px solid #334155;
        background:#0f172a;
        border-radius:12px;
        padding:12px;
        margin-bottom:12px;
      }
      .section h3 { margin:0 0 9px; font-size:13px; }
      .field { margin-bottom:9px; }
      .field label {
        display:block;
        color:#cbd5e1;
        font-size:11px;
        margin-bottom:4px;
      }
      input[type="number"], input[type="search"] {
        width:100%;
        border:1px solid #475569;
        background:#0b1220;
        color:#f8fafc;
        border-radius:9px;
        padding:8px 9px;
      }
      .two { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
      .hint { color:#94a3b8; font-size:11px; line-height:1.45; }
      .tabs, .toolbar, .pagination {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        align-items:center;
      }
      .tabs button.active { background:#7c3aed; border-color:#7c3aed; }
      .toolbar input { flex:1 1 220px; }
      .table-wrap {
        min-height:0;
        overflow:auto;
        border:1px solid #334155;
        border-radius:12px;
      }
      table {
        width:100%;
        border-collapse:collapse;
        font-size:12px;
      }
      th, td {
        padding:9px 10px;
        border-bottom:1px solid #243244;
        text-align:left;
        vertical-align:middle;
      }
      th {
        position:sticky;
        top:0;
        background:#111827;
        z-index:1;
        color:#cbd5e1;
      }
      tr:hover td { background:#111827; }
      a { color:#c4b5fd; text-decoration:none; font-weight:700; }
      a:hover { text-decoration:underline; }
      .badge {
        display:inline-block;
        border-radius:999px;
        padding:3px 7px;
        font-size:10px;
        font-weight:800;
      }
      .badge.no { background:#7f1d1d; color:#fecaca; }
      .badge.yes { background:#14532d; color:#bbf7d0; }
      .badge.unknown { background:#78350f; color:#fde68a; }
      .pagination {
        justify-content:space-between;
        color:#94a3b8;
        font-size:12px;
      }
      .log {
        max-height:180px;
        overflow:auto;
        background:#020617;
        border:1px solid #334155;
        border-radius:9px;
        padding:8px;
        font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
        font-size:10px;
        line-height:1.55;
      }
      .log div.warn { color:#fde68a; }
      .log div.error { color:#fca5a5; }
      .log div.success { color:#86efac; }
      .empty { padding:28px; color:#94a3b8; text-align:center; }
      @media (max-width: 820px) {
        .shell { inset:0; border-radius:0; }
        .body { grid-template-columns:1fr; }
        aside { display:none; }
        .counts { grid-template-columns:1fr 1fr; }
        th:nth-child(3), td:nth-child(3), th:nth-child(5), td:nth-child(5) { display:none; }
      }
    </style>

    <section class="shell" role="dialog" aria-label="Instagram No-Follow-Back Scanner">
      <header class="topbar">
        <div>
          <div class="title">Instagram No-Follow-Back · Solo lectura</div>
          <div class="subtitle">v${VERSION} · No ejecuta unfollows ni envía datos fuera de Instagram</div>
        </div>
        <div class="top-actions">
          <button id="start" class="primary">Iniciar escaneo</button>
          <button id="pause" disabled>Pausar</button>
          <button id="resume" disabled>Reanudar</button>
          <button id="stop" class="danger" disabled>Detener</button>
          <button id="close">Cerrar</button>
        </div>
      </header>

      <section class="summary">
        <div class="status-line">
          <span id="statusText">Listo para iniciar</span>
          <span id="duration">Duración: —</span>
        </div>
        <div class="progress"><div id="progressBar"></div></div>
        <div class="counts">
          <div class="count"><strong id="allCount">0</strong><span>Cuentas procesadas</span></div>
          <div class="count"><strong id="nonfollowersCount">0</strong><span>No te siguen</span></div>
          <div class="count"><strong id="mutualsCount">0</strong><span>Mutuos</span></div>
          <div class="count"><strong id="uncertainCount">0</strong><span>Resultado incierto</span></div>
        </div>
      </section>

      <div class="body">
        <aside>
          <section class="section">
            <h3>Ajustes prudentes</h3>
            <div class="two">
              <div class="field">
                <label for="delayMin">Espera mínima (s)</label>
                <input id="delayMin" type="number" value="1.4" min="0.5" max="30" step="0.1">
              </div>
              <div class="field">
                <label for="delayMax">Espera máxima (s)</label>
                <input id="delayMax" type="number" value="2.8" min="0.5" max="60" step="0.1">
              </div>
            </div>
            <div class="field">
              <label for="longEvery">Pausa larga cada N páginas</label>
              <input id="longEvery" type="number" value="6" min="1" max="50">
            </div>
            <div class="two">
              <div class="field">
                <label for="longMin">Pausa larga mín. (s)</label>
                <input id="longMin" type="number" value="12" min="5" max="300">
              </div>
              <div class="field">
                <label for="longMax">Pausa larga máx. (s)</label>
                <input id="longMax" type="number" value="22" min="5" max="600">
              </div>
            </div>
            <div class="two">
              <div class="field">
                <label for="maxRetries">Reintentos máximos</label>
                <input id="maxRetries" type="number" value="3" min="0" max="5">
              </div>
              <div class="field">
                <label for="rowsPerPage">Filas por página</label>
                <input id="rowsPerPage" type="number" value="50" min="10" max="200">
              </div>
            </div>
            <p class="hint">
              Ante respuestas 401, 403 o 429 el escaneo se detiene. No se realizan reintentos infinitos.
            </p>
          </section>

          <section class="section">
            <h3>Exportación</h3>
            <div class="top-actions">
              <button id="copy">Copiar lista visible</button>
              <button id="csv">CSV visible</button>
              <button id="json">JSON completo</button>
            </div>
          </section>

          <section class="section">
            <h3>Registro</h3>
            <div id="log" class="log"><div>Sin actividad.</div></div>
          </section>
        </aside>

        <main>
          <div class="tabs">
            <button data-tab="nonfollowers" class="active">No te siguen</button>
            <button data-tab="mutuals">Mutuos</button>
            <button data-tab="uncertain">Inciertos</button>
            <button data-tab="all">Todos</button>
          </div>

          <div class="toolbar">
            <input id="search" type="search" placeholder="Buscar por usuario o nombre…">
            <span id="visibleCount" class="hint">0 resultados</span>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Relación</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
            <div id="empty" class="empty">Aún no hay resultados.</div>
          </div>

          <div class="pagination">
            <span id="pageInfo">Página 1 de 1</span>
            <div>
              <button id="prevPage">Anterior</button>
              <button id="nextPage">Siguiente</button>
            </div>
          </div>
        </main>
      </div>
    </section>
  `;

  const ids = [
    "start", "pause", "resume", "stop", "close",
    "statusText", "duration", "progressBar",
    "allCount", "nonfollowersCount", "mutualsCount", "uncertainCount",
    "delayMin", "delayMax", "longEvery", "longMin", "longMax",
    "maxRetries", "rowsPerPage", "copy", "csv", "json", "log",
    "search", "visibleCount", "rows", "empty", "pageInfo", "prevPage", "nextPage",
  ];

  const elements = Object.fromEntries(ids.map((id) => [id, shadow.getElementById(id)]));
  const tabButtons = [...shadow.querySelectorAll("[data-tab]")];

  function renderLog() {
    if (!elements.log) return;
    if (!state.log.length) {
      elements.log.innerHTML = "<div>Sin actividad.</div>";
      return;
    }

    const recent = state.log.slice(-80);
    elements.log.replaceChildren(
      ...recent.map((entry) => {
        const row = document.createElement("div");
        row.className = entry.level;
        const time = new Date(entry.time).toLocaleTimeString("es-MX");
        row.textContent = `[${time}] ${entry.message}`;
        return row;
      })
    );
    elements.log.scrollTop = elements.log.scrollHeight;
  }

  function statusLabel() {
    const labels = {
      idle: "Listo para iniciar",
      running: "Escaneando…",
      paused: "Escaneo pausado",
      stopping: "Deteniendo…",
      completed: "Escaneo terminado",
      error: `Error: ${state.lastError?.message ?? "desconocido"}`,
    };
    return labels[state.status] ?? state.status;
  }

  function updateUI() {
    const counts = getCounts();
    const expected = state.totalExpected;
    const progress =
      expected && expected > 0
        ? Math.min(100, Math.round((counts.all / expected) * 100))
        : state.status === "completed"
          ? 100
          : 0;

    elements.statusText.textContent =
      `${statusLabel()} · ${state.pagesLoaded} página(s)` +
      (expected != null ? ` · esperado: ${expected}` : "");

    const end = state.endedAt ?? Date.now();
    const duration = state.startedAt ? end - state.startedAt : null;
    elements.duration.textContent = `Duración: ${formatDuration(duration)}`;
    elements.progressBar.style.width = `${progress}%`;

    elements.allCount.textContent = counts.all.toLocaleString("es-MX");
    elements.nonfollowersCount.textContent =
      counts.nonfollowers.toLocaleString("es-MX");
    elements.mutualsCount.textContent = counts.mutuals.toLocaleString("es-MX");
    elements.uncertainCount.textContent =
      counts.uncertain.toLocaleString("es-MX");

    elements.start.disabled = ["running", "paused", "stopping"].includes(state.status);
    elements.pause.disabled = state.status !== "running";
    elements.resume.disabled = state.status !== "paused";
    elements.stop.disabled = !["running", "paused"].includes(state.status);

    const settingsDisabled = ["running", "paused", "stopping"].includes(state.status);
    [
      "delayMin", "delayMax", "longEvery", "longMin", "longMax",
      "maxRetries", "rowsPerPage",
    ].forEach((id) => {
      elements[id].disabled = settingsDisabled;
    });

    renderTable();
    renderLog();
  }

  function renderTable() {
    const users = getFilteredUsers();
    const perPage = state.settings.rowsPerPage;
    const totalPages = Math.max(1, Math.ceil(users.length / perPage));
    state.tablePage = Math.min(Math.max(1, state.tablePage), totalPages);

    const start = (state.tablePage - 1) * perPage;
    const pageUsers = users.slice(start, start + perPage);

    elements.visibleCount.textContent = `${users.length.toLocaleString("es-MX")} resultado(s)`;
    elements.pageInfo.textContent = `Página ${state.tablePage} de ${totalPages}`;
    elements.prevPage.disabled = state.tablePage <= 1;
    elements.nextPage.disabled = state.tablePage >= totalPages;

    elements.rows.replaceChildren();

    for (const [index, user] of pageUsers.entries()) {
      const row = document.createElement("tr");

      const position = document.createElement("td");
      position.textContent = String(start + index + 1);

      const usernameCell = document.createElement("td");
      const profileLink = document.createElement("a");
      profileLink.href = `https://www.instagram.com/${encodeURIComponent(user.username)}/`;
      profileLink.target = "_blank";
      profileLink.rel = "noopener noreferrer";
      profileLink.textContent = `@${user.username}`;
      usernameCell.appendChild(profileLink);

      const nameCell = document.createElement("td");
      nameCell.textContent = user.fullName || "—";

      const relationCell = document.createElement("td");
      const badge = document.createElement("span");
      const classification = classifyUser(user);
      badge.className =
        classification === "nonfollowers"
          ? "badge no"
          : classification === "mutuals"
            ? "badge yes"
            : "badge unknown";
      badge.textContent =
        classification === "nonfollowers"
          ? "No te sigue"
          : classification === "mutuals"
            ? "Mutuo"
            : "Incierto";
      relationCell.appendChild(badge);

      const detailsCell = document.createElement("td");
      const details = [];
      if (user.isVerified) details.push("verificada");
      if (user.isPrivate) details.push("privada");
      if (user.requestedByViewer) details.push("solicitud pendiente");
      detailsCell.textContent = details.join(" · ") || "—";

      row.append(position, usernameCell, nameCell, relationCell, detailsCell);
      elements.rows.appendChild(row);
    }

    elements.empty.style.display = pageUsers.length ? "none" : "block";
  }

  elements.start.addEventListener("click", runScan);
  elements.pause.addEventListener("click", pauseScan);
  elements.resume.addEventListener("click", resumeScan);
  elements.stop.addEventListener("click", stopScan);

  elements.close.addEventListener("click", () => {
    if (["running", "paused"].includes(state.status)) {
      const confirmed = confirm(
        "El escaneo sigue activo. ¿Deseas detenerlo y cerrar la herramienta?"
      );
      if (!confirmed) return;
      stopScan();
    }
    destroy();
  });

  elements.search.addEventListener("input", () => {
    state.search = elements.search.value;
    state.tablePage = 1;
    renderTable();
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      state.tablePage = 1;
      tabButtons.forEach((item) =>
        item.classList.toggle("active", item === button)
      );
      renderTable();
    });
  });

  elements.prevPage.addEventListener("click", () => {
    state.tablePage -= 1;
    renderTable();
  });

  elements.nextPage.addEventListener("click", () => {
    state.tablePage += 1;
    renderTable();
  });

  elements.copy.addEventListener("click", () => {
    copyCurrentUsernames().catch((error) =>
      addLog(`No se pudo copiar: ${error.message}`, "error")
    );
  });
  elements.csv.addEventListener("click", exportCurrentCsv);
  elements.json.addEventListener("click", exportAllJson);

  function focus() {
    host.style.display = "";
  }

  function destroy() {
    state.abortRequested = true;
    state.currentAbortController?.abort();
    host.remove();
    delete window[APP_KEY];
  }

  window[APP_KEY] = {
    version: VERSION,
    state,
    focus,
    destroy,
    exportCsv: exportCurrentCsv,
    exportJson: exportAllJson,
  };

  updateUI();
  addLog("Herramienta cargada correctamente.", "success");
})();
