import { describe, expect, it } from 'vitest';
import { BUILDING_BY_ID, ITEM_BY_ID } from '../../data/gameData.ts';
import { generatorFor } from './generators.ts';

const gen = (id: string) => BUILDING_BY_ID.get(id)!;
const item = (id: string) => ITEM_BY_ID.get(id)!;

describe('generatorFor (real data)', () => {
  it('matches the classic 8 coal generators : 3 water extractors ratio', () => {
    const option = generatorFor(600, gen('Build_GeneratorCoal_C'), item('Desc_Coal_C'))!;
    expect(option.count).toBe(8);
    expect(option.fuelPerMin).toBeCloseTo(120); // 15 coal/min each
    expect(option.supplementalPerMin).toBeCloseTo(360); // 3 × 120 m³/min
    expect(option.supplementalId).toBe('Desc_Water_C');
  });

  it('burns 20 m³/min of Fuel per 250 MW generator', () => {
    const option = generatorFor(250, gen('Build_GeneratorFuel_C'), item('Desc_LiquidFuel_C'))!;
    expect(option.count).toBe(1);
    expect(option.fuelPerMin).toBeCloseTo(20);
    expect(option.supplementalPerMin).toBe(0);
  });

  it('handles nuclear fuel rods, water and waste', () => {
    const option = generatorFor(
      2500,
      gen('Build_GeneratorNuclear_C'),
      item('Desc_NuclearFuelRod_C'),
    )!;
    expect(option.fuelPerMin).toBeCloseTo(0.2);
    expect(option.supplementalPerMin).toBeCloseTo(240);
    expect(option.byproductPerMin).toBeCloseTo(10);
  });

  it('scales geothermal output by geyser purity', () => {
    const option = generatorFor(400, gen('Build_GeneratorGeoThermal_C'), undefined, 'pure')!;
    expect(option.powerPerGeneratorMW).toBe(400);
    expect(option.count).toBe(1);
  });

  it('rejects a fuel the generator cannot burn', () => {
    expect(
      generatorFor(75, gen('Build_GeneratorCoal_C'), item('Desc_LiquidFuel_C')),
    ).toBeUndefined();
  });
});
