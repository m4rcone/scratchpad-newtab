/**
 * Persistence contract. The UI layer talks to this and never to IndexedDB
 * directly — that is what keeps disk, sync or per-language blocks possible
 * later without a painful migration.
 */

export const SCHEMA_VERSION = 1;

export interface Draft {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
  /** Caret offset, so reopening a tab lands where the writing stopped. */
  caret?: number;
}

export interface DraftStore {
  /** Every draft, newest change first. */
  all(): Promise<Draft[]>;
  put(draft: Draft): Promise<void>;
  remove(id: string): Promise<void>;
}

export type ThemeChoice = 'system' | 'dark' | 'light';

export interface Prefs {
  activeId: string | null;
  theme: ThemeChoice;
}

export interface PrefsStore {
  read(): Promise<Partial<Prefs>>;
  write(prefs: Partial<Prefs>): Promise<void>;
}
