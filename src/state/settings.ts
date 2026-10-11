import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_BASE } from '../content/sites.ts';
import type { Purity } from '../data/types.ts';
import {
  type BaseLocation,
  parseBase,
  parsePurityOverrides,
  parseTier,
  safeMerge,
} from './schema.ts';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

export type { BaseLocation };

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

type SettingsData = Pick<SettingsState, 'base' | 'currentTier' | 'purityOverrides'>;

/** Validates persisted settings; base and tier are required, overrides default to none. */
export function parseSettings(raw: Record<string, unknown>): SettingsData {
  return {
    base: parseBase(raw.base),
    currentTier: parseTier(raw.currentTier),
    purityOverrides:
      raw.purityOverrides === undefined ? {} : parsePurityOverrides(raw.purityOverrides),
  };
}

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
    {
      name: STORAGE_KEYS.settings,
      version: 1,
      storage: persistStorage,
      merge: safeMerge<SettingsState>(parseSettings),
    },
  ),
);
