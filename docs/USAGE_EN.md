# English usage guide

## Overview

This tool reviews the accounts you follow on Instagram and classifies the relationship value returned by Instagram for each account. It runs inside your browser and does not modify your account.

## Requirements

- Desktop Chrome, Edge, or Firefox.
- An authenticated session at `https://www.instagram.com/`.
- Access to the browser developer console.
- Enough time to let the scan finish without repeatedly restarting it.

No browser extension, Node.js installation, or mobile application is required.

## Run the scanner

1. Open `https://www.instagram.com/` and sign in.
2. Open:
   `https://menelthar.github.io/instagram-no-followback-readonly/`
3. Click **Copiar script**.
4. Return to the Instagram tab.
5. Open the developer console:
   - Windows/Linux: `Ctrl + Shift + J`
   - macOS: `⌘ + ⌥ + J`
6. Paste the complete source and press `Enter`.
7. Click **Iniciar escaneo**.

Keep the default timing settings for the first run.

## Result categories

- **No te sigue / Non-follower:** `follows_viewer === false`
- **Mutuo / Mutual:** `follows_viewer === true`
- **Incierto / Uncertain:** the field is missing or is not boolean
- **Todos / All:** every account processed in the current scan

Uncertain entries must not automatically be treated as non-followers.

## Scanner controls

- Start a new scan.
- Pause and resume.
- Stop while keeping processed data.
- Search and paginate local results.
- Export the current view to CSV.
- Export the complete scan and diagnostic log to JSON.

## Safety recommendations

- Review the source before execution.
- Never share passwords, cookies, or tokens.
- Do not aggressively reduce delays.
- Stop after HTTP `429`.
- Manually verify a sample of results.
- Avoid performing a large number of account actions after the scan.

## Exports

Exported files can contain usernames and relationship data. Store them privately and delete them when no longer needed.

See also:

- [FAQ](FAQ_EN.md)
- [Troubleshooting](TROUBLESHOOTING_EN.md)
- [Privacy](PRIVACY.md)
