# Project context

Chrome extension (MV3) that replaces the new tab with a markdown scratchpad.
Audience: developers who work with AI. Free, MIT, no account, no network.

Repository: <https://github.com/m4rcone/scratchpad-newtab>.
Everything in this repository — code, comments, docs, commits, issues and PRs —
is written in English.

## Non-negotiable principles

1. Nothing waits on the disk. The editor is mounted and focused before the first
   read from IndexedDB, and whatever is typed while that read is in flight
   becomes a draft instead of being lost. (Until September 2026 this principle
   read "nothing delays the first character", guaranteed by a static
   `<textarea>`; ByteMD is a component and only exists after the bundle runs.
   See `docs/adr/0001-bytemd-instead-of-a-hand-written-editor.md`.)
2. Saving is automatic and silent.
3. No network request. No telemetry. No permission beyond what is needed — every
   new permission requires a justification in the README.
4. Markdown is the editing format.
5. A new feature only lands by cutting another one. When in doubt, do not
   implement: open an issue with the proposal.

## Stack

TypeScript, Vite, IndexedDB for content, `chrome.storage.local` for preferences.
No UI framework: the shell around the editor is static markup plus a handful of
modules that paint `innerHTML`.

The editor and the preview are [ByteMD](https://bytemd.js.org/) — CodeMirror 5,
remark and rehype — with six plugins: `gfm`, `highlight-ssr`, `math`, `mermaid`,
`breaks` and `gemoji`. `src/app/editor.ts` is only a wrapper around the
component; `src/app/plugins.ts` is the single place that decides what markdown
means here.

ByteMD is a Svelte component, but Svelte's runtime already ships compiled inside
`bytemd/dist` — the project installs neither the compiler nor the `svelte`
package, and the slice of the API actually used is typed by hand in `editor.ts`.

## Working rules

- Persistence always sits behind the `Storage` interface; never call IndexedDB
  directly from the UI layer.
- A new shortcut means checking two keymaps first: the eight actions on ByteMD's
  toolbar, and CodeMirror's `macDefault`/`pcDefault`. The editor gets the key
  before the page does, so a shared chord is not contested, it is lost.
- Architecture decisions become a short ADR in `docs/adr/`.
- `npm test` runs on Node's own runner, with no dependency: every pure behaviour
  that is still ours (titles, slugs, excerpts, grouping) lands with a test.
  Markdown stopped being ours and therefore stopped being tested here.
- Releases: bump the same version in `package.json` and in
  `public/manifest.json`, and add the entry to `CHANGELOG.md`. Chrome only
  accepts one to four dot-separated integers in the manifest, so no `-beta`
  suffixes there.
