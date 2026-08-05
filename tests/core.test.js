"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../lib/core.js");
const adapter = require("../lib/instagram-adapter.js");

function node(overrides = {}) {
  return {
    id: "1",
    username: "sample_user",
    full_name: "Sample User",
    follows_viewer: false,
    followed_by_viewer: true,
    ...overrides,
  };
}

function connection(nodes, count = nodes.length) {
  return {
    count,
    edges: nodes.map((item) => ({ node: item })),
    page_info: { has_next_page: false, end_cursor: null },
  };
}

test("uses the explicit following path", () => {
  const expected = connection([node()]);
  const result = core.findFollowingConnection({ data: { user: { edge_follow: expected } } }, ["data.user.edge_follow"]);
  assert.equal(result.connection, expected);
  assert.equal(result.sourcePath, "data.user.edge_follow");
  assert.equal(result.usedFallback, false);
});

test("rejects a follower-like connection without follows_viewer", () => {
  const followers = connection([node({ follows_viewer: undefined, followed_by_viewer: false })]);
  assert.throws(
    () => core.findFollowingConnection({ data: { user: { edge_followed_by: followers } } }, ["data.user.edge_follow"]),
    (error) => error.code === core.ERROR_CODES.UNSUPPORTED_RESPONSE
  );
});

test("rejects ambiguous fallback candidates", () => {
  const a = connection([node({ id: "1", username: "a" })]);
  const b = connection([node({ id: "2", username: "b" })]);
  assert.throws(
    () => core.findFollowingConnection({ a, b }, []),
    (error) => error.code === core.ERROR_CODES.AMBIGUOUS_RESPONSE
  );
});

test("classifies relationships", () => {
  assert.equal(core.classifyUser({ followsViewer: false }), "nonfollowers");
  assert.equal(core.classifyUser({ followsViewer: true }), "mutuals");
  assert.equal(core.classifyUser({ followsViewer: null }), "uncertain");
});

test("normalizes valid users and rejects incomplete records", () => {
  assert.equal(core.normalizeUser(node()).username, "sample_user");
  assert.equal(core.normalizeUser({ username: "missing_id" }), null);
  assert.equal(core.normalizeUser({ id: "1" }), null);
});

test("protects CSV cells from spreadsheet formulas", () => {
  assert.equal(core.safeSpreadsheetValue("=1+1"), "'=1+1");
  assert.equal(core.safeSpreadsheetValue("@cmd"), "'@cmd");
  assert.equal(core.safeSpreadsheetValue("normal"), "normal");
  assert.equal(core.csvEscape('a"b'), '"a""b"');
});

test("uses an explicit HTTP retry policy", () => {
  assert.deepEqual(core.classifyHttpStatus(429), { action: "fatal", code: core.ERROR_CODES.RATE_LIMITED });
  assert.equal(core.classifyHttpStatus(503).action, "retry");
  assert.equal(core.classifyHttpStatus(404).action, "fatal");
  assert.equal(core.classifyHttpStatus(200).action, "ok");
});

test("detects missing and repeated cursors", () => {
  const seen = new Set();
  assert.throws(() => core.registerCursor(seen, null, true), (error) => error.code === core.ERROR_CODES.MISSING_CURSOR);
  assert.equal(core.registerCursor(seen, "abc", true), "abc");
  assert.throws(() => core.registerCursor(seen, "abc", true), (error) => error.code === core.ERROR_CODES.REPEATED_CURSOR);
});

test("reports count mismatches, duplicates and invalid records", () => {
  const stats = core.computeIntegrityStats({
    totalExpected: 693,
    receivedRecords: 693,
    uniqueUsers: 692,
    duplicateRecords: 1,
    invalidRecords: 0,
    uncertainUsers: 0,
    pagesLoaded: 30,
    countChanges: [693],
  });
  assert.equal(stats.expectedDifference, 1);
  assert.ok(stats.warnings.includes(core.ERROR_CODES.COUNT_MISMATCH));
  assert.ok(stats.warnings.includes("DUPLICATES_FOUND"));
  assert.equal(core.determineCompletionStatus(stats), "completed_with_warnings");
});

test("diagnostic output contains no user list", () => {
  const diagnostic = core.createSafeDiagnostic({ version: "1.1.0", status: "completed", integrity: { uniqueUsers: 10 } });
  assert.equal(Object.hasOwn(diagnostic, "users"), false);
  assert.equal(diagnostic.version, "1.1.0");
});

test("adapter builds a read-only GraphQL URL", () => {
  const url = new URL(adapter.makeQueryUrl({ userId: "123", origin: "https://www.instagram.com", cursor: "next" }));
  assert.equal(url.pathname, "/graphql/query/");
  assert.equal(url.searchParams.get("query_hash"), adapter.QUERY_HASH);
  const variables = JSON.parse(url.searchParams.get("variables"));
  assert.equal(variables.id, "123");
  assert.equal(variables.after, "next");
});
