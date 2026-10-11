import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_FILTERS,
  type ExploreFilters,
  parseFilters,
  parseFlags,
  safeMerge,
} from './schema.ts';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

export { DEFAULT_FILTERS };
export type { ExploreFilters };

export interface ExploreState {
  collected: Record<string, true>;
  filters: ExploreFilters;
  toggleCollected: (id: string) => void;
  setFilters: (patch: Partial<ExploreFilters>) => void;
  reset: () => void;
}

type ExploreData = Pick<ExploreState, 'collected' | 'filters'>;

/** Validates persisted exploration state; omitted filters get their defaults. */
export function parseExplore(raw: Record<string, unknown>): ExploreData {
  return {
    collected: raw.collected === undefined ? {} : parseFlags(raw.collected, 'collected list'),
    filters: parseFilters(raw.filters),
  };
}

export const useExplore = create<ExploreState>()(
  persist(
    (set) => ({
      collected: {},
      filters: DEFAULT_FILTERS,
      toggleCollected: (id) =>
        set((s) => {
          const next = { ...s.collected };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { collected: next };
        }),
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      reset: () => set({ collected: {}, filters: DEFAULT_FILTERS }),
    }),
    {
      name: STORAGE_KEYS.explore,
      version: 1,
      storage: persistStorage,
      merge: safeMerge<ExploreState>(parseExplore),
    },
  ),
);
