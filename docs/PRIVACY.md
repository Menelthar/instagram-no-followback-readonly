# Privacy

## Data processed

The scanner may process the following fields returned by Instagram for accounts you follow:

- Internal account ID.
- Username.
- Display name.
- Profile image URL.
- Private/verified status.
- Relationship fields such as `follows_viewer`.

## Where data goes

The scanner sends read-only requests from your browser to `www.instagram.com`.

It does not intentionally send scan results, cookies, credentials, or account data to the repository owner or another external service.

## Local storage

Scan results remain in JavaScript memory while the interface is open.

Data is written to your device only when you explicitly:

- Export CSV.
- Export JSON.
- Copy usernames to the clipboard.

## Network review

The source code is intentionally unminified. Users are encouraged to inspect every `fetch` call before execution.

The project must not accept changes that add:

- Analytics or trackers.
- External result uploads.
- Password collection.
- Cookie or token exfiltration.
- Automated account modification.
