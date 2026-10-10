import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollectibleType, Purity } from '../data/types.ts';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

export interface ExploreFilters {
  types: Record<CollectibleType, boolean>;
  hideCollected: boolean;
  /** Only show crash sites whose unlock cost is producible by this tier (null = all). */
  drivesUpToTier: number | null;
  /** Resource node layer: item ID or '' for none. */
  resource: string;
  purities: Record<Purity, boolean>;
}

export interface ExploreState {
  collected: Record<string, true>;
  filters: ExploreFilters;
  toggleCollected: (id: string) => void;
  setFilters: (patch: Partial<ExploreFilters>) => void;
  reset: () => void;
}

export const DEFAULT_FILTERS: ExploreFilters = {
  types: {
    mercerSphere: true,
    somersloop: true,
    hardDrive: true,
    slugBlue: false,
    slugYellow: false,
    slugPurple: false,
  },
  hideCollected: true,
  drivesUpToTier: null,
  resource: '',
  purities: { impure: true, normal: true, pure: true },
};

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
    { name: STORAGE_KEYS.explore, version: 1, storage: persistStorage },
  ),
);
