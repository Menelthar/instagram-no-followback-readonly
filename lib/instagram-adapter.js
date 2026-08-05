(function initAdapter(root, factory) {
  const api = factory(root?.IGNoFollowCore);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.IGNoFollowAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function adapterFactory(core) {
  "use strict";

  if (!core && typeof require === "function") core = require("./core.js");

  const QUERY_HASH = "3dec7e2c57367ef3da3d987d89f9dbc8";
  const PAGE_SIZE = 24;
  const ENDPOINT_ID = `legacy-graphql:${QUERY_HASH.slice(0, 8)}`;
  const KNOWN_FOLLOWING_PATHS = Object.freeze([
    "data.user.edge_follow",
    "data.xdt_api__v1__friendships__following__connection",
  ]);

  function makeQueryUrl({ userId, cursor, origin, pageSize = PAGE_SIZE }) {
    if (!userId) throw new Error("Missing Instagram user ID");
    const variables = {
      id: String(userId),
      include_reel: true,
      fetch_mutual: false,
      first: pageSize,
    };
    if (cursor) variables.after = cursor;

    const url = new URL("/graphql/query/", origin);
    url.searchParams.set("query_hash", QUERY_HASH);
    url.searchParams.set("variables", JSON.stringify(variables));
    return url.toString();
  }

  function parseFollowingResponse(json) {
    return core.findFollowingConnection(json, KNOWN_FOLLOWING_PATHS);
  }

  return Object.freeze({
    QUERY_HASH,
    PAGE_SIZE,
    ENDPOINT_ID,
    KNOWN_FOLLOWING_PATHS,
    makeQueryUrl,
    parseFollowingResponse,
  });
});
