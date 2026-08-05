# Architecture

## Source layout

- `lib/core.js`: pure parsing, validation, classification, integrity and export-safety helpers.
- `lib/instagram-adapter.js`: endpoint identifier, URL creation and known response paths.
- `lib/app.js`: browser requests, state machine, user interface and exports.
- `scripts/build.js`: deterministic concatenation into the copy-and-paste bundle.
- `src/instagram-no-followback-readonly.js`: generated browser bundle.
- `tests/core.test.js`: Node test suite for the safety-critical pure logic.

## Response selection

The adapter first checks explicit known following paths. A compatibility scan is allowed only when exactly one strict candidate exists. A candidate must contain valid user records and a reliable `follows_viewer` field. Multiple candidates cause `AMBIGUOUS_RESPONSE`; no candidate causes `UNSUPPORTED_RESPONSE`.

This design prefers stopping over silently classifying the wrong relationship list.

## Request policy

Only same-origin `GET` requests are made. Each request has a configurable timeout.

- `401`, `403`: fatal session rejection.
- `429`: fatal rate limit.
- `400`, `404`, `405`, `410`, `422`: fatal incompatibility/client error.
- `408`, `500`, `502`, `503`, `504`: retryable.
- Timeout/network errors: retryable within the configured maximum.

## Integrity model

The scanner tracks:

- Initial expected count.
- All records received.
- Unique users.
- Duplicate records.
- Invalid records.
- Uncertain relationships.
- Remote count changes.
- Pages, requests and retries.

Any mismatch produces `completed_with_warnings`, not a silent success.

## Privacy model

Results remain in memory until the user exports them. Internal IDs and profile-image URLs are excluded by default. The diagnostic report contains aggregate statistics and technical codes, but no usernames or user IDs.
