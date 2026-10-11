import { ITEM_BY_ID, RECIPE_BY_ID, RECIPES_PRODUCING } from './gameData.ts';
import type { Recipe } from './types.ts';

/**
 * Explicit defaults where the game has several standard recipes for an item.
 * Everything else picks the single standard machine recipe automatically.
 */
export const PREFERRED_RECIPES: Readonly<Record<string, string>> = {
  Desc_LiquidFuel_C: 'Recipe_LiquidFuel_C',
  Desc_Plastic_C: 'Recipe_Plastic_C',
  Desc_Rubber_C: 'Recipe_Rubber_C',
  Desc_GenericBiomass_C: 'Recipe_Biomass_Leaves_C',
  Desc_FicsiteIngot_C: 'Recipe_FicsiteIngot_Iron_C',
  Desc_CrystalShard_C: 'Recipe_PowerCrystalShard_1_C',
  Desc_AlienProtein_C: 'Recipe_Protein_Hog_C',
  Desc_CartridgeChaos_C: 'Recipe_CartridgeChaos_C',
};

const isUnpackage = (r: Recipe): boolean => /^Unpackage/i.test(r.name);
const isConverter = (r: Recipe): boolean => r.producedIn.includes('Build_Converter_C');

/** True for world-extracted resources (ores, crude, water, nitrogen, SAM). */
export function isRawResource(itemId: string): boolean {
  return ITEM_BY_ID.get(itemId)?.isResource ?? false;
}

/**
 * All machine recipes that can produce an item, best first:
 * standard → alternates → converter/unpackage fallbacks.
 */
export function recipeOptionsFor(itemId: string): Recipe[] {
  const rank = (r: Recipe): number => {
    const primary = r.products[0]?.item === itemId ? 0 : 10;
    if (isUnpackage(r)) return primary + 4;
    if (isConverter(r)) return primary + 3;
    return primary + (r.alternate ? 1 : 0);
  };
  return [...(RECIPES_PRODUCING.get(itemId) ?? [])].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name),
  );
}

/** Default recipe for an item, or undefined if it should be treated as an input. */
export function defaultRecipeFor(itemId: string): Recipe | undefined {
  if (isRawResource(itemId)) return undefined;
  const preferred = PREFERRED_RECIPES[itemId];
  if (preferred) return RECIPE_BY_ID.get(preferred);
  const candidates = (RECIPES_PRODUCING.get(itemId) ?? []).filter(
    (r) => !r.alternate && r.products[0]?.item === itemId && !isUnpackage(r),
  );
  const nonConverter = candidates.filter((r) => !isConverter(r));
  return (nonConverter.length ? nonConverter : candidates)[0];
}

/** Builds a chooser honouring per-item overrides (`itemId → recipeId`, or `''` for "treat as input"). */
export function makeRecipeChooser(
  overrides: Readonly<Record<string, string>> = {},
): (itemId: string) => Recipe | undefined {
  return (itemId) => {
    const override = overrides[itemId];
    if (override === '') return undefined;
    if (override) return RECIPE_BY_ID.get(override) ?? defaultRecipeFor(itemId);
    return defaultRecipeFor(itemId);
  };
}
