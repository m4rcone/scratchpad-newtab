## What changes

<!-- One paragraph. If this is a feature, link the issue where it was agreed. -->

## What it replaces

<!--
Principle 5: a new feature only lands by cutting another one. Say what this
removes, or say why it is a fix or a doc and the rule does not apply.
-->

## Checklist

- [ ] `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`
      and `npm run build` all pass
- [ ] No new network request, no telemetry
- [ ] Any new permission is justified in the README's permissions table
- [ ] Any new shortcut was checked against both keymaps (ByteMD's toolbar and
      CodeMirror's `macDefault`/`pcDefault`)
- [ ] Architecture decisions written up as an ADR in `docs/adr/`
- [ ] `CHANGELOG.md` updated under `Unreleased`
