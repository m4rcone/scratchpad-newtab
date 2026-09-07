# Contributing

Thanks for taking a look. This is a small project on purpose, and the fastest
way to have a change accepted is to know what the project refuses to do.

Everything here — code, comments, docs, commits, issues and PRs — is written in
English.

## Before writing code

Read the [principles](README.md#principles). The fifth one is the one that most
often turns a PR down:

> A new feature only lands by cutting another one.

So **open an issue before opening a PR for a feature**. Say what the feature is,
and say what it replaces. A PR that adds something without removing anything is
a conversation, not a merge.

Bug fixes and documentation need no issue first.

## Setting up

Node 20 or newer, Chrome 120 or newer.

```bash
npm install
npm run build
```

Then load `dist/` as an unpacked extension from `chrome://extensions` with
developer mode on.

## Before opening a PR

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

CI runs exactly these, in this order.

## Rules worth knowing before you start

- **Persistence goes behind the `Storage` interface.** The UI layer never calls
  IndexedDB directly.
- **A new shortcut means checking two keymaps first**: the eight actions on
  ByteMD's toolbar and CodeMirror's `macDefault`/`pcDefault`. The editor sees the
  key before the page does, so a shared chord is not contested, it is lost. See
  [Shortcuts](README.md#shortcuts).
- **A new permission means a justification** in the README's permissions table.
  A PR that adds a permission without one will not be merged.
- **Architecture decisions become a short ADR** in [`docs/adr/`](docs/adr).
- **Pure behaviour that is still ours gets a test** (`npm test`, on Node's own
  runner). Markdown stopped being ours and stopped being tested here; after
  touching `src/app/plugins.ts`, paste
  [`docs/fixtures/formatting.md`](docs/fixtures/formatting.md) into a draft and
  look at the preview.

## Releasing

Bump the same version in `package.json` and `public/manifest.json`, add the
entry to `CHANGELOG.md`, and tag `vX.Y.Z`. Chrome accepts only one to four
dot-separated integers in the manifest version, so no `-beta` suffixes there.

## License

By contributing you agree that your contribution is licensed under the
[MIT License](LICENSE).
