import { describe, expect, it } from 'vitest';
import { ALUMINIUM, IRON, OIL, chooserFrom } from './__fixtures__/recipes.ts';
import { solve } from './solver.ts';

const machinesOf = (result: ReturnType<typeof solve>, id: string): number =>
  result.recipes.find((r) => r.recipe.id === id)?.machines ?? 0;
const rateOf = (list: { item: string; rate: number }[], item: string): number =>
  list.find((x) => x.item === item)?.rate ?? 0;

describe('solve', () => {
  it('solves the classic Reinforced Iron Plate chain (5/min)', () => {
    const result = solve([{ item: 'rip', rate: 5 }], chooserFrom(Object.values(IRON)));
    expect(machinesOf(result, 'rip')).toBeCloseTo(1);
    expect(machinesOf(result, 'plate')).toBeCloseTo(1.5);
    expect(machinesOf(result, 'screw')).toBeCloseTo(1.5);
    expect(machinesOf(result, 'rod')).toBeCloseTo(1);
    expect(machinesOf(result, 'ingot')).toBeCloseTo(2);
    expect(rateOf(result.inputs, 'ore')).toBeCloseTo(60);
    expect(result.surplus).toEqual([]);
    expect(result.outputs).toEqual([{ item: 'rip', rate: 5 }]);
  });

  it('handles multiple targets sharing intermediates', () => {
    const result = solve(
      [
        { item: 'plate', rate: 20 },
        { item: 'rod', rate: 15 },
      ],
      chooserFrom(Object.values(IRON)),
    );
    expect(machinesOf(result, 'ingot')).toBeCloseTo(1.5);
    expect(rateOf(result.inputs, 'ore')).toBeCloseTo(45);
  });

  it('nets byproducts and loops in the aluminium chain', () => {
    const result = solve([{ item: 'al-ingot', rate: 60 }], chooserFrom(Object.values(ALUMINIUM)));
    expect(machinesOf(result, 'al-ingot')).toBeCloseTo(1);
    expect(machinesOf(result, 'scrap')).toBeCloseTo(0.25);
    expect(machinesOf(result, 'alumina')).toBeCloseTo(0.5);
    // Silica: 75 needed, 25 from alumina byproduct → 50 from the silica recipe.
    expect(machinesOf(result, 'silica')).toBeCloseTo(50 / 37.5);
    expect(rateOf(result.inputs, 'bauxite')).toBeCloseTo(60);
    expect(rateOf(result.inputs, 'coal')).toBeCloseTo(30);
    // Water: 90 consumed, 30 recycled from scrap.
    expect(rateOf(result.inputs, 'water')).toBeCloseTo(60);
    expect(rateOf(result.inputs, 'quartz')).toBeCloseTo(30);
  });

  it('drops a recipe and reports surplus when byproducts over-supply an item', () => {
    const result = solve(
      [
        { item: 'alumina', rate: 240 },
        { item: 'al-ingot', rate: 60 },
      ],
      chooserFrom(Object.values(ALUMINIUM)),
    );
    expect(machinesOf(result, 'silica')).toBe(0);
    expect(rateOf(result.surplus, 'silica')).toBeCloseTo(50);
    expect(rateOf(result.inputs, 'quartz')).toBe(0);
  });

  it('reports pure byproducts as surplus', () => {
    const result = solve([{ item: 'plastic', rate: 20 }], chooserFrom([OIL.plastic]));
    expect(machinesOf(result, 'plastic')).toBeCloseTo(1);
    expect(rateOf(result.inputs, 'crude')).toBeCloseTo(30);
    expect(rateOf(result.surplus, 'hor')).toBeCloseTo(10);
  });

  it('solves cyclic recipe pairs (recycled plastic ⇄ rubber)', () => {
    const result = solve(
      [{ item: 'plastic', rate: 60 }],
      chooserFrom([OIL.recycledPlastic, OIL.recycledRubber]),
    );
    expect(machinesOf(result, 'recycled-plastic')).toBeCloseTo(4 / 3);
    expect(machinesOf(result, 'recycled-rubber')).toBeCloseTo(2 / 3);
    expect(rateOf(result.inputs, 'fuel')).toBeCloseTo(60);
  });

  it('applies somersloop output multipliers per recipe', () => {
    const result = solve([{ item: 'plate', rate: 40 }], chooserFrom(Object.values(IRON)), {
      outputMultiplier: (recipeId) => (recipeId === 'plate' ? 2 : 1),
    });
    expect(machinesOf(result, 'plate')).toBeCloseTo(1);
    expect(rateOf(result.inputs, 'ore')).toBeCloseTo(30);
  });

  it('treats raw targets as straight inputs', () => {
    const result = solve([{ item: 'ore', rate: 120 }], chooserFrom(Object.values(IRON)));
    expect(result.recipes).toEqual([]);
    expect(rateOf(result.inputs, 'ore')).toBeCloseTo(120);
  });

  it('ignores zero or negative targets', () => {
    const result = solve([{ item: 'rip', rate: 0 }], chooserFrom(Object.values(IRON)));
    expect(result.recipes).toEqual([]);
    expect(result.inputs).toEqual([]);
  });

  it('reports per-item flow totals', () => {
    const result = solve([{ item: 'rip', rate: 5 }], chooserFrom(Object.values(IRON)));
    const ingot = result.flows.find((f) => f.item === 'ingot');
    expect(ingot?.produced).toBeCloseTo(60);
    expect(ingot?.consumed).toBeCloseTo(60);
  });
});
