import { useExplore } from './explore.ts';
import { useLayouts } from './layouts.ts';
import { useProgress } from './progress.ts';
import { useSettings } from './settings.ts';
import { STORAGE_KEYS } from './storage.ts';

const STORES = {
  [STORAGE_KEYS.progress]: useProgress,
  [STORAGE_KEYS.settings]: useSettings,
  [STORAGE_KEYS.layouts]: useLayouts,
  [STORAGE_KEYS.explore]: useExplore,
} as const;

/**
 * Keeps every open window in step: when another window (say `/glance` on the
 * second monitor) saves a store, rehydrate that store here. The browser fires
 * `storage` only in the other windows, so this never loops.
 */
export function startCrossWindowSync(): () => void {
  const onStorage = ({ key }: StorageEvent) => {
    // A null key means another window cleared storage: reload everything.
    const keys = key === null ? Object.keys(STORES) : [key];
    for (const k of keys) {
      const store = STORES[k as keyof typeof STORES];
      void store?.persist.rehydrate();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
