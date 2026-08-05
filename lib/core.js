(function initCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.IGNoFollowCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function coreFactory() {
  "use strict";

  const ERROR_CODES = Object.freeze({
    SESSION_REJECTED: "SESSION_REJECTED",
    RATE_LIMITED: "RATE_LIMITED",
    REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
    NETWORK_ERROR: "NETWORK_ERROR",
    UNSUPPORTED_RESPONSE: "UNSUPPORTED_RESPONSE",
    AMBIGUOUS_RESPONSE: "AMBIGUOUS_RESPONSE",
    REPEATED_CURSOR: "REPEATED_CURSOR",
    MISSING_CURSOR: "MISSING_CURSOR",
    COUNT_MISMATCH: "COUNT_MISMATCH",
    HTTP_ERROR: "HTTP_ERROR",
    USER_STOPPED: "USER_STOPPED",
  });

  class ScannerError extends Error {
    constructor(code, message, options = {}) {
      super(message);
      this.name = "ScannerError";
      this.code = code;
      this.recoverable = Boolean(options.recoverable);
      this.httpStatus = options.httpStatus ?? null;
      this.details = options.details ?? null;
      if (options.cause) this.cause = options.cause;
    }
  }

  function getPath(root, path) {
    return path.split(".").reduce((value, key) => value?.[key], root);
  }

  function pathJoin(parts) {
    return parts.map((part) => (String(part).match(/^\d+$/) ? `[${part}]` : part)).join(".").replace(/\.\[/g, "[");
  }

  function normalizeUser(node) {
    if (!node || typeof node !== "object") return null;
    const id = node.id == null ? "" : String(node.id).trim();
    const username = typeof node.username === "string" ? node.username.trim() : "";
    if (!id || !username) return null;

    return {
      id,
      username,
      fullName: typeof node.full_name === "string" ? node.full_name : "",
      profilePicUrl: typeof node.profile_pic_url === "string" ? node.profile_pic_url : "",
      isPrivate: Boolean(node.is_private),
      isVerified: Boolean(node.is_verified),
      followedByViewer:
        typeof node.followed_by_viewer === "boolean" ? node.followed_by_viewer : null,
      followsViewer: typeof node.follows_viewer === "boolean" ? node.follows_viewer : null,
      requestedByViewer:
        typeof node.requested_by_viewer === "boolean" ? node.requested_by_viewer : null,
    };
  }

  function classifyUser(user) {
    if (user?.followsViewer === false) return "nonfollowers";
    if (user?.followsViewer === true) return "mutuals";
    return "uncertain";
  }

  function inspectConnection(value) {
    if (!value || typeof value !== "object") return { valid: false, reason: "not-object" };
    if (!Array.isArray(value.edges)) return { valid: false, reason: "missing-edges" };
    if (!value.page_info || typeof value.page_info !== "object") {
      return { valid: false, reason: "missing-page-info" };
    }

    const edges = value.edges;
    const sample = edges.slice(0, 25);
    if (!sample.length) {
      return {
        valid: Number.isFinite(Number(value.count)),
        strict: false,
        empty: true,
        count: Number.isFinite(Number(value.count)) ? Number(value.count) : null,
        followsViewerRatio: null,
        followedByViewerRatio: null,
        validUserRatio: null,
      };
    }

    let validUsers = 0;
    let followsViewerFields = 0;
    let followedByViewerTrue = 0;

    for (const edge of sample) {
      const node = edge?.node;
      if (normalizeUser(node)) validUsers += 1;
      if (node && Object.prototype.hasOwnProperty.call(node, "follows_viewer")) {
        followsViewerFields += 1;
      }
      if (node?.followed_by_viewer === true || node?.requested_by_viewer === true) {
        followedByViewerTrue += 1;
      }
    }

    const validUserRatio = validUsers / sample.length;
    const followsViewerRatio = followsViewerFields / sample.length;
    const followedByViewerRatio = followedByViewerTrue / sample.length;

    return {
      valid: validUserRatio >= 0.9 && followsViewerRatio >= 0.9,
      strict:
        validUserRatio >= 0.9 &&
        followsViewerRatio >= 0.9 &&
        followedByViewerRatio >= 0.5,
      empty: false,
      count: Number.isFinite(Number(value.count)) ? Number(value.count) : null,
      followsViewerRatio,
      followedByViewerRatio,
      validUserRatio,
    };
  }

  function collectStrictCandidates(root, maxDepth = 8) {
    const candidates = [];
    const queue = [{ value: root, path: [], depth: 0 }];
    const visited = new WeakSet();

    while (queue.length) {
      const current = queue.shift();
      const { value, path, depth } = current;
      if (!value || typeof value !== "object" || depth > maxDepth) continue;
      if (visited.has(value)) continue;
      visited.add(value);

      const inspection = inspectConnection(value);
      if (inspection.strict) {
        candidates.push({ connection: value, path: pathJoin(path), inspection });
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((child, index) => {
          if (child && typeof child === "object") {
            queue.push({ value: child, path: [...path, String(index)], depth: depth + 1 });
          }
        });
      } else {
        for (const [key, child] of Object.entries(value)) {
          if (child && typeof child === "object") {
            queue.push({ value: child, path: [...path, key], depth: depth + 1 });
          }
        }
      }
    }

    return candidates;
  }

  function findFollowingConnection(root, knownPaths) {
    const paths = Array.isArray(knownPaths) ? knownPaths : [];

    for (const path of paths) {
      const value = getPath(root, path);
      const inspection = inspectConnection(value);
      if (inspection.valid) {
        return {
          connection: value,
          sourcePath: path,
          usedFallback: false,
          inspection,
        };
      }
    }

    const candidates = collectStrictCandidates(root);
    if (candidates.length === 1) {
      return {
        connection: candidates[0].connection,
        sourcePath: candidates[0].path,
        usedFallback: true,
        inspection: candidates[0].inspection,
      };
    }

    if (candidates.length > 1) {
      throw new ScannerError(
        ERROR_CODES.AMBIGUOUS_RESPONSE,
        "Instagram devolvió varias listas compatibles. El escaneo se detuvo para no elegir una lista incorrecta.",
        { details: { candidatePaths: candidates.map((item) => item.path) } }
      );
    }

    throw new ScannerError(
      ERROR_CODES.UNSUPPORTED_RESPONSE,
      "Instagram devolvió una estructura que esta versión no reconoce.",
      {
        details: {
          topLevelKeys: root && typeof root === "object" ? Object.keys(root).slice(0, 20) : [],
        },
      }
    );
  }

  function classifyHttpStatus(status) {
    const code = Number(status);
    if (code === 401 || code === 403) {
      return { action: "fatal", code: ERROR_CODES.SESSION_REJECTED };
    }
    if (code === 429) return { action: "fatal", code: ERROR_CODES.RATE_LIMITED };
    if ([408, 500, 502, 503, 504].includes(code)) {
      return { action: "retry", code: ERROR_CODES.HTTP_ERROR };
    }
    if ([400, 404, 405, 410, 422].includes(code)) {
      return { action: "fatal", code: ERROR_CODES.UNSUPPORTED_RESPONSE };
    }
    if (code >= 400 && code < 500) {
      return { action: "fatal", code: ERROR_CODES.HTTP_ERROR };
    }
    if (code >= 500) return { action: "retry", code: ERROR_CODES.HTTP_ERROR };
    return { action: "ok", code: null };
  }

  function registerCursor(seen, nextCursor, hasNextPage) {
    if (hasNextPage && !nextCursor) {
      throw new ScannerError(
        ERROR_CODES.MISSING_CURSOR,
        "Instagram indicó que existe otra página, pero no entregó un cursor."
      );
    }
    if (nextCursor && seen.has(nextCursor)) {
      throw new ScannerError(
        ERROR_CODES.REPEATED_CURSOR,
        "Instagram repitió el mismo cursor. El escaneo se detuvo para evitar un ciclo infinito."
      );
    }
    if (nextCursor) seen.add(nextCursor);
    return nextCursor ?? null;
  }

  function safeSpreadsheetValue(value) {
    const text = value == null ? "" : String(value);
    return /^[=+\-@]/.test(text) ? `'${text}` : text;
  }

  function csvEscape(value) {
    const text = safeSpreadsheetValue(value);
    return `"${text.replaceAll('"', '""')}"`;
  }

  function computeIntegrityStats(input) {
    const stats = {
      totalExpected: Number.isFinite(input.totalExpected) ? input.totalExpected : null,
      receivedRecords: Number(input.receivedRecords || 0),
      uniqueUsers: Number(input.uniqueUsers || 0),
      duplicateRecords: Number(input.duplicateRecords || 0),
      invalidRecords: Number(input.invalidRecords || 0),
      uncertainUsers: Number(input.uncertainUsers || 0),
      pagesLoaded: Number(input.pagesLoaded || 0),
      countChanges: Array.isArray(input.countChanges) ? [...input.countChanges] : [],
    };

    stats.expectedDifference =
      stats.totalExpected == null ? null : stats.totalExpected - stats.uniqueUsers;

    const warnings = [];
    if (stats.expectedDifference !== null && stats.expectedDifference !== 0) {
      warnings.push(ERROR_CODES.COUNT_MISMATCH);
    }
    if (stats.duplicateRecords > 0) warnings.push("DUPLICATES_FOUND");
    if (stats.invalidRecords > 0) warnings.push("INVALID_RECORDS_FOUND");
    if (stats.uncertainUsers > 0) warnings.push("UNCERTAIN_RELATIONSHIPS");
    if (stats.countChanges.length > 1) warnings.push("REMOTE_COUNT_CHANGED");

    return { ...stats, warnings, complete: warnings.length === 0 };
  }

  function determineCompletionStatus(integrity, stopped = false) {
    if (stopped) return "incomplete";
    return integrity?.warnings?.length ? "completed_with_warnings" : "completed";
  }

  function createSafeDiagnostic(input) {
    return {
      generatedAt: new Date().toISOString(),
      version: input.version,
      status: input.status,
      errorCode: input.errorCode ?? null,
      sourcePath: input.sourcePath ?? null,
      endpointId: input.endpointId ?? null,
      requestCount: Number(input.requestCount || 0),
      retryCount: Number(input.retryCount || 0),
      integrity: input.integrity,
      browser: input.browser ?? null,
    };
  }

  return Object.freeze({
    ERROR_CODES,
    ScannerError,
    normalizeUser,
    classifyUser,
    inspectConnection,
    findFollowingConnection,
    classifyHttpStatus,
    registerCursor,
    safeSpreadsheetValue,
    csvEscape,
    computeIntegrityStats,
    determineCompletionStatus,
    createSafeDiagnostic,
  });
});
