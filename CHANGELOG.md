# Changelog

## [1.1.0] - 2026-08-05

### Added

- Strict response-path validation with ambiguity rejection.
- Integrity statistics for expected, received, unique, duplicate, invalid and uncertain records.
- `completed_with_warnings` and `incomplete` states.
- Per-request timeout with abort support.
- Explicit HTTP retry/fatal policy and machine-readable error codes.
- Interruptible retry delays.
- Safe, username-free diagnostic export.
- CSV spreadsheet-formula protection.
- Optional internal-ID and profile-picture exports, disabled by default.
- Spanish and English user interface.
- Keyboard focus trap and `Escape` close support.
- Modular source layout and deterministic bundle generation.
- Automated tests for parsing, classification, cursors, HTTP policy, integrity and CSV handling.

### Changed

- The scanner no longer silently selects the first GraphQL-like connection it finds.
- Completion now reports warnings when counts do not reconcile.
- Export files omit internal IDs and profile-picture URLs unless explicitly enabled.
- GitHub Actions now builds the bundle and runs the test suite.

## [1.0.0] - 2026-08-05

### Added

- Initial public read-only scanner.
- Pagination and deduplication by Instagram user ID.
- Relationship classification using `follows_viewer`.
- Pause, resume, stop, search, CSV and JSON exports.
- Fatal handling for HTTP 401, 403 and 429.
