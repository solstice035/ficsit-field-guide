/**
 * Turns a content layout + the user's tweaks into a solver-ready PlanConfig.
 */
import { buildingTier } from '../../data/availability.ts';
import { BUILDING_BY_ID, ITEM_BY_ID, NODE_BY_ID } from '../../data/gameData.ts';
import type { Purity } from '../../data/types.ts';
import { SITE_BY_ID } from '../../content/sites.ts';
import type { FactoryLayout, GeneratorSpecContent } from '../../content/types.ts';
import { BELT_TIERS, PIPE_TIERS } from '../calc/conveyance.ts';
import { type GeneratorOption, generatorFor } from '../calc/generators.ts';
import type { ClockStrategy } from '../calc/power.ts';
import type { ItemRate } from '../calc/solver.ts';
import {
  DEFAULT_PLAN_CONFIG,
  type MinerMk,
  type PlanConfig,
  type ResourceSetting,
} from './factoryPlan.ts';

export interface TierDefaults {
  minerMk: MinerMk;
  maxBeltMk: number;
  maxPipeMk: number;
}

/** Best logistics and miners unlocked by a tier, derived from the unlock graph. */
export function tierDefaults(tier: number): TierDefaults {
  const highest = (tiers: readonly { mk: number; buildingId: string }[]): number =>
    tiers.filter((t) => buildingTier(t.buildingId) <= tier).at(-1)?.mk ?? 1;
  const minerMk =
    ([3, 2, 1] as const).find((mk) => buildingTier(`Build_MinerMk${mk}_C`) <= tier) ?? 1;
  return { minerMk, maxBeltMk: highest(BELT_TIERS), maxPipeMk: highest(PIPE_TIERS) };
}

export interface GeneratorDemand extends GeneratorOption {
  fuelId: string;
  powerMW: number;
}

/** Fuel and water a bank of generators consumes at 100%. */
export function generatorDemand(
  spec: GeneratorSpecContent,
  count = spec.count,
): GeneratorDemand | undefined {
  const building = BUILDING_BY_ID.get(spec.buildingId);
  if (!building?.generator) return undefined;
  const powerMW = building.generator.powerMW * count;
  const option = generatorFor(powerMW, building, ITEM_BY_ID.get(spec.fuelId));
  if (!option?.fuelId) return undefined;
  return { ...option, fuelId: option.fuelId, count, powerMW };
}

export interface ResourceAtSite {
  resource: string;
  nodeIds: string[];
  /** Node count per purity, after purity overrides. */
  byPurity: Record<Purity, number>;
  best: Purity;
}

const PURITY_RANK: Record<Purity, number> = { impure: 0, normal: 1, pure: 2 };

/**
 * Extractable resources across one or more sites, honouring per-node purity
 * overrides. Well cores are excluded (only their satellites are extractable).
 */
export function siteResources(
  siteIds: string | readonly (string | undefined)[] | undefined,
  purityOverrides: Readonly<Record<string, Purity>> = {},
): Map<string, ResourceAtSite> {
  const result = new Map<string, ResourceAtSite>();
  const ids = typeof siteIds === 'string' ? [siteIds] : (siteIds ?? []);
  const nodeIds = new Set(ids.flatMap((id) => (id ? (SITE_BY_ID.get(id)?.nodeIds ?? []) : [])));
  for (const id of nodeIds) {
    const node = NODE_BY_ID.get(id);
    if (!node || node.resource === 'geothermal' || node.type === 'well-core') continue;
    const purity = purityOverrides[id] ?? node.purity;
    const entry = result.get(node.resource) ?? {
      resource: node.resource,
      nodeIds: [],
      byPurity: { impure: 0, normal: 0, pure: 0 },
      best: purity,
    };
    entry.nodeIds.push(id);
    entry.byPurity[purity] += 1;
    if (PURITY_RANK[purity] > PURITY_RANK[entry.best]) entry.best = purity;
    result.set(node.resource, entry);
  }
  return result;
}

/** User adjustments to a layout (persisted per layout). */
export interface LayoutUserConfig {
  targetRates?: Record<string, number>;
  generatorCount?: number;
  minerMk?: MinerMk;
  maxBeltMk?: number;
  maxPipeMk?: number;
  extractorClock?: number;
  clockStrategy?: ClockStrategy;
  maxClock?: number;
  recipeOverrides?: Record<string, string>;
  purity?: Record<string, Purity>;
  nodes?: Record<string, number>;
  sloops?: Record<string, number>;
  /** Build every intermediate from ore instead of importing the layout's `imports`. */
  fullChain?: boolean;
}

/** All sites that feed a layout (build site first). */
export function layoutSiteIds(layout: FactoryLayout): string[] {
  return [layout.siteId, ...(layout.supplySiteIds ?? [])].filter((id): id is string => !!id);
}

/** Targets after applying user rates and generator demand. */
export function layoutTargets(layout: FactoryLayout, user: LayoutUserConfig = {}): ItemRate[] {
  const targets: ItemRate[] = layout.targets.map((t) => ({
    item: t.item,
    rate: user.targetRates?.[t.item] ?? t.rate,
  }));
  if (layout.generators) {
    const demand = generatorDemand(
      layout.generators,
      user.generatorCount ?? layout.generators.count,
    );
    if (demand) {
      targets.push({ item: demand.fuelId, rate: demand.fuelPerMin });
      if (demand.supplementalId)
        targets.push({ item: demand.supplementalId, rate: demand.supplementalPerMin });
    }
  }
  return targets;
}

/** Resolves the full solver config for a layout. */
export function resolveLayoutConfig(
  layout: FactoryLayout,
  user: LayoutUserConfig = {},
  purityOverrides: Readonly<Record<string, Purity>> = {},
): PlanConfig {
  const defaults = tierDefaults(layout.tier);
  const atSite = siteResources(layoutSiteIds(layout), purityOverrides);
  const resources: Record<string, ResourceSetting> = {};
  for (const [resource, info] of atSite) {
    resources[resource] = { purity: info.best };
  }
  for (const [resource, purity] of Object.entries(user.purity ?? {})) {
    resources[resource] = { ...resources[resource], purity };
  }
  for (const [resource, nodes] of Object.entries(user.nodes ?? {})) {
    if (nodes > 0)
      resources[resource] = {
        purity: resources[resource]?.purity ?? 'normal',
        ...resources[resource],
        nodes,
      };
  }

  const importOverrides: Record<string, string> = user.fullChain
    ? {}
    : Object.fromEntries((layout.imports ?? []).map((item) => [item, '']));

  return {
    ...DEFAULT_PLAN_CONFIG,
    targets: layoutTargets(layout, user),
    recipeOverrides: { ...importOverrides, ...layout.recipeOverrides, ...user.recipeOverrides },
    ...(layout.generators
      ? {
          generators: {
            buildingId: layout.generators.buildingId,
            fuelId: layout.generators.fuelId,
            count: user.generatorCount ?? layout.generators.count,
          },
        }
      : {}),
    minerMk: user.minerMk ?? layout.minerMk ?? defaults.minerMk,
    maxBeltMk: user.maxBeltMk ?? layout.maxBeltMk ?? defaults.maxBeltMk,
    maxPipeMk: user.maxPipeMk ?? layout.maxPipeMk ?? defaults.maxPipeMk,
    extractorClock: user.extractorClock ?? 1,
    clockStrategy: user.clockStrategy ?? 'even',
    maxClock: user.maxClock ?? 1,
    resources,
    sloops: user.sloops ?? {},
  };
}
