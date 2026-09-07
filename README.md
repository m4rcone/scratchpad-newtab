# Scratchpad

A markdown scratchpad that opens on the Chrome new tab. No account, no network,
your data never leaves your machine.

[![CI](https://github.com/m4rcone/scratchpad-newtab/actions/workflows/ci.yml/badge.svg)](https://github.com/m4rcone/scratchpad-newtab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-4285F4.svg)](https://developer.chrome.com/docs/extensions/develop/migrate)

> Status: **0.1.0**, the first public release. Not on the Chrome Web Store yet —
> load it unpacked, see [Install](#install).

## Principles

1. Nothing waits on the disk.
2. Saving is automatic and silent.
3. No network requests. No telemetry. No permission beyond what is needed.
4. Markdown is the editing format.
5. A new feature only lands by cutting another one.

## What it does

- Opens on the draft you left, caret in place. There is no save button: the
  content is written 250 ms after the last keystroke, and closing the tab right
  away does not cost you the last character.
- Highlights markdown as you type, **without hiding the markers** — you keep
  seeing the `#`, the `**` and the backticks you typed.
- Toggles between a single writing column and writing with the preview beside
  it. The editor is [ByteMD](https://bytemd.js.org/), so the preview is
  CommonMark plus full GFM (tables, task lists, strikethrough, autolinks,
  footnotes), per-language syntax highlighting, LaTeX maths through KaTeX,
  mermaid diagrams, `:shortcode:` emoji and single newlines becoming `<br>`.
  None of it makes a request: KaTeX and mermaid are bundled inside the
  extension.
- HTML embedded in a draft is sanitized by `hast-util-sanitize` (GitHub's
  policy) and rendered — `<b>hi</b>` becomes bold. Script, iframe and the like
  are stripped during sanitization.
- On a narrow screen (a phone or a cramped window) the draft rail becomes a
  sheet opened from the top bar, and the same place toggles the two columns,
  since there is no shortcut without a keyboard.
- Multiple drafts: the title is the first line, with no dialog asking for a name.
- Full-text search, navigable by keyboard alone.
- Copy everything, and export as `.md`.
- Light and dark themes following the system, with the option to pin one.

### Shortcuts

The interface shows `⌘` on macOS and `Ctrl` on Windows and Linux; on a touch
screen it shows no shortcut at all.

| macOS | Windows / Linux | what it does                                            |
| ----- | --------------- | ------------------------------------------------------- |
| `⌘⇧D` | `Ctrl+Shift+D`  | new draft                                               |
| `⌘⇧F` | `Ctrl+Shift+F`  | search drafts (`↑↓` moves, `enter` opens, `esc` closes) |
| `⌘/`  | `Ctrl+/`        | open and close the side preview                         |
| `⌘⇧A` | `Ctrl+Shift+A`  | copy the whole draft                                    |
| `⌘S`  | `Ctrl+S`        | export as `.md`                                         |
| `esc` | `esc`           | close the preview or the rail; cancel a pending delete  |
| `tab` | `tab`           | indents two spaces                                      |

## Install

Requires Node 20 or newer and Chrome 120 or newer.

```bash
git clone https://github.com/m4rcone/scratchpad-newtab.git
cd scratchpad-newtab
npm install
npm run build      # types + build + bundle size report
```

Then, in `chrome://extensions`, turn on developer mode and use **Load unpacked**
pointing at `dist/`. Chrome will ask to confirm the new tab override the first
time you open a tab.

Every CI run also uploads the built `dist/` as an `unpacked-extension` artifact,
if you would rather download a build than produce one.

## Development

| command                                   | what it does                                  |
| ----------------------------------------- | --------------------------------------------- |
| `npm run dev`                             | Vite dev server                               |
| `npm run build`                           | checks types and builds `dist/`               |
| `npm test`                                | unit tests (Node's own runner, no dependency) |
| `npm run typecheck`                       | types only                                    |
| `npm run lint` / `npm run lint:fix`       | ESLint                                        |
| `npm run format` / `npm run format:check` | Prettier                                      |
| `npm run icons`                           | regenerates the extension icons               |

`docs/fixtures/formatting.md` is a fixture, not documentation: it exercises
every markdown construct the preview is expected to handle, and the ones it is
expected to leave as raw text. Paste it into a draft after touching
`src/app/plugins.ts`. Prettier is told to leave it alone, since formatting it
would normalize away the very variations it exists to test.

## Weight

Seven direct runtime dependencies, and almost all of their weight only comes
into play on demand: mermaid's renderers load when a draft draws a diagram, and
KaTeX when it has maths. Nothing is fetched over the network either way — the
whole lot is bundled into `dist/`.

## Permissions requested

Every manifest permission needs a justification here — it is what the Chrome Web
Store asks for and what a user reads before installing.

| permission | why                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `storage`  | keeps preferences (theme and active draft) in `chrome.storage.local`. Draft content lives in IndexedDB, which needs no permission. |

We ask for no host permission, no `tabs`, and nothing that grants access to what
you browse. The manifest declares no remote origin: the extension makes no
requests and loads no external font.

## Where your data lives

In your Chrome profile, on your machine:

- **IndexedDB** (`scratchpad`, store `drafts`): the text of the drafts.
- **`chrome.storage.local`** (`scratchpad.prefs.v1`): theme and the id of the
  active draft.
- **`localStorage`**: a mirror of the draft being edited, written synchronously
  on every keystroke and reconciled and cleared on the next open — this is what
  guarantees the last keystroke is not lost. Also a copy of the chosen theme, so
  the first frame paints in the right colour without waiting on
  `chrome.storage`.

Nothing leaves.

The extension loads nothing from outside: CodeMirror, KaTeX (fonts included) and
mermaid are all bundled into `dist/`.

## Architecture decisions

Short documents in [`docs/adr/`](docs/adr), with the numbers behind each choice.

- [0001 — ByteMD instead of a hand-written editor](docs/adr/0001-bytemd-instead-of-a-hand-written-editor.md)

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), and read the principles above before
proposing a feature: every one that lands has to erase another. When in doubt,
open an issue with the proposal rather than a PR.

## License

[MIT](LICENSE) © Marcone Boff
