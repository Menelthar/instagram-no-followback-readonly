# Contributing

Contributions are welcome when they preserve the project's read-only and privacy-first scope.

## Accepted changes

- Compatibility fixes for Instagram response changes.
- Better validation and diagnostics.
- Accessibility improvements.
- Documentation and translations.
- Tests and static analysis.
- Export and local presentation improvements.

## Out of scope

Pull requests will not be accepted if they add:

- Automated follow or unfollow actions.
- Circumvention of platform safeguards.
- Credential, cookie or token collection.
- External analytics, tracking or result uploads.
- Hidden, obfuscated or remotely loaded executable code.
- Claims that account restrictions can be completely avoided.

## Development

No dependency installation is required for syntax checking:

```bash
npm run check
```

Before opening a pull request:

1. Run the syntax check.
2. Explain the Instagram response shape used.
3. Describe failure behavior.
4. Confirm no non-Instagram network requests were added.
5. Update documentation and changelog when appropriate.
