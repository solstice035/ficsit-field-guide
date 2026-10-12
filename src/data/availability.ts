import { computeAvailability } from '../lib/calc/availability.ts';
import { BUILDINGS, ITEMS, RECIPES, SCHEMATICS } from './gameData.ts';

/** "Available from tier N" for all game data (computed once at start-up). */
export const AVAILABILITY = computeAvailability({
  items: ITEMS,
  recipes: RECIPES,
  buildings: BUILDINGS,
  schematics: SCHEMATICS,
});

export function itemTier(itemId: string): number {
  return AVAILABILITY.itemTier.get(itemId) ?? Number.POSITIVE_INFINITY;
}

export function recipeTier(recipeId: string): number {
  return AVAILABILITY.recipeTier.get(recipeId) ?? Number.POSITIVE_INFINITY;
}

export function buildingTier(buildingId: string): number {
  return AVAILABILITY.buildingTier.get(buildingId) ?? Number.POSITIVE_INFINITY;
}

/** Highest tier among the cost items (e.g. "a Hard Drive needing Rotors opens in Tier 2"). */
export function tierForCost(cost: readonly { item: string }[]): number {
  return cost.reduce((max, c) => Math.max(max, itemTier(c.item)), 0);
}
