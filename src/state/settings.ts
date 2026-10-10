import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_BASE } from '../content/sites.ts';
import type { Purity } from '../data/types.ts';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

export interface BaseLocation {
  x: number;
  y: number;
  z: number;
}

export interface SettingsState {
  base: BaseLocation;
  /** The tier you are currently working on (drives defaults and "openable now"). */
  currentTier: number;
  /** Per-node purity overrides for non-default Game Modes. */
  purityOverrides: Record<string, Purity>;
  setBase: (base: BaseLocation) => void;
  setCurrentTier: (tier: number) => void;
  setPurityOverride: (nodeId: string, purity: Purity | undefined) => void;
  reset: () => void;
}

const DEFAULTS = {
  base: { ...DEFAULT_BASE },
  currentTier: 0,
  purityOverrides: {},
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setBase: (base) => set({ base }),
      setCurrentTier: (currentTier) => set({ currentTier: Math.min(9, Math.max(0, currentTier)) }),
      setPurityOverride: (nodeId, purity) =>
        set((s) => {
          const next = { ...s.purityOverrides };
          if (purity) next[nodeId] = purity;
          else delete next[nodeId];
          return { purityOverrides: next };
        }),
      reset: () => set({ ...DEFAULTS, base: { ...DEFAULT_BASE } }),
    }),
    { name: STORAGE_KEYS.settings, version: 1, storage: persistStorage },
  ),
);
