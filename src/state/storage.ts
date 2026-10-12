import { createJSONStorage, type StateStorage } from 'zustand/middleware';

type Backend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Whether state is still reaching durable storage; listeners fire once when it stops. */
export interface StorageStatus {
  persistent: () => boolean;
  subscribe: (listener: () => void) => () => void;
}

/**
 * Wraps a storage backend so a blocked or full store never throws into the UI.
 * Every write also goes to memory, so the session keeps working after a
 * failure; `status` lets the app warn that progress is no longer saved.
 */
export function createResilientStorage(getBackend: () => Backend): {
  storage: StateStorage;
  status: StorageStatus;
} {
  const memory = new Map<string, string>();
  const listeners = new Set<() => void>();
  let backend: Backend | null = null;
  const fail = () => {
    if (!backend) return;
    backend = null;
    listeners.forEach((l) => l());
  };
  try {
    const candidate = getBackend();
    const probe = '__ffg_probe__';
    candidate.setItem(probe, probe);
    candidate.removeItem(probe);
    backend = candidate;
  } catch {
    backend = null;
  }

  const storage: StateStorage = {
    getItem: (name) => {
      if (backend) {
        try {
          return backend.getItem(name);
        } catch {
          fail();
        }
      }
      return memory.get(name) ?? null;
    },
    setItem: (name, value) => {
      memory.set(name, value);
      try {
        backend?.setItem(name, value);
      } catch {
        fail();
      }
    },
    removeItem: (name) => {
      memory.delete(name);
      try {
        backend?.removeItem(name);
      } catch {
        fail();
      }
    },
  };
  const status: StorageStatus = {
    persistent: () => backend !== null,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return { storage, status };
}

const resilient = createResilientStorage(() => window.localStorage);

export const persistStorage = createJSONStorage(() => resilient.storage);
export const storageStatus = resilient.status;

/** Storage keys, versioned per store. Bump a store's `version` and add `migrate` when its shape changes. */
export const STORAGE_KEYS = {
  progress: 'ffg.progress',
  settings: 'ffg.settings',
  layouts: 'ffg.layouts',
  explore: 'ffg.explore',
} as const;
