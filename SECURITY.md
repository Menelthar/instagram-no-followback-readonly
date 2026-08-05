# Security policy

## Supported versions

Only the latest version on the `main` branch is supported.

## Reporting a vulnerability

Do not publish passwords, cookies, tokens, exported account data or other sensitive information in a public issue.

Use GitHub's private vulnerability reporting feature when it is enabled for this repository. Otherwise, open a public issue containing only a high-level description and ask the maintainer for a private reporting channel.

## Security invariants

The project is intended to remain:

- Read-only.
- Unminified and auditable.
- Free of external trackers.
- Free of credential collection.
- Free of automated account modification.
- Same-origin for Instagram data requests.

Changes violating these invariants should be treated as security-sensitive.
