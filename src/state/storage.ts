import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/** In-memory fallback when localStorage is unavailable (private mode, blocked storage). */
const memory = new Map<string, string>();
const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
  },
};

function safeLocalStorage(): StateStorage {
  try {
    const probe = '__ffg_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}

export const persistStorage = createJSONStorage(safeLocalStorage);

/** Storage keys, versioned per store. Bump a store's `version` and add `migrate` when its shape changes. */
export const STORAGE_KEYS = {
  progress: 'ffg.progress',
  settings: 'ffg.settings',
  layouts: 'ffg.layouts',
  explore: 'ffg.explore',
} as const;
