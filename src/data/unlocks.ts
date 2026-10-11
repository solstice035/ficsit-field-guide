import { ITEM_BY_ID, RECIPE_BY_ID, SCHEMATIC_BY_ID, prettifyId } from './gameData.ts';
import type { Schematic } from './types.ts';

export interface UnlockSummary {
  /** Buildings, equipment and production recipes, by display name. */
  recipes: string[];
  /** Resources or objects added to the scanner. */
  scanner: string[];
  inventorySlots: number;
}

/** Everything a schematic unlocks, including nested sub-schematics (e.g. Oil Processing → Schematic_5-1-1). */
export function unlockSummary(schematic: Schematic): UnlockSummary {
  const recipes = new Set<string>();
  const scanner = new Set<string>();
  let inventorySlots = 0;
  const visit = (s: Schematic, depth: number): void => {
    for (const id of s.unlocks.recipes) recipes.add(RECIPE_BY_ID.get(id)?.name ?? prettifyId(id));
    for (const id of [...s.unlocks.scannerResources, ...s.unlocks.scannerObjects]) {
      scanner.add(ITEM_BY_ID.get(id)?.name ?? prettifyId(id));
    }
    inventorySlots += s.unlocks.inventorySlots;
    if (depth > 3) return;
    for (const child of s.unlocks.schematics) {
      const nested = SCHEMATIC_BY_ID.get(child);
      if (nested && nested.type === 'custom') visit(nested, depth + 1);
    }
  };
  visit(schematic, 0);
  return { recipes: [...recipes], scanner: [...scanner], inventorySlots };
}
