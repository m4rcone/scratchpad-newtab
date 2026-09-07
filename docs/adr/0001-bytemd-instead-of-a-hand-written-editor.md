# 1. ByteMD instead of a hand-written editor

- **Date:** 2026-09-06
- **Status:** accepted
- **Supersedes:** the implicit decision to keep our own editor and renderer, and
  the rejection of CodeMirror recorded in `CLAUDE.md`

## Context

The editor was a transparent `<textarea>` over a painted layer, and the preview
was a hand-written markdown parser (920 lines, 443 of them tests). Together they
cost 14.2 KB compressed, accepted the first keystroke in 17 ms and had no
runtime dependency at all. CodeMirror 6 had been rejected precisely for weighing
159 KB on its own.

In exchange, everything markdown has beyond what that parser covered was our
work: maths, diagrams, per-language syntax highlighting and emoji were listed in
the README as out of scope, and each of them would have been more hand-written
code to maintain and test.

## Decision

Adopt [ByteMD](https://bytemd.js.org/) as both the editor and the renderer.

The `Editor` component takes over the whole surface — writing, preview and
toolbar. `editor.ts` stops implementing an editor and becomes a thin wrapper
around the component, keeping the same interface the rest of the app already
consumed. `markdown.ts` and its tests were deleted.

Six plugins come in: `gfm`, `highlight-ssr`, `math`, `mermaid`, `breaks` and
`gemoji`.

## Consequences

**What is gained:** real markdown, maintained by others — full GFM, KaTeX,
mermaid, per-language highlighting, emoji — and 1,363 fewer lines of parser to
maintain.

**What is lost, and has to be said:**

1. _Nothing delays the first character_ stopped holding in its old form. The
   `<textarea>` was static markup and took a keystroke before any module ran; a
   component only exists once the bundle has run. The principle was rewritten to
   what is still true: nothing waits on the disk.
2. _No runtime dependency_ is over. There are seven direct packages and whatever
   they drag along.
3. The extension went from 14.2 KB compressed to roughly a hundred and eight
   times that. The rule "a new feature only lands by cutting another one" still
   stands, but it is no longer guarding a small bundle.
4. HTML embedded in a draft is now sanitized by `hast-util-sanitize` and
   rendered, instead of being escaped. `<b>hi</b>` becomes bold.

**What did not change:** no network request. Everything, KaTeX and mermaid
included, is bundled locally; the manifest still declares only `storage` and no
remote origin.

## Alternatives considered

- **Only ByteMD's `Viewer`**, keeping our own editor: it would have cost ~98 KB
  compressed instead of ~272 KB in the initial chunk, and would have preserved
  principle #1 intact. Rejected: half the hand-written parser would still be
  standing.
- **Progressive boot**, with the static `<textarea>` taking the first keystroke
  and ByteMD taking over afterwards: it would preserve the 17 ms at the cost of
  two editing surfaces and a state handover in the middle of typing.
