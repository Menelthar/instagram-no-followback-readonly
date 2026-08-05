# Troubleshooting

## GitHub Pages returns 404

Deployment may take a few minutes. Confirm the Pages source is `main` and `/(root)`.

## “Copy script” does not work

Download the `.js` file or open the source on GitHub and copy it manually. Clipboard access can be blocked by browser permissions.

## The interface does not appear

Confirm that:

1. You are on `https://www.instagram.com/`.
2. You are signed in.
3. You pasted the complete source.
4. You reloaded the page before retrying.

## `ds_user_id` was not found

Reload Instagram and sign in again. Strict cookie settings may interfere with the active session.

## HTTP 401 or 403

The session or request was rejected. Stop, reload, and sign in again. Do not repeatedly retry.

## HTTP 429

Instagram applied a temporary rate limit. Stop and do not immediately restart the scan.

## Unknown response structure

Instagram may have changed its internal response. Keep a sanitized diagnostic log and open an issue without private account data.

## A reported non-follower actually follows me

Manually verify the profile, check for username changes, and remember that the relationship may have changed after the scan started.

## Reporting a bug

Include browser version, script version, exact error, and a sanitized log. Never include passwords, cookies, tokens, IDs, or private username lists.
