# Usage guide

## Before you start

This script runs inside an authenticated `www.instagram.com` browser session. Never type your password into the script or share account cookies or tokens.

The tool is read-only:

- It only performs `GET` requests.
- It contains no unfollow action.
- It sends no result data to external services.
- It stops on critical errors and rate limits.

## Run the scanner

1. Open `https://www.instagram.com/`.
2. Sign in normally.
3. Open the browser developer console.
4. Open `src/instagram-no-followback-readonly.js` from this repository.
5. Review and copy the complete source.
6. Paste it into the console and press `Enter`.
7. Click **Iniciar escaneo**.

## Result categories

- **Non-followers:** `follows_viewer === false`
- **Mutuals:** `follows_viewer === true`
- **Uncertain:** the relationship field is missing or is not boolean
- **All:** every account processed during the scan

## Safety recommendations

- Do not aggressively reduce delays.
- Stop if Instagram returns HTTP `429`.
- Manually verify a sample of results.
- Never use a modified copy that asks for passwords, cookies, session tokens, or external uploads.
- Treat internal Instagram endpoints as unstable and unsupported.
