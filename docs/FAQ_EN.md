# Frequently asked questions

## Do I need to enter my password?

No. Sign in normally on Instagram Web. The project contains no login form.

## Does the author receive my list?

No. The scanner contains no result-upload feature. Data remains in the browser tab unless you export it.

## Does it automatically unfollow accounts?

No. The project is intentionally read-only.

## Is it official?

No. It is independent and not affiliated with Instagram or Meta.

## Are results guaranteed to be perfect?

No. Instagram can return incomplete data, change relationships during a scan, or modify its internal response. Manually verify a sample.

## Why is there an “Uncertain” category?

When `follows_viewer` is missing or not boolean, the scanner refuses to guess and separates the entry for manual review.

## Does it work on mobile?

Desktop browsers are strongly recommended because mobile developer consoles are limited and difficult to audit.

## How long does a scan take?

It depends on how many accounts you follow, configured delays, and Instagram response times. Stability is prioritized over speed.

## What should I do after HTTP 429?

Stop and do not immediately repeat the scan. Instagram applied a temporary limit.

## Why is automatic unfollow out of scope?

It modifies the account, increases the impact of false results, and makes it harder to confirm whether Instagram accepted each action.
