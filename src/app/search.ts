/**
 * The ⌘K panel: filter by content, arrows to move, enter to open. The input
 * is created once and kept, so the caret, the IME and a mid-word edit survive
 * every repaint; only the count and the result rows are redrawn, and moving
 * the cursor just moves a class.
 */
import type { State } from './store.ts';
import { escapeHtml } from './html.ts';
import { matches, snippetOf, timeLabel, titleOf } from './model.ts';
import { strings } from './strings.ts';
import type { Draft } from '../storage/types.ts';

export function searchResults(state: State): Draft[] {
  const query = state.query.trim();
  if (!query) return state.drafts;
  return state.drafts.filter((draft) => matches(draft, query));
}

export interface Search {
  render(state: State, results: Draft[]): void;
  focus(): void;
}

export function createSearch(root: HTMLElement): Search {
  root.innerHTML = `
    <div class="search__col">
      <div class="search__row">
        <span class="search__slash">/</span>
        <input class="search__input" type="text" spellcheck="false" autocomplete="off"
               placeholder="${strings.searchPlaceholder}" />
      </div>
      <div class="search__meta">
        <span class="search__count"></span>
        <span class="search__help">${strings.searchHelp}</span>
        <button type="button" class="search__close" data-action="close">${strings.close}</button>
      </div>
      <div class="search__results"></div>
    </div>`;

  const input = root.querySelector<HTMLInputElement>('.search__input')!;
  const count = root.querySelector<HTMLElement>('.search__count')!;
  const list = root.querySelector<HTMLElement>('.search__results')!;
  let lastRows = '';

  return {
    render(state, results) {
      if (input.value !== state.query) input.value = state.query;
      count.textContent = strings.searchCount(results.length, state.drafts.length);

      const query = state.query.trim();
      const rows = results
        .map(
          (
            draft,
            index,
          ) => `<button type="button" class="result" data-id="${draft.id}" data-index="${index}">
            <span class="result__head">
              <span class="result__title">${escapeHtml(titleOf(draft.text) || strings.untitled)}</span>
              <span class="result__time">${escapeHtml(timeLabel(draft.updatedAt))}</span>
            </span>
            <span class="result__snippet">${escapeHtml(snippetOf(draft.text, query))}</span>
          </button>`,
        )
        .join('');
      const html = rows || `<div class="search__empty">${strings.searchEmpty}</div>`;
      if (html !== lastRows) {
        lastRows = html;
        list.innerHTML = html;
      }

      list.querySelectorAll<HTMLElement>('.result').forEach((row, index) => {
        row.classList.toggle('is-active', index === state.cursor);
      });
      list
        .querySelector<HTMLElement>('.result.is-active')
        ?.scrollIntoView({ block: 'nearest' });
    },
    focus: () => input.focus(),
  };
}
