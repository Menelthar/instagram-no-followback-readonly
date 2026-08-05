(function launchInstagramScanner(root) {
  "use strict";

  const core = root.IGNoFollowCore;
  const adapter = root.IGNoFollowAdapter;
  if (!core || !adapter) throw new Error("Scanner modules are missing");

  const VERSION = "1.1.0";
  const APP_KEY = "__igNoFollowBackReadOnlyV110";
  const REQUIRED_HOSTS = new Set(["www.instagram.com", "instagram.com"]);

  const I18N = {
    es: {
      title: "Instagram No-Follow-Back · Solo lectura",
      subtitle: "No modifica tu cuenta ni envía resultados fuera de Instagram",
      start: "Iniciar escaneo",
      pause: "Pausar",
      resume: "Reanudar",
      stop: "Detener",
      close: "Cerrar",
      ready: "Listo para iniciar",
      running: "Escaneando…",
      paused: "Escaneo pausado",
      stopping: "Deteniendo…",
      completed: "Escaneo terminado",
      completedWarnings: "Terminado con advertencias",
      incomplete: "Escaneo incompleto",
      error: "Error",
      duration: "Duración",
      processed: "Cuentas únicas",
      nonfollowers: "No te siguen",
      mutuals: "Mutuos",
      uncertain: "Inciertos",
      integrity: "Integridad",
      integrityOk: "Completa",
      integrityWarn: "Revisar",
      settings: "Ajustes prudentes",
      minDelay: "Espera mínima (s)",
      maxDelay: "Espera máxima (s)",
      longEvery: "Pausa larga cada N páginas",
      longMin: "Pausa larga mín. (s)",
      longMax: "Pausa larga máx. (s)",
      retries: "Reintentos máximos",
      timeout: "Timeout por solicitud (s)",
      rows: "Filas por página",
      ids: "Incluir IDs internos al exportar",
      pics: "Incluir URLs de foto al exportar",
      exports: "Exportación",
      copyVisible: "Copiar lista visible",
      csvVisible: "CSV visible",
      jsonFull: "JSON completo",
      copyDiagnostic: "Copiar diagnóstico",
      log: "Registro",
      noActivity: "Sin actividad.",
      all: "Todos",
      search: "Buscar por usuario o nombre…",
      user: "Usuario",
      name: "Nombre",
      relation: "Relación",
      details: "Detalles",
      previous: "Anterior",
      next: "Siguiente",
      page: "Página",
      of: "de",
      results: "resultado(s)",
      noResults: "Aún no hay resultados.",
      verified: "verificada",
      private: "privada",
      pending: "solicitud pendiente",
      noFollow: "No te sigue",
      mutual: "Mutuo",
      uncertainBadge: "Incierto",
      expected: "esperado",
      pages: "página(s)",
      received: "recibidos",
      duplicates: "duplicados",
      invalid: "inválidos",
      difference: "diferencia",
      source: "fuente",
      retryHint: "Se detiene ante sesión rechazada, límite temporal o respuesta incompatible.",
      diagnosticCopied: "Diagnóstico seguro copiado.",
      copied: "usuarios copiados.",
      confirmRestart: "Un nuevo escaneo borrará los resultados actuales. ¿Continuar?",
      confirmClose: "El escaneo está activo. ¿Detenerlo y cerrar?",
      requestStarted: "Escaneo iniciado. Solo se realizarán consultas de lectura.",
      userStopped: "Escaneo detenido por el usuario.",
      fallbackWarning: "Se utilizó una ruta de compatibilidad validada.",
      countWarning: "El contador inicial y los usuarios únicos no coinciden.",
      browserBlocked: "La consola puede mostrar solicitudes internas de Instagram bloqueadas por extensiones; no provienen del escáner si son POST.",
    },
    en: {
      title: "Instagram No-Follow-Back · Read only",
      subtitle: "Does not modify your account or send results outside Instagram",
      start: "Start scan",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
      close: "Close",
      ready: "Ready to start",
      running: "Scanning…",
      paused: "Scan paused",
      stopping: "Stopping…",
      completed: "Scan completed",
      completedWarnings: "Completed with warnings",
      incomplete: "Incomplete scan",
      error: "Error",
      duration: "Duration",
      processed: "Unique accounts",
      nonfollowers: "Do not follow you",
      mutuals: "Mutuals",
      uncertain: "Uncertain",
      integrity: "Integrity",
      integrityOk: "Complete",
      integrityWarn: "Review",
      settings: "Cautious settings",
      minDelay: "Minimum delay (s)",
      maxDelay: "Maximum delay (s)",
      longEvery: "Long pause every N pages",
      longMin: "Long pause min. (s)",
      longMax: "Long pause max. (s)",
      retries: "Maximum retries",
      timeout: "Request timeout (s)",
      rows: "Rows per page",
      ids: "Include internal IDs in exports",
      pics: "Include profile image URLs in exports",
      exports: "Export",
      copyVisible: "Copy visible list",
      csvVisible: "Visible CSV",
      jsonFull: "Full JSON",
      copyDiagnostic: "Copy diagnostic",
      log: "Log",
      noActivity: "No activity.",
      all: "All",
      search: "Search by username or name…",
      user: "Username",
      name: "Name",
      relation: "Relationship",
      details: "Details",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      results: "result(s)",
      noResults: "No results yet.",
      verified: "verified",
      private: "private",
      pending: "pending request",
      noFollow: "Does not follow you",
      mutual: "Mutual",
      uncertainBadge: "Uncertain",
      expected: "expected",
      pages: "page(s)",
      received: "received",
      duplicates: "duplicates",
      invalid: "invalid",
      difference: "difference",
      source: "source",
      retryHint: "Stops on rejected sessions, rate limits, or incompatible responses.",
      diagnosticCopied: "Safe diagnostic copied.",
      copied: "usernames copied.",
      confirmRestart: "A new scan will erase the current results. Continue?",
      confirmClose: "The scan is active. Stop it and close?",
      requestStarted: "Scan started. Only read requests will be made.",
      userStopped: "Scan stopped by the user.",
      fallbackWarning: "A validated compatibility path was used.",
      countWarning: "The initial count and unique users do not match.",
      browserBlocked: "The console may show Instagram internal requests blocked by extensions; they do not come from the scanner when they are POST.",
    },
  };

  if (!REQUIRED_HOSTS.has(location.hostname)) {
    alert("Open https://www.instagram.com/ and sign in before running the scanner.");
    return;
  }

  if (root[APP_KEY]?.focus) {
    root[APP_KEY].focus();
    return;
  }

  const state = {
    locale: "es",
    status: "idle",
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
    startedAt: null,
    endedAt: null,
    lastError: null,
    lastErrorCode: null,
    sourcePath: null,
    usedFallback: false,
    log: [],
    metrics: {
      receivedRecords: 0,
      duplicateRecords: 0,
      invalidRecords: 0,
      requestCount: 0,
      retryCount: 0,
      countChanges: [],
    },
    settings: {
      delayMinMs: 1400,
      delayMaxMs: 2800,
      longPauseEveryPages: 6,
      longPauseMinMs: 12000,
      longPauseMaxMs: 22000,
      maxRetries: 3,
      retryBaseMs: 2500,
      requestTimeoutMs: 20000,
      rowsPerPage: 50,
      includeIds: false,
      includeProfilePics: false,
    },
  };

  const t = (key) => I18N[state.locale]?.[key] ?? I18N.es[key] ?? key;
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

  function addLog(message, level = "info", code = null) {
    state.log.push({ time: new Date().toISOString(), level, code, message: String(message) });
    if (state.log.length > 400) state.log.shift();
    renderLog();
  }

  function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  }

  function getAllUsers() {
    return [...state.usersById.values()].sort((a, b) =>
      a.username.localeCompare(b.username, state.locale, { sensitivity: "base", numeric: true })
    );
  }

  function getCounts() {
    const counts = { all: 0, nonfollowers: 0, mutuals: 0, uncertain: 0 };
    for (const user of state.usersById.values()) {
      counts.all += 1;
      counts[core.classifyUser(user)] += 1;
    }
    return counts;
  }

  function getIntegrity() {
    const counts = getCounts();
    return core.computeIntegrityStats({
      totalExpected: state.totalExpected,
      receivedRecords: state.metrics.receivedRecords,
      uniqueUsers: counts.all,
      duplicateRecords: state.metrics.duplicateRecords,
      invalidRecords: state.metrics.invalidRecords,
      uncertainUsers: counts.uncertain,
      pagesLoaded: state.pagesLoaded,
      countChanges: state.metrics.countChanges,
    });
  }

  function getFilteredUsers() {
    const query = state.search.trim().toLocaleLowerCase(state.locale);
    let users = getAllUsers();
    if (state.activeTab !== "all") {
      users = users.filter((user) => core.classifyUser(user) === state.activeTab);
    }
    if (query) {
      users = users.filter((user) =>
        `${user.username}\n${user.fullName}`.toLocaleLowerCase(state.locale).includes(query)
      );
    }
    return users;
  }

  async function interruptibleSleep(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (state.abortRequested) throw new DOMException("Stopped", "AbortError");
      while (state.status === "paused" && !state.abortRequested) await sleep(200);
      if (state.abortRequested) throw new DOMException("Stopped", "AbortError");
      await sleep(Math.min(250, Math.max(0, end - Date.now())));
    }
  }

  function errorForHttp(response) {
    const policy = core.classifyHttpStatus(response.status);
    if (policy.action === "ok") return null;

    const messages = {
      [core.ERROR_CODES.SESSION_REJECTED]: `Instagram rejected the session (HTTP ${response.status}).`,
      [core.ERROR_CODES.RATE_LIMITED]: "Instagram applied a temporary rate limit (HTTP 429).",
      [core.ERROR_CODES.UNSUPPORTED_RESPONSE]: `This endpoint is no longer compatible (HTTP ${response.status}).`,
      [core.ERROR_CODES.HTTP_ERROR]: `Instagram returned HTTP ${response.status} ${response.statusText}.`,
    };

    return new core.ScannerError(policy.code, messages[policy.code], {
      recoverable: policy.action === "retry",
      httpStatus: response.status,
    });
  }

  async function fetchPageWithRetry(cursor) {
    let lastError = null;

    for (let attempt = 0; attempt <= state.settings.maxRetries; attempt += 1) {
      if (state.abortRequested) throw new DOMException("Stopped", "AbortError");

      const userId = getCookie("ds_user_id");
      if (!userId) {
        throw new core.ScannerError(
          core.ERROR_CODES.SESSION_REJECTED,
          "The ds_user_id session cookie was not found. Reload Instagram and sign in again."
        );
      }

      const controller = new AbortController();
      state.currentAbortController = controller;
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, state.settings.requestTimeoutMs);

      try {
        state.metrics.requestCount += 1;
        const response = await fetch(
          adapter.makeQueryUrl({ userId, cursor, origin: location.origin }),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { accept: "*/*", "x-requested-with": "XMLHttpRequest" },
            signal: controller.signal,
          }
        );

        const httpError = errorForHttp(response);
        if (httpError) throw httpError;

        const json = await response.json();
        const parsed = adapter.parseFollowingResponse(json);
        state.sourcePath = parsed.sourcePath;
        state.usedFallback ||= parsed.usedFallback;
        return parsed.connection;
      } catch (error) {
        let normalized = error;
        if (error?.name === "AbortError" && timedOut) {
          normalized = new core.ScannerError(
            core.ERROR_CODES.REQUEST_TIMEOUT,
            `Instagram did not respond within ${Math.round(state.settings.requestTimeoutMs / 1000)} seconds.`,
            { recoverable: true, cause: error }
          );
        } else if (error?.name === "AbortError") {
          throw error;
        } else if (!(error instanceof core.ScannerError)) {
          normalized = new core.ScannerError(
            core.ERROR_CODES.NETWORK_ERROR,
            error?.message || "Network error",
            { recoverable: true, cause: error }
          );
        }

        lastError = normalized;
        if (!normalized.recoverable || attempt >= state.settings.maxRetries) throw normalized;

        state.metrics.retryCount += 1;
        const waitMs = state.settings.retryBaseMs * 2 ** attempt + randomInt(250, 1200);
        addLog(
          `${normalized.code}: retry ${attempt + 1}/${state.settings.maxRetries} in ${formatDuration(waitMs)}.`,
          "warn",
          normalized.code
        );
        await interruptibleSleep(waitMs);
      } finally {
        clearTimeout(timer);
        if (state.currentAbortController === controller) state.currentAbortController = null;
      }
    }

    throw lastError || new core.ScannerError(core.ERROR_CODES.NETWORK_ERROR, "Unknown request error");
  }

  function resetScanData() {
    state.currentAbortController?.abort();
    state.abortRequested = false;
    state.usersById.clear();
    state.totalExpected = null;
    state.pagesLoaded = 0;
    state.cursor = null;
    state.seenCursors.clear();
    state.tablePage = 1;
    state.startedAt = null;
    state.endedAt = null;
    state.lastError = null;
    state.lastErrorCode = null;
    state.sourcePath = null;
    state.usedFallback = false;
    state.log = [];
    state.metrics = {
      receivedRecords: 0,
      duplicateRecords: 0,
      invalidRecords: 0,
      requestCount: 0,
      retryCount: 0,
      countChanges: [],
    };
  }

  function readSettings() {
    const number = (id, fallback, min, max) => {
      const value = Number(elements[id].value);
      return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
    };
    const minDelay = number("delayMin", 1.4, 0.5, 30);
    const longMin = number("longMin", 12, 5, 300);
    state.settings = {
      delayMinMs: Math.round(minDelay * 1000),
      delayMaxMs: Math.round(number("delayMax", 2.8, minDelay, 60) * 1000),
      longPauseEveryPages: number("longEvery", 6, 1, 50),
      longPauseMinMs: Math.round(longMin * 1000),
      longPauseMaxMs: Math.round(number("longMax", 22, longMin, 600) * 1000),
      maxRetries: number("maxRetries", 3, 0, 5),
      retryBaseMs: 2500,
      requestTimeoutMs: Math.round(number("timeout", 20, 5, 120) * 1000),
      rowsPerPage: number("rowsPerPage", 50, 10, 200),
      includeIds: elements.includeIds.checked,
      includeProfilePics: elements.includePics.checked,
    };
  }

  async function runScan() {
    if (["running", "paused", "stopping"].includes(state.status)) return;
    if (state.usersById.size && !confirm(t("confirmRestart"))) return;

    resetScanData();
    readSettings();
    state.status = "running";
    state.startedAt = Date.now();
    addLog(t("requestStarted"), "success");
    addLog(t("browserBlocked"), "info");
    updateUI();

    let hasNextPage = true;
    try {
      while (hasNextPage && !state.abortRequested) {
        while (state.status === "paused" && !state.abortRequested) await sleep(200);
        const connection = await fetchPageWithRetry(state.cursor);

        const remoteCount = Number.isFinite(Number(connection.count)) ? Number(connection.count) : null;
        if (remoteCount !== null) {
          if (!state.metrics.countChanges.includes(remoteCount)) state.metrics.countChanges.push(remoteCount);
          if (state.totalExpected == null) state.totalExpected = remoteCount;
        }

        const edges = Array.isArray(connection.edges) ? connection.edges : [];
        let added = 0;
        let duplicates = 0;
        let invalid = 0;

        state.metrics.receivedRecords += edges.length;
        for (const edge of edges) {
          const user = core.normalizeUser(edge?.node);
          if (!user) {
            invalid += 1;
            state.metrics.invalidRecords += 1;
            continue;
          }
          if (state.usersById.has(user.id)) {
            duplicates += 1;
            state.metrics.duplicateRecords += 1;
          } else {
            added += 1;
          }
          state.usersById.set(user.id, user);
        }

        state.pagesLoaded += 1;
        addLog(
          `Page ${state.pagesLoaded}: ${edges.length} ${t("received")}, ${added} new, ${duplicates} ${t("duplicates")}, ${invalid} ${t("invalid")}.`
        );

        const pageInfo = connection.page_info || {};
        hasNextPage = Boolean(pageInfo.has_next_page);
        const nextCursor = typeof pageInfo.end_cursor === "string" ? pageInfo.end_cursor : null;
        state.cursor = core.registerCursor(state.seenCursors, nextCursor, hasNextPage);
        state.tablePage = 1;
        updateUI();

        if (!hasNextPage) break;
        const longPause =
          state.settings.longPauseEveryPages > 0 &&
          state.pagesLoaded % state.settings.longPauseEveryPages === 0;
        const wait = longPause
          ? randomInt(state.settings.longPauseMinMs, state.settings.longPauseMaxMs)
          : randomInt(state.settings.delayMinMs, state.settings.delayMaxMs);
        if (longPause) addLog(`Preventive pause: ${formatDuration(wait)}.`);
        await interruptibleSleep(wait);
      }

      const integrity = getIntegrity();
      state.status = core.determineCompletionStatus(integrity, state.abortRequested);
      if (state.usedFallback) addLog(t("fallbackWarning"), "warn");
      if (integrity.warnings.includes(core.ERROR_CODES.COUNT_MISMATCH)) {
        addLog(t("countWarning"), "warn", core.ERROR_CODES.COUNT_MISMATCH);
      }
      addLog(
        `${t(state.status === "completed" ? "completed" : "completedWarnings")}: ${integrity.uniqueUsers} unique, ${integrity.receivedRecords} received.`,
        state.status === "completed" ? "success" : "warn"
      );
    } catch (error) {
      if (error?.name === "AbortError" && state.abortRequested) {
        state.status = "incomplete";
        state.lastErrorCode = core.ERROR_CODES.USER_STOPPED;
        addLog(t("userStopped"), "warn", core.ERROR_CODES.USER_STOPPED);
      } else {
        state.status = "error";
        state.lastError = error;
        state.lastErrorCode = error?.code || core.ERROR_CODES.NETWORK_ERROR;
        addLog(`${state.lastErrorCode}: ${error?.message || String(error)}`, "error", state.lastErrorCode);
      }
    } finally {
      state.endedAt = Date.now();
      state.currentAbortController = null;
      state.abortRequested = false;
      updateUI();
    }
  }

  function pauseScan() {
    if (state.status !== "running") return;
    state.status = "paused";
    updateUI();
  }

  function resumeScan() {
    if (state.status !== "paused") return;
    state.status = "running";
    updateUI();
  }

  function stopScan() {
    if (!["running", "paused"].includes(state.status)) return;
    state.status = "stopping";
    state.abortRequested = true;
    state.currentAbortController?.abort();
    updateUI();
  }

  function safeUserExport(user) {
    const output = {
      username: user.username,
      fullName: user.fullName,
      classification: core.classifyUser(user),
      followsViewer: user.followsViewer,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      profileUrl: `https://www.instagram.com/${user.username}/`,
    };
    if (state.settings.includeIds) output.id = user.id;
    if (state.settings.includeProfilePics) output.profilePicUrl = user.profilePicUrl;
    return output;
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

  function exportCsv() {
    readSettings();
    const users = getFilteredUsers().map(safeUserExport);
    if (!users.length) return;
    const keys = Object.keys(users[0]);
    const csv = "\uFEFF" + [keys, ...users.map((user) => keys.map((key) => user[key]))]
      .map((row) => row.map(core.csvEscape).join(","))
      .join("\r\n");
    downloadText(`instagram_${state.activeTab}_${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
  }

  function buildDiagnostic() {
    return core.createSafeDiagnostic({
      version: VERSION,
      status: state.status,
      errorCode: state.lastErrorCode,
      sourcePath: state.sourcePath,
      endpointId: adapter.ENDPOINT_ID,
      requestCount: state.metrics.requestCount,
      retryCount: state.metrics.retryCount,
      integrity: getIntegrity(),
      browser: navigator.userAgent.replace(/\([^)]*\)/g, "(redacted)"),
    });
  }

  function exportJson() {
    readSettings();
    const payload = {
      diagnostic: buildDiagnostic(),
      users: getAllUsers().map(safeUserExport),
      log: state.log.map(({ time, level, code, message }) => ({ time, level, code, message })),
    };
    downloadText(`instagram_scan_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  async function copyVisible() {
    const users = getFilteredUsers();
    if (!users.length) return;
    await navigator.clipboard.writeText(users.map((user) => `@${user.username}`).join("\n"));
    addLog(`${users.length} ${t("copied")}`, "success");
  }

  async function copyDiagnostic() {
    await navigator.clipboard.writeText(JSON.stringify(buildDiagnostic(), null, 2));
    addLog(t("diagnosticCopied"), "success");
  }

  const host = document.createElement("div");
  host.id = "ig-nofollowback-readonly-host";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host{all:initial}*{box-sizing:border-box}.shell{pointer-events:auto;position:fixed;inset:14px;display:grid;grid-template-rows:auto auto minmax(0,1fr);color:#f8fafc;background:#0f172a;border:1px solid #334155;border-radius:18px;box-shadow:0 24px 80px #0009;overflow:hidden;font-family:Inter,system-ui,sans-serif}.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;background:#111827;border-bottom:1px solid #334155}.title{font-size:16px;font-weight:850}.subtitle,.hint{font-size:11px;color:#94a3b8}.actions,.tabs,.toolbar,.pagination{display:flex;gap:8px;align-items:center;flex-wrap:wrap}button,select,input{font:inherit}button,select{border:1px solid #475569;background:#1e293b;color:#f8fafc;border-radius:10px;padding:8px 11px;font-weight:750}button{cursor:pointer}button:hover:not(:disabled){background:#334155}button.primary{background:#7c3aed;border-color:#7c3aed}button.danger{background:#991b1b;border-color:#b91c1c}button:disabled{opacity:.42;cursor:not-allowed}.summary{padding:11px 16px;border-bottom:1px solid #334155;background:#0b1220}.statusline{display:flex;justify-content:space-between;gap:12px;font-size:12px;color:#cbd5e1;margin-bottom:8px}.progress{height:8px;background:#1e293b;border-radius:999px;overflow:hidden}.progress div{height:100%;background:linear-gradient(90deg,#7c3aed,#22c55e);transition:width .2s}.counts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}.count{border:1px solid #334155;background:#111827;border-radius:12px;padding:9px}.count strong{display:block;font-size:19px}.count span{font-size:10px;color:#94a3b8}.count.warn{border-color:#b45309}.body{min-height:0;display:grid;grid-template-columns:285px minmax(0,1fr)}aside{min-height:0;overflow:auto;padding:13px;border-right:1px solid #334155;background:#111827}main{min-width:0;min-height:0;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto;padding:13px;gap:9px}.section,.integrityBox{border:1px solid #334155;background:#0f172a;border-radius:12px;padding:11px;margin-bottom:11px}.section h3{margin:0 0 9px;font-size:13px}.field{margin-bottom:8px}.field label{display:block;color:#cbd5e1;font-size:10px;margin-bottom:3px}.two{display:grid;grid-template-columns:1fr 1fr;gap:7px}input[type=number],input[type=search]{width:100%;border:1px solid #475569;background:#0b1220;color:#f8fafc;border-radius:9px;padding:8px}.check{display:flex;gap:7px;align-items:flex-start;font-size:11px;color:#cbd5e1;margin:8px 0}.tabs button.active{background:#7c3aed;border-color:#7c3aed}.toolbar input{flex:1 1 220px}.integrityBox{margin:0;display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#cbd5e1}.integrityBox.warn{border-color:#b45309;background:#451a0322}.tablewrap{min-height:0;overflow:auto;border:1px solid #334155;border-radius:12px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:9px 10px;border-bottom:1px solid #243244;text-align:left}th{position:sticky;top:0;background:#111827;z-index:1;color:#cbd5e1}tr:hover td{background:#111827}a{color:#c4b5fd;text-decoration:none;font-weight:700}.badge{display:inline-block;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:800}.badge.no{background:#7f1d1d;color:#fecaca}.badge.yes{background:#14532d;color:#bbf7d0}.badge.unknown{background:#78350f;color:#fde68a}.pagination{justify-content:space-between;color:#94a3b8;font-size:12px}.log{max-height:175px;overflow:auto;background:#020617;border:1px solid #334155;border-radius:9px;padding:7px;font:10px/1.55 ui-monospace,monospace}.log .warn{color:#fde68a}.log .error{color:#fca5a5}.log .success{color:#86efac}.empty{padding:28px;color:#94a3b8;text-align:center}@media(max-width:850px){.shell{inset:0;border-radius:0}.body{grid-template-columns:1fr}aside{display:none}.counts{grid-template-columns:repeat(2,1fr)}th:nth-child(3),td:nth-child(3),th:nth-child(5),td:nth-child(5){display:none}}
    </style>
    <section class="shell" role="dialog" aria-modal="true" aria-labelledby="scannerTitle" tabindex="-1">
      <header class="topbar">
        <div><div class="title" id="scannerTitle" data-i18n="title"></div><div class="subtitle"><span data-i18n="subtitle"></span> · v${VERSION}</div></div>
        <div class="actions"><select id="locale" aria-label="Language"><option value="es">ES</option><option value="en">EN</option></select><button id="start" class="primary" data-i18n="start"></button><button id="pause" data-i18n="pause"></button><button id="resume" data-i18n="resume"></button><button id="stop" class="danger" data-i18n="stop"></button><button id="close" data-i18n="close"></button></div>
      </header>
      <section class="summary"><div class="statusline"><span id="statusText"></span><span id="duration"></span></div><div class="progress"><div id="progressBar"></div></div><div class="counts"><div class="count"><strong id="allCount">0</strong><span data-i18n="processed"></span></div><div class="count"><strong id="nonfollowersCount">0</strong><span data-i18n="nonfollowers"></span></div><div class="count"><strong id="mutualsCount">0</strong><span data-i18n="mutuals"></span></div><div class="count"><strong id="uncertainCount">0</strong><span data-i18n="uncertain"></span></div><div id="integrityCard" class="count"><strong id="integrityStatus">—</strong><span data-i18n="integrity"></span></div></div></section>
      <div class="body"><aside>
        <section class="section"><h3 data-i18n="settings"></h3><div class="two"><div class="field"><label data-i18n="minDelay"></label><input id="delayMin" type="number" value="1.4" min="0.5" max="30" step="0.1"></div><div class="field"><label data-i18n="maxDelay"></label><input id="delayMax" type="number" value="2.8" min="0.5" max="60" step="0.1"></div></div><div class="field"><label data-i18n="longEvery"></label><input id="longEvery" type="number" value="6" min="1" max="50"></div><div class="two"><div class="field"><label data-i18n="longMin"></label><input id="longMin" type="number" value="12" min="5" max="300"></div><div class="field"><label data-i18n="longMax"></label><input id="longMax" type="number" value="22" min="5" max="600"></div></div><div class="two"><div class="field"><label data-i18n="retries"></label><input id="maxRetries" type="number" value="3" min="0" max="5"></div><div class="field"><label data-i18n="timeout"></label><input id="timeout" type="number" value="20" min="5" max="120"></div></div><div class="field"><label data-i18n="rows"></label><input id="rowsPerPage" type="number" value="50" min="10" max="200"></div><label class="check"><input id="includeIds" type="checkbox"><span data-i18n="ids"></span></label><label class="check"><input id="includePics" type="checkbox"><span data-i18n="pics"></span></label><p class="hint" data-i18n="retryHint"></p></section>
        <section class="section"><h3 data-i18n="exports"></h3><div class="actions"><button id="copy" data-i18n="copyVisible"></button><button id="csv" data-i18n="csvVisible"></button><button id="json" data-i18n="jsonFull"></button><button id="diagnostic" data-i18n="copyDiagnostic"></button></div></section>
        <section class="section"><h3 data-i18n="log"></h3><div id="log" class="log"></div></section>
      </aside><main>
        <div class="tabs"><button data-tab="nonfollowers" class="active" data-i18n="nonfollowers"></button><button data-tab="mutuals" data-i18n="mutuals"></button><button data-tab="uncertain" data-i18n="uncertain"></button><button data-tab="all" data-i18n="all"></button></div>
        <div class="toolbar"><input id="search" type="search"><span id="visibleCount" class="hint"></span></div>
        <div id="integrityBox" class="integrityBox"></div>
        <div class="tablewrap"><table><thead><tr><th>#</th><th data-i18n="user"></th><th data-i18n="name"></th><th data-i18n="relation"></th><th data-i18n="details"></th></tr></thead><tbody id="rows"></tbody></table><div id="empty" class="empty" data-i18n="noResults"></div></div>
        <div class="pagination"><span id="pageInfo"></span><div><button id="prevPage" data-i18n="previous"></button><button id="nextPage" data-i18n="next"></button></div></div>
      </main></div>
    </section>`;

  const ids = ["start","pause","resume","stop","close","locale","statusText","duration","progressBar","allCount","nonfollowersCount","mutualsCount","uncertainCount","integrityCard","integrityStatus","delayMin","delayMax","longEvery","longMin","longMax","maxRetries","timeout","rowsPerPage","includeIds","includePics","copy","csv","json","diagnostic","log","search","visibleCount","integrityBox","rows","empty","pageInfo","prevPage","nextPage"];
  const elements = Object.fromEntries(ids.map((id) => [id, shadow.getElementById(id)]));
  const tabButtons = [...shadow.querySelectorAll("[data-tab]")];
  const shell = shadow.querySelector(".shell");

  function applyLanguage() {
    shadow.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
    elements.search.placeholder = t("search");
    updateUI();
  }

  function renderLog() {
    elements.log.replaceChildren();
    if (!state.log.length) {
      const row = document.createElement("div"); row.textContent = t("noActivity"); elements.log.appendChild(row); return;
    }
    state.log.slice(-100).forEach((entry) => {
      const row = document.createElement("div"); row.className = entry.level;
      row.textContent = `[${new Date(entry.time).toLocaleTimeString(state.locale)}]${entry.code ? ` [${entry.code}]` : ""} ${entry.message}`;
      elements.log.appendChild(row);
    });
    elements.log.scrollTop = elements.log.scrollHeight;
  }

  function statusLabel() {
    const map = { idle:"ready",running:"running",paused:"paused",stopping:"stopping",completed:"completed",completed_with_warnings:"completedWarnings",incomplete:"incomplete",error:"error" };
    return t(map[state.status] || "ready");
  }

  function renderTable() {
    const users = getFilteredUsers();
    const perPage = state.settings.rowsPerPage;
    const pages = Math.max(1, Math.ceil(users.length / perPage));
    state.tablePage = Math.min(Math.max(1, state.tablePage), pages);
    const start = (state.tablePage - 1) * perPage;
    const pageUsers = users.slice(start, start + perPage);
    elements.visibleCount.textContent = `${users.length.toLocaleString(state.locale)} ${t("results")}`;
    elements.pageInfo.textContent = `${t("page")} ${state.tablePage} ${t("of")} ${pages}`;
    elements.prevPage.disabled = state.tablePage <= 1;
    elements.nextPage.disabled = state.tablePage >= pages;
    elements.rows.replaceChildren();

    pageUsers.forEach((user, index) => {
      const tr = document.createElement("tr");
      const number = document.createElement("td"); number.textContent = String(start + index + 1);
      const username = document.createElement("td"); const link = document.createElement("a"); link.href = `https://www.instagram.com/${encodeURIComponent(user.username)}/`; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = `@${user.username}`; username.appendChild(link);
      const name = document.createElement("td"); name.textContent = user.fullName || "—";
      const relation = document.createElement("td"); const badge = document.createElement("span"); const classification = core.classifyUser(user); badge.className = classification === "nonfollowers" ? "badge no" : classification === "mutuals" ? "badge yes" : "badge unknown"; badge.textContent = classification === "nonfollowers" ? t("noFollow") : classification === "mutuals" ? t("mutual") : t("uncertainBadge"); relation.appendChild(badge);
      const details = document.createElement("td"); const values = []; if (user.isVerified) values.push(t("verified")); if (user.isPrivate) values.push(t("private")); if (user.requestedByViewer) values.push(t("pending")); details.textContent = values.join(" · ") || "—";
      tr.append(number, username, name, relation, details); elements.rows.appendChild(tr);
    });
    elements.empty.style.display = pageUsers.length ? "none" : "block";
  }

  function updateUI() {
    const counts = getCounts();
    const integrity = getIntegrity();
    const progress = state.totalExpected && state.totalExpected > 0 ? Math.min(100, Math.round((counts.all / state.totalExpected) * 100)) : state.status === "completed" ? 100 : 0;
    elements.statusText.textContent = `${statusLabel()} · ${state.pagesLoaded} ${t("pages")}${state.totalExpected != null ? ` · ${t("expected")}: ${state.totalExpected}` : ""}`;
    elements.duration.textContent = `${t("duration")}: ${formatDuration(state.startedAt ? (state.endedAt || Date.now()) - state.startedAt : null)}`;
    elements.progressBar.style.width = `${progress}%`;
    elements.allCount.textContent = counts.all.toLocaleString(state.locale);
    elements.nonfollowersCount.textContent = counts.nonfollowers.toLocaleString(state.locale);
    elements.mutualsCount.textContent = counts.mutuals.toLocaleString(state.locale);
    elements.uncertainCount.textContent = counts.uncertain.toLocaleString(state.locale);
    elements.integrityStatus.textContent = integrity.complete ? t("integrityOk") : t("integrityWarn");
    elements.integrityCard.classList.toggle("warn", !integrity.complete);
    elements.integrityBox.classList.toggle("warn", !integrity.complete);
    elements.integrityBox.textContent = `${t("received")}: ${integrity.receivedRecords} · ${t("processed")}: ${integrity.uniqueUsers} · ${t("duplicates")}: ${integrity.duplicateRecords} · ${t("invalid")}: ${integrity.invalidRecords} · ${t("difference")}: ${integrity.expectedDifference ?? "—"} · ${t("source")}: ${state.sourcePath || "—"}`;

    elements.start.disabled = ["running","paused","stopping"].includes(state.status);
    elements.pause.disabled = state.status !== "running";
    elements.resume.disabled = state.status !== "paused";
    elements.stop.disabled = !["running","paused"].includes(state.status);
    const disabled = ["running","paused","stopping"].includes(state.status);
    ["delayMin","delayMax","longEvery","longMin","longMax","maxRetries","timeout","rowsPerPage"].forEach((id) => elements[id].disabled = disabled);
    renderTable(); renderLog();
  }

  function destroy() {
    state.abortRequested = true;
    state.currentAbortController?.abort();
    host.remove();
    delete root[APP_KEY];
  }

  elements.start.addEventListener("click", runScan);
  elements.pause.addEventListener("click", pauseScan);
  elements.resume.addEventListener("click", resumeScan);
  elements.stop.addEventListener("click", stopScan);
  elements.close.addEventListener("click", () => { if (["running","paused"].includes(state.status) && !confirm(t("confirmClose"))) return; destroy(); });
  elements.locale.addEventListener("change", () => { state.locale = elements.locale.value; applyLanguage(); });
  elements.search.addEventListener("input", () => { state.search = elements.search.value; state.tablePage = 1; renderTable(); });
  elements.copy.addEventListener("click", () => copyVisible().catch((error) => addLog(error.message, "error")));
  elements.csv.addEventListener("click", exportCsv);
  elements.json.addEventListener("click", exportJson);
  elements.diagnostic.addEventListener("click", () => copyDiagnostic().catch((error) => addLog(error.message, "error")));
  elements.prevPage.addEventListener("click", () => { state.tablePage -= 1; renderTable(); });
  elements.nextPage.addEventListener("click", () => { state.tablePage += 1; renderTable(); });
  tabButtons.forEach((button) => button.addEventListener("click", () => { state.activeTab = button.dataset.tab; state.tablePage = 1; tabButtons.forEach((item) => item.classList.toggle("active", item === button)); renderTable(); }));

  shell.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (["running","paused"].includes(state.status) && !confirm(t("confirmClose"))) return;
      destroy();
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...shadow.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]")];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && shadow.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && shadow.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  root[APP_KEY] = { version: VERSION, state, focus: () => { host.style.display = ""; shell.focus(); }, destroy, diagnostic: buildDiagnostic };
  applyLanguage();
  setTimeout(() => elements.start.focus(), 0);
})(typeof globalThis !== "undefined" ? globalThis : window);
