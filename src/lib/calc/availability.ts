import type { Building, Item, Recipe, Schematic } from '../../data/types.ts';

export interface AvailabilityInput {
  items: readonly Item[];
  recipes: readonly Recipe[];
  buildings: readonly Building[];
  schematics: readonly Schematic[];
}

export interface Availability {
  /** Earliest tier an item can be obtained with standard (non-alternate) recipes. */
  itemTier: ReadonlyMap<string, number>;
  recipeTier: ReadonlyMap<string, number>;
  buildingTier: ReadonlyMap<string, number>;
  schematicTier: ReadonlyMap<string, number>;
}

/** World pickups with no recipe that are still gated (AWESOME Sink coupons need Tier 2). */
const FIXED_ITEM_TIERS: Readonly<Record<string, number>> = { Desc_ResourceSinkCoupon_C: 2 };

/** MAM research requires the MAM itself (Tier 1, Field Research). */
const MAM_MIN_TIER = 1;

/**
 * Derives "available from tier N" for every item, recipe, building and
 * schematic by fixed-point iteration over the unlock graph:
 *
 * - milestone tier / HUB upgrades = 0 / custom = parent's tier
 * - MAM research = max(1, tiers of its cost items)
 * - recipe = max(unlock tier, its building's tier (unless hand-craftable), ingredient tiers)
 * - item = cheapest standard recipe producing it; raw resources = their extractor's tier;
 *   world pickups with no recipe = 0
 */
export function computeAvailability(input: AvailabilityInput): Availability {
  const { items, recipes, buildings, schematics } = input;
  const INF = Number.POSITIVE_INFINITY;

  const unlockedBy = new Map<string, Schematic[]>();
  const parentOf = new Map<string, string>();
  for (const s of schematics) {
    for (const r of s.unlocks.recipes) unlockedBy.set(r, [...(unlockedBy.get(r) ?? []), s]);
    for (const child of s.unlocks.schematics) if (!parentOf.has(child)) parentOf.set(child, s.id);
  }

  const buildRecipesFor = new Map<string, Recipe[]>();
  const producers = new Map<string, Recipe[]>();
  for (const r of recipes) {
    if (r.buildGun && r.products[0]) {
      const target = r.products[0].item.replace(/^Desc_/, 'Build_');
      buildRecipesFor.set(target, [...(buildRecipesFor.get(target) ?? []), r]);
    }
    if (r.alternate || (!r.producedIn.length && !r.handcraft)) continue;
    for (const p of r.products) producers.set(p.item, [...(producers.get(p.item) ?? []), r]);
  }

  const itemTier = new Map<string, number>();
  const recipeTier = new Map<string, number>();
  const buildingTier = new Map<string, number>();
  const schematicTier = new Map<string, number>();
  const get = (map: Map<string, number>, id: string): number => map.get(id) ?? INF;
  const maxOf = (values: number[]): number => values.reduce((a, b) => Math.max(a, b), 0);
  const minOf = (values: number[]): number => values.reduce((a, b) => Math.min(a, b), INF);

  const extractors = buildings.filter((b) => b.extractor);
  const itemById = new Map(items.map((i) => [i.id, i]));

  for (let pass = 0; pass < 64; pass += 1) {
    let changed = false;
    const set = (map: Map<string, number>, id: string, value: number): void => {
      if (value < get(map, id)) {
        map.set(id, value);
        changed = true;
      }
    };

    for (const s of schematics) {
      let tier: number;
      switch (s.type) {
        case 'tutorial':
          tier = 0;
          break;
        case 'milestone':
          tier = s.tier;
          break;
        case 'custom': {
          const parent = parentOf.get(s.id);
          tier = parent ? get(schematicTier, parent) : s.tier;
          break;
        }
        case 'mam':
        case 'hard-drive':
          tier = Math.max(MAM_MIN_TIER, maxOf(s.cost.map((c) => get(itemTier, c.item))));
          break;
        default:
          tier = INF;
      }
      set(schematicTier, s.id, tier);
    }

    const unlockTier = (recipeId: string): number =>
      minOf((unlockedBy.get(recipeId) ?? []).map((s) => get(schematicTier, s.id)));

    for (const b of buildings) {
      set(
        buildingTier,
        b.id,
        minOf((buildRecipesFor.get(b.id) ?? []).map((r) => unlockTier(r.id))),
      );
    }

    for (const r of recipes) {
      if (r.buildGun && !r.producedIn.length) continue;
      const station = r.handcraft ? 0 : minOf(r.producedIn.map((p) => get(buildingTier, p)));
      const inputs = maxOf(r.ingredients.map((i) => get(itemTier, i.item)));
      set(recipeTier, r.id, Math.max(unlockTier(r.id), station, inputs));
    }

    for (const item of items) {
      if (item.id in FIXED_ITEM_TIERS) {
        set(itemTier, item.id, FIXED_ITEM_TIERS[item.id]!);
        continue;
      }
      if (item.isResource) {
        const able = extractors.filter((b) =>
          b.extractor!.resources.length
            ? b.extractor!.resources.includes(item.id)
            : itemById.get(item.id)?.form === 'solid',
        );
        set(itemTier, item.id, minOf(able.map((b) => get(buildingTier, b.id))));
        continue;
      }
      const options = producers.get(item.id);
      set(itemTier, item.id, options ? minOf(options.map((r) => get(recipeTier, r.id))) : 0);
    }

    if (!changed) break;
  }

  return { itemTier, recipeTier, buildingTier, schematicTier };
}
