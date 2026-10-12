/**
 * Runtime parsers for persisted state (backups and localStorage hydration).
 * Wrong types throw a user-readable `StateError`; unknown recipe/item IDs are
 * dropped (game data can change between versions); omitted fields get defaults.
 */
import { ITEM_BY_ID, RECIPE_BY_ID } from '../data/gameData.ts';
import type { CollectibleType, Purity } from '../data/types.ts';
import type { LayoutUserConfig } from '../lib/plan/layoutConfig.ts';

export class StateError extends Error {}

export interface BaseLocation {
  x: number;
  y: number;
  z: number;
}

export interface CalculatorConfig {
  tier: number;
  targets: { item: string; rate: number }[];
}

export interface ExploreFilters {
  types: Record<CollectibleType, boolean>;
  hideCollected: boolean;
  /** Only show crash sites whose unlock cost is producible by this tier (null = all). */
  drivesUpToTier: number | null;
  /** Resource node layer: item ID or '' for none. */
  resource: string;
  purities: Record<Purity, boolean>;
}

export type Flags = Record<string, true>;

export const DEFAULT_CALCULATOR: CalculatorConfig = {
  tier: 2,
  targets: [{ item: 'Desc_IronPlateReinforced_C', rate: 5 }],
};

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

const PURITIES: readonly Purity[] = ['impure', 'normal', 'pure'];
const MAX_TIER = 9;
/** World coordinates stay within ±5 km; allow headroom. */
const MAX_COORD_M = 10_000;

const fail = (what: string): never => {
  throw new StateError(`The backup has an invalid ${what}.`);
};

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function record(v: unknown, what: string): Record<string, unknown> {
  return isRecord(v) ? v : fail(what);
}

function num(v: unknown, what: string, min: number, max: number, integer = false): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) return fail(what);
  if (integer && !Number.isInteger(v)) return fail(what);
  return v;
}

function bool(v: unknown, what: string): boolean {
  return typeof v === 'boolean' ? v : fail(what);
}

function mapValues<T>(
  v: unknown,
  what: string,
  parse: (value: unknown) => T | undefined,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(record(v, what))) {
    const parsed = parse(value);
    if (parsed !== undefined) out[key] = parsed;
  }
  return out;
}

const purity = (v: unknown, what: string): Purity =>
  PURITIES.includes(v as Purity) ? (v as Purity) : fail(what);

export function parseFlags(v: unknown, what: string): Flags {
  return mapValues(v, what, (value) => (value === true ? true : fail(what)));
}

export function parseBase(v: unknown): BaseLocation {
  const base = record(v, 'base location');
  const coord = (c: unknown) => num(c, 'base location', -MAX_COORD_M, MAX_COORD_M);
  return { x: coord(base.x), y: coord(base.y), z: coord(base.z) };
}

export function parseTier(v: unknown): number {
  return num(v, 'tier', 0, MAX_TIER, true);
}

export function parsePurityOverrides(v: unknown): Record<string, Purity> {
  return mapValues(v, 'purity override', (p) => purity(p, 'purity override'));
}

