/**
 * Draft storage on IndexedDB: no practical size ceiling and asynchronous
 * writes, so saving never blocks typing.
 */
import type { Draft, DraftStore } from './types.ts';

const DB_NAME = 'scratchpad';
const DB_VERSION = 1;
const STORE = 'drafts';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  body: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = body(tx.objectStore(STORE));
    // A write request succeeds before its transaction commits, and the
    // transaction can still abort afterwards on quota or a disk error. The
    // caller drops the synchronous mirror the moment this promise resolves,
    // so for a write the promise waits for the commit, not for the request.
    if (mode === 'readonly') request.onsuccess = () => resolve(request.result);
    else tx.oncomplete = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('request failed'));
    tx.onabort = () => reject(tx.error ?? new Error('transaction aborted'));
  });
}

export function indexedDbStore(): DraftStore {
  let db: Promise<IDBDatabase> | null = null;
  const database = () => (db ??= openDatabase());

  return {
    async all() {
      const drafts = await run<Draft[]>(await database(), 'readonly', (store) =>
        store.getAll(),
      );
      return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async put(draft) {
      await run(await database(), 'readwrite', (store) => store.put(draft));
    },
    async remove(id) {
      await run(await database(), 'readwrite', (store) => store.delete(id));
    },
  };
}
