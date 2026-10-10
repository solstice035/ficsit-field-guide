import type { Recipe } from '../../data/types.ts';
import { EPSILON } from './constants.ts';

export interface ItemRate {
  item: string;
  rate: number;
}

export interface SolvedRecipe {
  recipe: Recipe;
  /** Machines at 100% clock (fractional). */
  machines: number;
  /** Output multiplier applied (Somersloops). */
  outputMultiplier: number;
}

export interface ItemFlow {
  item: string;
  produced: number;
  consumed: number;
}

export interface SolveResult {
  targets: ItemRate[];
  recipes: SolvedRecipe[];
  /** Net demand with no producer in the plan (raw resources, unselected recipes). */
  inputs: ItemRate[];
  /** Requested outputs. */
  outputs: ItemRate[];
  /** Over-production (byproducts, over-supplied intermediates). */
  surplus: ItemRate[];
  flows: ItemFlow[];
  /** Set when the recipe system cannot be solved (degenerate loop). */
  error?: string;
}

export interface SolveOptions {
  /** Somersloop output multiplier per recipe (default 1). */
  outputMultiplier?: (recipeId: string) => number;
  /** Items that must be treated as inputs even if a recipe exists (raw resources). */
  isRaw?: (item: string) => boolean;
}

export type RecipeChooser = (item: string) => Recipe | undefined;

const TOLERANCE = 1e-7;

/** Net per-minute rate of `item` for one machine of `recipe` at 100%. */
function netRate(recipe: Recipe, item: string, multiplier: number): number {
  const perMin = 60 / recipe.durationS;
  let net = 0;
  for (const p of recipe.products) if (p.item === item) net += p.amount * multiplier * perMin;
  for (const i of recipe.ingredients) if (i.item === item) net -= i.amount * perMin;
  return net;
}

/** Gauss–Jordan elimination with partial pivoting. Returns null if singular. */
function solveLinear(matrix: number[][], rhs: number[]): number[] | null {
  const n = rhs.length;
  const m = matrix.map((row, i) => [...row, rhs[i] ?? 0]);
  const at = (r: number, c: number): number => m[r]?.[c] ?? 0;

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let r = col + 1; r < n; r += 1) {
      if (Math.abs(at(r, col)) > Math.abs(at(pivot, col))) pivot = r;
    }
    if (Math.abs(at(pivot, col)) < 1e-12) return null;
    [m[col], m[pivot]] = [m[pivot]!, m[col]!];

    const rowCol = m[col]!;
    const p = rowCol[col]!;
    for (let c = col; c <= n; c += 1) rowCol[c] = rowCol[c]! / p;

    for (let r = 0; r < n; r += 1) {
      if (r === col) continue;
      const row = m[r]!;
      const factor = row[col]!;
      if (factor === 0) continue;
      for (let c = col; c <= n; c += 1) row[c] = row[c]! - factor * rowCol[c]!;
    }
  }
  return m.map((row) => row[n] ?? 0);
}

function mergeTargets(targets: readonly ItemRate[]): ItemRate[] {
  const merged = new Map<string, number>();
  for (const { item, rate } of targets) {
    if (rate > EPSILON) merged.set(item, (merged.get(item) ?? 0) + rate);
  }
  return [...merged].map(([item, rate]) => ({ item, rate }));
}

/**
 * Solves a production plan for `targets` (per minute).
 *
 * One recipe is chosen per non-raw item. The square system "net production
 * of each produced item = its target" is solved exactly, so byproducts and
 * loops (e.g. the aluminium water/silica loop) are netted. If an item is
 * over-supplied by byproducts its own recipe would run negative; that item
 * is dropped from the system and reported as surplus.
 */
export function solve(
  targets: readonly ItemRate[],
  choose: RecipeChooser,
  options: SolveOptions = {},
): SolveResult {
  const multiplierOf = (id: string): number => options.outputMultiplier?.(id) ?? 1;
  const goal = mergeTargets(targets);
  const targetOf = new Map(goal.map((t) => [t.item, t.rate]));

  // 1. Discover the recipe set reachable from the targets.
  const chosen = new Map<string, Recipe>();
  const usedRecipes = new Set<string>();
  const queue = goal.map((t) => t.item);
  const seen = new Set<string>();
  while (queue.length) {
    const item = queue.shift()!;
    if (seen.has(item)) continue;
    seen.add(item);
    if (options.isRaw?.(item)) continue;
    const recipe = choose(item);
    if (!recipe || usedRecipes.has(recipe.id)) continue;
    chosen.set(item, recipe);
    usedRecipes.add(recipe.id);
    for (const ingredient of recipe.ingredients) queue.push(ingredient.item);
  }

  // 2. Solve, dropping over-supplied items until all machine counts are ≥ 0.
  let system = [...chosen.keys()];
  let machines: number[] = [];
  let error: string | undefined;
  for (let attempt = 0; attempt <= chosen.size; attempt += 1) {
    const recipes = system.map((item) => chosen.get(item)!);
    const matrix = system.map((item) => recipes.map((r) => netRate(r, item, multiplierOf(r.id))));
    const rhs = system.map((item) => targetOf.get(item) ?? 0);
    const solution = solveLinear(matrix, rhs);
    if (!solution) {
      error = 'The selected recipes form a loop with no net output. Choose a different recipe.';
      machines = [];
      system = [];
      break;
    }
    const negative = new Set(system.filter((_, k) => (solution[k] ?? 0) < -TOLERANCE));
    machines = solution;
    if (!negative.size) break;
    system = system.filter((item) => !negative.has(item));
  }

  // 3. Collect machines and flows.
  const solved: SolvedRecipe[] = system
    .map((item, k) => ({
      recipe: chosen.get(item)!,
      machines: Math.max(0, machines[k] ?? 0),
      outputMultiplier: multiplierOf(chosen.get(item)!.id),
    }))
    .filter((r) => r.machines > TOLERANCE);

  const produced = new Map<string, number>();
  const consumed = new Map<string, number>();
  const add = (map: Map<string, number>, item: string, rate: number): void => {
    map.set(item, (map.get(item) ?? 0) + rate);
  };
  for (const { recipe, machines: count, outputMultiplier } of solved) {
    const perMin = (60 / recipe.durationS) * count;
    for (const p of recipe.products) add(produced, p.item, p.amount * outputMultiplier * perMin);
    for (const i of recipe.ingredients) add(consumed, i.item, i.amount * perMin);
  }

  const allItems = new Set([...produced.keys(), ...consumed.keys(), ...targetOf.keys()]);
  const flows: ItemFlow[] = [];
  const inputs: ItemRate[] = [];
  const surplus: ItemRate[] = [];
  for (const item of allItems) {
    const p = produced.get(item) ?? 0;
    const c = consumed.get(item) ?? 0;
    flows.push({ item, produced: p, consumed: c });
    const balance = p - c - (targetOf.get(item) ?? 0);
    if (balance < -TOLERANCE * Math.max(1, c)) inputs.push({ item, rate: -balance });
    else if (balance > TOLERANCE * Math.max(1, p)) surplus.push({ item, rate: balance });
  }

  return {
    targets: goal,
    recipes: solved,
    inputs,
    outputs: goal,
    surplus,
    flows,
    ...(error ? { error } : {}),
  };
}