/** One layout's user config; every field optional, each type-checked and bounded. */
export function parseLayoutConfig(v: unknown): LayoutUserConfig {
  const c = record(v, 'layout configuration');
  const out: LayoutUserConfig = {};
  const rates = (x: unknown, what: string, max: number, integer = false) =>
    mapValues(x, what, (n) => num(n, what, 0, max, integer));
  if (c.targetRates !== undefined) out.targetRates = rates(c.targetRates, 'target rate', 100_000);
  if (c.generatorCount !== undefined)
    out.generatorCount = num(c.generatorCount, 'generator count', 0, 1000, true);
  if (c.minerMk !== undefined) {
    const mk = num(c.minerMk, 'miner tier', 1, 3, true);
    out.minerMk = mk as 1 | 2 | 3;
  }
  if (c.maxBeltMk !== undefined) out.maxBeltMk = num(c.maxBeltMk, 'belt tier', 1, 6, true);
  if (c.maxPipeMk !== undefined) out.maxPipeMk = num(c.maxPipeMk, 'pipe tier', 1, 2, true);
  if (c.extractorClock !== undefined)
    out.extractorClock = num(c.extractorClock, 'extractor clock', 0.01, 2.5);
  if (c.maxClock !== undefined) out.maxClock = num(c.maxClock, 'clock ceiling', 0.01, 2.5);
  if (c.clockStrategy !== undefined) {
    if (c.clockStrategy !== 'even' && c.clockStrategy !== 'fill') fail('clock strategy');
    out.clockStrategy = c.clockStrategy as 'even' | 'fill';
  }
  if (c.recipeOverrides !== undefined) {
    out.recipeOverrides = mapValues(c.recipeOverrides, 'recipe override', (r) => {
      if (typeof r !== 'string') return fail('recipe override');
      return r === '' || RECIPE_BY_ID.has(r) ? r : undefined;
    });
  }
  if (c.purity !== undefined) out.purity = parsePurityOverrides(c.purity);
  if (c.nodes !== undefined) out.nodes = rates(c.nodes, 'node limit', 1000, true);
  if (c.sloops !== undefined) out.sloops = rates(c.sloops, 'Somersloop count', 4, true);
  if (c.fullChain !== undefined) out.fullChain = bool(c.fullChain, 'full-chain setting');
  return out;
}

export function parseLayoutConfigs(v: unknown): Record<string, LayoutUserConfig> {
  return mapValues(v, 'layout configurations', parseLayoutConfig);
}

/** `undefined` → defaults; anything else must be a valid calculator config. */
export function parseCalculator(v: unknown): CalculatorConfig {
  if (v === undefined) return DEFAULT_CALCULATOR;
  const c = record(v, 'calculator');
  if (!Array.isArray(c.targets)) return fail('calculator');
  const targets = c.targets.flatMap((t: unknown) => {
    const target = record(t, 'calculator target');
    if (typeof target.item !== 'string') return fail('calculator target');
    const rate = num(target.rate, 'calculator target', 0, 100_000);
    return ITEM_BY_ID.has(target.item) ? [{ item: target.item, rate }] : [];
  });
  return { tier: parseTier(c.tier), targets };
}

/** `undefined` → defaults; present fields are validated, missing ones default. */
export function parseFilters(v: unknown): ExploreFilters {
  if (v === undefined) return DEFAULT_FILTERS;
  const f = record(v, 'map filters');
  const flags = <K extends string>(
    x: unknown,
    defaults: Record<K, boolean>,
  ): Record<K, boolean> => {
    if (x === undefined) return defaults;
    const given = record(x, 'map filters');
    const out = { ...defaults };
    for (const key of Object.keys(defaults) as K[]) {
      if (given[key] !== undefined) out[key] = bool(given[key], 'map filters');
    }
    return out;
  };
  return {
    types: flags(f.types, DEFAULT_FILTERS.types),
    hideCollected:
      f.hideCollected === undefined
        ? DEFAULT_FILTERS.hideCollected
        : bool(f.hideCollected, 'map filters'),
    drivesUpToTier:
      f.drivesUpToTier === undefined || f.drivesUpToTier === null
        ? null
        : parseTier(f.drivesUpToTier),
    resource:
      f.resource === undefined || f.resource === ''
        ? ''
        : typeof f.resource === 'string'
          ? ITEM_BY_ID.has(f.resource)
            ? f.resource
            : ''
          : fail('map filters'),
    purities: flags(f.purities, DEFAULT_FILTERS.purities),
  };
}

/**
 * Hydration guard for `persist({ merge })`: validates what was stored and
 * falls back to the current (default) state if it is corrupt.
 */
export function safeMerge<T extends object>(parse: (raw: Record<string, unknown>) => Partial<T>) {
  return (persisted: unknown, current: T): T => {
    try {
      return { ...current, ...parse(record(persisted, 'saved state')) };
    } catch {
      return current;
    }
  };
}
