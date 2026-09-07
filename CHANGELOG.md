# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — the same
number is carried by `package.json` and by `public/manifest.json`.

## [Unreleased]

### Changed

- Write only lets the text fill the pane. The 72ch measure is what keeps the
  two columns readable beside each other, so it now applies to split alone
  instead of capping a single column that has nothing to balance against.

### Fixed

- Preview only showed a blank page. ByteMD's toolbar carries its own write-only
  and preview-only buttons, which swap the root's `bytemd-split` class rather
  than the app's `data-mode`; preview only hid the editor while the app's fold
  was still hiding the preview. The fold now applies only while ByteMD is
  showing both panes.
- Mermaid flowcharts drawn while the preview was folded away came back as an
  empty 16x16 box, with `translate(undefined, NaN)` on their edge labels, and
  stayed broken once the preview was opened. Mermaid measures with `getBBox`,
  which reads zero inside `display: none`, so opening the preview now
  re-renders the viewer rather than only unfolding it in CSS.

## [0.1.0] — 2026-09-06

First public release.

### Added

- A markdown scratchpad that replaces the Chrome new tab (MV3), with the draft
  restored where you left it, caret included.
- Silent autosave: the draft is written 250 ms after the last keystroke, and a
  synchronous `localStorage` mirror keeps the last character when the tab is
  closed before that.
- Multiple drafts, titled by their first line, grouped by day in a side rail.
- Keyboard-navigable full-text search across drafts.
- Split view with a live preview: CommonMark plus full GFM, syntax highlighting,
  LaTeX through KaTeX, mermaid diagrams, `:shortcode:` emoji and single
  newlines as `<br>` — all rendered from bundled code, with no network request.
- Embedded HTML sanitized with `hast-util-sanitize` (GitHub's policy) and
  rendered; `<script>`, `<iframe>` and friends are stripped.
- Copy the whole draft, export it as `.md`, and delete with a confirmation step.
- Light and dark themes following the system, with the option to pin one.
- A narrow-screen layout where the rail becomes a sheet opened from the top bar.

### Notes

- Permissions: `storage` only. No host permissions, no telemetry, no network.
- The editor and the renderer are [ByteMD](https://bytemd.js.org/); see
  [ADR 0001](docs/adr/0001-bytemd-instead-of-a-hand-written-editor.md) for what
  that replaced and what it cost.

[unreleased]: https://github.com/m4rcone/scratchpad-newtab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/m4rcone/scratchpad-newtab/releases/tag/v0.1.0
