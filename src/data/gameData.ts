/**
 * Typed, indexed access to generated game data. Import from here rather than
 * from the JSON files directly.
 */
import buildingsJson from './generated/buildings.json';
import collectiblesJson from './generated/collectibles.json';
import itemsJson from './generated/items.json';
import metaJson from './generated/meta.json';
import nodesJson from './generated/nodes.json';
import recipesJson from './generated/recipes.json';
import schematicsJson from './generated/schematics.json';
import type {
  Building,
  Collectible,
  DataMeta,
  Item,
  Recipe,
  ResourceNode,
  Schematic,
} from './types.ts';

export const ITEMS = itemsJson as unknown as readonly Item[];
export const RECIPES = recipesJson as unknown as readonly Recipe[];
export const BUILDINGS = buildingsJson as unknown as readonly Building[];
export const SCHEMATICS = schematicsJson as unknown as readonly Schematic[];
export const NODES = nodesJson as unknown as readonly ResourceNode[];
export const COLLECTIBLES = collectiblesJson as unknown as readonly Collectible[];
export const DATA_META = metaJson as unknown as DataMeta;

const index = <T extends { id: string }>(list: readonly T[]): ReadonlyMap<string, T> =>
  new Map(list.map((x) => [x.id, x]));

export const ITEM_BY_ID = index(ITEMS);
export const RECIPE_BY_ID = index(RECIPES);
export const BUILDING_BY_ID = index(BUILDINGS);
export const SCHEMATIC_BY_ID = index(SCHEMATICS);
export const NODE_BY_ID = index(NODES);
export const COLLECTIBLE_BY_ID = index(COLLECTIBLES);

/** Display name for an item ID, with a readable fallback. */
export function itemName(id: string): string {
  return ITEM_BY_ID.get(id)?.name ?? prettifyId(id);
}

export function buildingName(id: string): string {
  return BUILDING_BY_ID.get(id)?.name ?? prettifyId(id);
}

export function recipeName(id: string): string {
  return RECIPE_BY_ID.get(id)?.name ?? prettifyId(id);
}

/** `Desc_IronPlateReinforced_C` → `Iron Plate Reinforced`. */
export function prettifyId(id: string): string {
  return id
    .replace(/^(Desc|Recipe|Build|Schematic|Research|BP)_/, '')
    .replace(/_C$/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

/** Recipes runnable in a factory building (not Build Gun / workshop only). */
export const MACHINE_RECIPES: readonly Recipe[] = RECIPES.filter((r) => r.producedIn.length > 0);

/** Machine recipes keyed by every item they produce (primary product first). */
export const RECIPES_PRODUCING: ReadonlyMap<string, readonly Recipe[]> = (() => {
  const map = new Map<string, Recipe[]>();
  for (const recipe of MACHINE_RECIPES) {
    recipe.products.forEach((p) => {
      const list = map.get(p.item) ?? [];
      list.push(recipe);
      map.set(p.item, list);
    });
  }
  return map;
})();

/** Schematics that unlock each recipe (milestones, MAM, hard drives, nested customs). */
export const RECIPE_UNLOCKED_BY: ReadonlyMap<string, readonly string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const schematic of SCHEMATICS) {
    for (const recipeId of schematic.unlocks.recipes) {
      map.set(recipeId, [...(map.get(recipeId) ?? []), schematic.id]);
    }
  }
  return map;
})();

/** Parent schematic for `custom` sub-schematics (e.g. `Schematic_5-1-1_C` ← `Schematic_5-1_C`). */
export const SCHEMATIC_PARENT: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const schematic of SCHEMATICS) {
    for (const child of schematic.unlocks.schematics) {
      if (!map.has(child)) map.set(child, schematic.id);
    }
  }
  return map;
})();

export const MILESTONES_BY_TIER: ReadonlyMap<number, readonly Schematic[]> = (() => {
  const map = new Map<number, Schematic[]>();
  for (const s of SCHEMATICS) {
    if (s.type !== 'milestone' && s.type !== 'tutorial') continue;
    const tier = s.type === 'tutorial' ? 0 : s.tier;
    map.set(tier, [...(map.get(tier) ?? []), s]);
  }
  for (const list of map.values()) list.sort(milestoneOrder);
  return map;
})();

/** Orders HUB upgrades 1→6 and milestones by their in-game numbering. */
function milestoneOrder(a: Schematic, b: Schematic): number {
  return a.name.localeCompare(b.name, 'en', { numeric: true });
}
