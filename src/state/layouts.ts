import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutUserConfig } from '../lib/plan/layoutConfig.ts';
import {
  type CalculatorConfig,
  DEFAULT_CALCULATOR,
  parseCalculator,
  parseLayoutConfigs,
  safeMerge,
} from './schema.ts';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

/** Ad-hoc calculator plan (free-form targets) stored alongside layout configs. */
export type { CalculatorConfig };

export interface LayoutsState {
  configs: Record<string, LayoutUserConfig>;
  calculator: CalculatorConfig;
  update: (layoutId: string, patch: Partial<LayoutUserConfig>) => void;
  /** Sets a nested record entry (e.g. purity, recipe override); `undefined` removes it. */
  setEntry: <K extends RecordKeys>(
    layoutId: string,
    key: K,
    entry: string,
    value: RecordValue<K> | undefined,
  ) => void;
  resetLayout: (layoutId: string) => void;
  setCalculator: (calculator: CalculatorConfig) => void;
  reset: () => void;
}

type RecordKeys = 'targetRates' | 'recipeOverrides' | 'purity' | 'nodes' | 'sloops';
type RecordValue<K extends RecordKeys> = NonNullable<LayoutUserConfig[K]>[string];

type LayoutsData = Pick<LayoutsState, 'configs' | 'calculator'>;

/** Validates persisted layout configs; an omitted calculator gets its defaults. */
export function parseLayouts(raw: Record<string, unknown>): LayoutsData {
  return {
    configs: raw.configs === undefined ? {} : parseLayoutConfigs(raw.configs),
    calculator: parseCalculator(raw.calculator),
  };
}

export const useLayouts = create<LayoutsState>()(
  persist(
    (set) => ({
      configs: {},
      calculator: DEFAULT_CALCULATOR,
      update: (layoutId, patch) =>
        set((s) => ({
          configs: { ...s.configs, [layoutId]: { ...s.configs[layoutId], ...patch } },
        })),
      setEntry: (layoutId, key, entry, value) =>
        set((s) => {
          const current = s.configs[layoutId] ?? {};
          const record = { ...(current[key] as Record<string, unknown> | undefined) };
          if (value === undefined) delete record[entry];
          else record[entry] = value;
          return { configs: { ...s.configs, [layoutId]: { ...current, [key]: record } } };
        }),
      resetLayout: (layoutId) =>
        set((s) => {
          const next = { ...s.configs };
          delete next[layoutId];
          return { configs: next };
        }),
      setCalculator: (calculator) => set({ calculator }),
      reset: () => set({ configs: {}, calculator: DEFAULT_CALCULATOR }),
    }),
    {
      name: STORAGE_KEYS.layouts,
      version: 1,
      storage: persistStorage,
      merge: safeMerge<LayoutsState>(parseLayouts),
    },
  ),
);
