/**
 * The editor is ByteMD's, mounted here and wrapped so the rest of the app keeps
 * talking to one small interface instead of to a Svelte component.
 *
 * Two things need the CodeMirror instance that ByteMD drives internally: the
 * caret offset we persist per draft, and focus. ByteMD hands that instance to
 * every plugin through `editorEffect`, so the bridge below is a plugin whose
 * only job is to catch it. That capture happens a microtask after mount, which
 * is why a caret or a focus asked for before it lands is parked and replayed.
 */
import { Editor as ByteMDComponent } from 'bytemd';
import type { BytemdPlugin, EditorProps } from 'bytemd';
import type { Editor as CodeMirrorEditor } from 'codemirror';
import { markdownPlugins } from './plugins.ts';
import type { Mode } from './store.ts';
import { strings } from './strings.ts';

/**
 * ByteMD's own typings extend `SvelteComponentTyped`, which needs the `svelte`
 * package to resolve. Its runtime is already baked into `bytemd/dist`, so
 * installing the compiler for types alone would buy nothing; the two members
 * this file actually touches are named here instead.
 */
interface ByteMDInstance {
  $set(props: Partial<EditorProps>): void;
  $on(event: 'change', handler: (event: CustomEvent<{ value: string }>) => void): void;
}

const ByteMD = ByteMDComponent as unknown as new (options: {
  target: HTMLElement;
  props: EditorProps;
}) => ByteMDInstance;

/**
 * ByteMD is pinned to `split` and never told otherwise. Its `tab` mode is the
 * only thing that renders the Write/Preview tabs, and in that mode the toolbar
 * shows the tabs *instead of* the formatting actions — so switching modes
 * swapped the whole top bar out. Staying in `split` keeps one fixed toolbar,
 * and the app's own `write` view is the same layout with the preview pane
 * folded away in CSS (see `bytemd.css`), which is what `data-mode` selects.
 */
const BYTEMD_MODE = 'split';

export interface Editor {
  setText(text: string, caret?: number): void;
  getText(): string;
  focus(): void;
  /** Re-measure after the host goes from hidden to visible. */
  refresh(): void;
  setMode(mode: Mode): void;
  setTheme(theme: 'dark' | 'light'): void;
  onInput(handler: (text: string, caret: number) => void): void;
  onCaret(handler: (caret: number) => void): void;
  onFocus(handler: () => void): void;
}

export function createEditor(
  host: HTMLElement,
  mode: Mode,
  theme: 'dark' | 'light',
): Editor {
  const inputHandlers: ((text: string, caret: number) => void)[] = [];
  const caretHandlers: ((caret: number) => void)[] = [];
  const focusHandlers: (() => void)[] = [];

  let cm: CodeMirrorEditor | null = null;
  let text = '';
  let pendingCaret: number | null = null;
  let pendingFocus = false;
  /**
   * True while `setText` is loading a draft. CodeMirror reports a `setValue`
   * as a change like any other, and reporting that back as input would save
   * the draft we just opened over itself and move it to the top of the rail.
   * It covers the caret and focus reports for the same reason.
   */
  let loading = false;

  const clamp = (caret: number) => Math.min(Math.max(caret, 0), text.length);
  const caretNow = () => (cm ? cm.indexFromPos(cm.getCursor()) : clamp(text.length));

  function placeCaret(caret: number): void {
    if (!cm) {
      pendingCaret = caret;
      return;
    }
    cm.setCursor(cm.posFromIndex(clamp(caret)));
  }

  /** Not a markdown plugin: the hook ByteMD offers is the only way in. */
  const bridge: BytemdPlugin = {
    editorEffect({ editor }) {
      if (cm === editor) return;
      cm = editor;
      // `setValue` drops the cursor at 0,0 and fires `cursorActivity` before
      // `placeCaret` puts it back, so an unguarded handler persisted caret 0
      // over the draft's own and scheduled a save for a draft nobody edited —
      // which is what discarded the pending write of the draft being left.
      editor.on('cursorActivity', () => {
        if (loading) return;
        for (const handler of caretHandlers) handler(caretNow());
      });
      editor.on('focus', () => {
        if (loading) return;
        for (const handler of focusHandlers) handler();
      });
      if (pendingCaret !== null) {
        placeCaret(pendingCaret);
        pendingCaret = null;
      }
      if (pendingFocus) {
        pendingFocus = false;
        editor.focus();
      }
    },
  };

  const withBridge = (choice: 'dark' | 'light') => [...markdownPlugins(choice), bridge];

  host.dataset.mode = mode;

  const component = new ByteMD({
    target: host,
    props: {
      value: '',
      mode: BYTEMD_MODE,
      plugins: withBridge(theme),
      placeholder: strings.emptyHint,
      // Two spaces, never a tab: the same indent the exported `.md` carries.
      editorConfig: { tabSize: 2, indentUnit: 2, indentWithTabs: false },
    },
  });

  component.$on('change', (event: CustomEvent<{ value: string }>) => {
    text = event.detail.value;
    // ByteMD is a controlled component: keeping the prop equal to what was
    // typed stops the next unrelated `$set` from resurrecting a stale value.
    component.$set({ value: text });
    if (loading) return;
    for (const handler of inputHandlers) handler(text, caretNow());
  });

  return {
    setText(next, caret) {
      loading = true;
      text = next;
      // CodeMirror first and synchronously, so the caret below lands on the
      // text it was measured against; the prop then follows to stay in sync.
      // That `setValue` echoes back through `change` in this same task, which
      // is what `loading` is there to swallow; the microtask covers the other
      // path, where the value reaches CodeMirror through Svelte's own flush.
      if (cm && cm.getValue() !== next) cm.setValue(next);
      component.$set({ value: next });
      if (caret !== undefined) placeCaret(caret);
      queueMicrotask(() => {
        loading = false;
      });
    },
    getText: () => (cm ? cm.getValue() : text),
    focus() {
      if (cm) cm.focus();
      else pendingFocus = true;
    },
    // CodeMirror measures the DOM to lay lines out, and measuring something
    // with `display: none` yields nothing — so text set while the editor was
    // hidden is in the document but not on screen until it is told to look
    // again. Focusing happened to trigger that, which is why the stale text
    // used to correct itself the moment the writer clicked into it.
    refresh: () => cm?.refresh(),
    setMode(next) {
      host.dataset.mode = next;
    },
    // Mermaid draws its colours into the SVG, so a theme change is a new plugin
    // list rather than a stylesheet swap.
    setTheme: (next) => component.$set({ plugins: withBridge(next) }),
    onInput: (handler) => inputHandlers.push(handler),
    onCaret: (handler) => caretHandlers.push(handler),
    onFocus: (handler) => focusHandlers.push(handler),
  };
}
