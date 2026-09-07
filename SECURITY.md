# Security policy

## Supported versions

The latest release is the only supported one.

## What the extension does with your data

Nothing leaves your machine. There is no network request, no telemetry and no
account. Drafts live in IndexedDB and preferences in `chrome.storage.local`, in
your own Chrome profile. The only permission requested is `storage`; there is no
host permission and no access to what you browse.

The one place untrusted input meets rendering is the preview: HTML embedded in a
draft is sanitized with `hast-util-sanitize` under GitHub's policy before being
rendered. Reports about that path are the most interesting ones.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private reporting instead:
**Security → Report a vulnerability** on
<https://github.com/m4rcone/scratchpad-newtab/security/advisories/new>.

Include what you did, what happened, and which version and Chrome build you saw
it on. Expect a first reply within a week.
