import type { Recipe } from '../../../data/types.ts';

/** Minimal recipe factory for engine tests (synthetic, mirrors real 1.0 numbers). */
export function recipe(
  id: string,
  durationS: number,
  ingredients: [string, number][],
  products: [string, number][],
  producedIn = 'Build_ConstructorMk1_C',
): Recipe {
  return {
    id,
    name: id,
    alternate: false,
    durationS,
    ingredients: ingredients.map(([item, amount]) => ({ item, amount })),
    products: products.map(([item, amount]) => ({ item, amount })),
    producedIn: [producedIn],
    handcraft: false,
    buildGun: false,
    workshop: false,
  };
}

export const IRON = {
  ingot: recipe('ingot', 2, [['ore', 1]], [['ingot', 1]], 'Build_SmelterMk1_C'),
  plate: recipe('plate', 6, [['ingot', 3]], [['plate', 2]]),
  rod: recipe('rod', 4, [['ingot', 1]], [['rod', 1]]),
  screw: recipe('screw', 6, [['rod', 1]], [['screw', 4]]),
  rip: recipe(
    'rip',
    12,
    [
      ['plate', 6],
      ['screw', 12],
    ],
    [['rip', 1]],
    'Build_AssemblerMk1_C',
  ),
};

export const ALUMINIUM = {
  alumina: recipe(
    'alumina',
    6,
    [
      ['bauxite', 12],
      ['water', 18],
    ],
    [
      ['alumina', 12],
      ['silica', 5],
    ],
    'Build_OilRefinery_C',
  ),
  scrap: recipe(
    'scrap',
    1,
    [
      ['alumina', 4],
      ['coal', 2],
    ],
    [
      ['scrap', 6],
      ['water', 2],
    ],
    'Build_OilRefinery_C',
  ),
  ingot: recipe(
    'al-ingot',
    4,
    [
      ['scrap', 6],
      ['silica', 5],
    ],
    [['al-ingot', 4]],
    'Build_FoundryMk1_C',
  ),
  silica: recipe('silica', 8, [['quartz', 3]], [['silica', 5]]),
};

export const OIL = {
  plastic: recipe(
    'plastic',
    6,
    [['crude', 3]],
    [
      ['plastic', 2],
      ['hor', 1],
    ],
    'Build_OilRefinery_C',
  ),
  recycledPlastic: recipe(
    'recycled-plastic',
    12,
    [
      ['rubber', 6],
      ['fuel', 6],
    ],
    [['plastic', 12]],
    'Build_OilRefinery_C',
  ),
  recycledRubber: recipe(
    'recycled-rubber',
    12,
    [
      ['plastic', 6],
      ['fuel', 6],
    ],
    [['rubber', 12]],
    'Build_OilRefinery_C',
  ),
};

/** Builds a chooser from a recipe list keyed by primary product. */
export function chooserFrom(recipes: Recipe[]): (item: string) => Recipe | undefined {
  const map = new Map(recipes.map((r) => [r.products[0]?.item ?? '', r]));
  return (item) => map.get(item);
}
