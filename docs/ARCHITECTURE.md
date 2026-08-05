# Architecture

## Execution model

The project is a single self-contained browser script executed on `www.instagram.com`.

It creates an isolated interface using Shadow DOM and maintains scan state in memory.

## Data flow

1. Read the current Instagram user ID from the `ds_user_id` cookie.
2. Build a same-origin GraphQL query URL.
3. Request one page of accounts followed by the viewer.
4. Locate and validate the following connection object.
5. Normalize each user.
6. Deduplicate by internal user ID.
7. Classify using `follows_viewer`.
8. Render results and optionally export them locally.

## Defensive controls

- Same-host check.
- GET-only request design.
- Finite retries with exponential backoff.
- Fatal handling for HTTP 401, 403 and 429.
- Response-structure validation.
- Repeated-cursor detection.
- Missing-cursor detection.
- Explicit uncertain classification.
- No automatic unfollow functionality.

## Dependency policy

The scanner intentionally has no runtime dependencies and no remote assets. This makes the exact executed source auditable.
