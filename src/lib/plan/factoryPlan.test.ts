import { describe, expect, it } from 'vitest';
import { buildChecklist } from './checklist.ts';
import { buildFactoryPlan } from './factoryPlan.ts';
import { formatClock, formatMW, formatRate } from './format.ts';

const group = (plan: ReturnType<typeof buildFactoryPlan>, recipeId: string) =>
  plan.groups.find((g) => g.recipe.id === recipeId);

describe('buildFactoryPlan (real data)', () => {
  it('plans 5 Reinforced Iron Plates/min from a pure iron node', () => {
    const plan = buildFactoryPlan({
      targets: [{ item: 'Desc_IronPlateReinforced_C', rate: 5 }],
      resources: { Desc_OreIron_C: { purity: 'pure' } },
    });
    expect(group(plan, 'Recipe_IronPlateReinforced_C')?.split.count).toBe(1);
    expect(group(plan, 'Recipe_IronPlate_C')?.machines).toBeCloseTo(1.5);
    expect(group(plan, 'Recipe_IronPlate_C')?.split).toEqual({
      count: 2,
      groups: [{ count: 2, clock: 0.75 }],
    });
    expect(group(plan, 'Recipe_Screw_C')?.machines).toBeCloseTo(1.5);
    expect(group(plan, 'Recipe_IngotIron_C')?.machines).toBeCloseTo(2);

    const iron = plan.extraction.find((e) => e.item === 'Desc_OreIron_C')!;
    expect(iron.rate).toBeCloseTo(60);
    expect(iron.building.id).toBe('Build_MinerMk1_C');
    expect(iron.plan.nodes).toBe(1);
    expect(iron.plan.clockAcrossNodes).toBeCloseTo(0.5);

    // Stages: ingots first, RIP last.
    expect(group(plan, 'Recipe_IngotIron_C')?.stage).toBe(1);
    expect(group(plan, 'Recipe_IronPlateReinforced_C')?.stage).toBe(4);
    expect(plan.groups[0]?.recipe.id).toBe('Recipe_IngotIron_C');

    expect(plan.power.productionMW).toBeGreaterThan(0);
    expect(plan.bom.find((b) => b.item === 'Desc_IronPlateReinforced_C')?.amount).toBeGreaterThan(
      0,
    );
    expect(plan.warnings.filter((w) => w.level === 'warn')).toEqual([]);
  });

  it('creates balanced flow edges', () => {
    const plan = buildFactoryPlan({ targets: [{ item: 'Desc_IronPlateReinforced_C', rate: 5 }] });
    const into = (key: string, item: string) =>
      plan.edges.filter((e) => e.to.key === key && e.item === item).reduce((n, e) => n + e.rate, 0);
    expect(into('Recipe_IronPlateReinforced_C', 'Desc_IronPlate_C')).toBeCloseTo(30);
    expect(into('Recipe_IronPlateReinforced_C', 'Desc_IronScrew_C')).toBeCloseTo(60);
    expect(into('Desc_IronPlateReinforced_C', 'Desc_IronPlateReinforced_C')).toBeCloseTo(5);
  });

  it('nets the aluminium water loop and extracts the remainder', () => {
    const plan = buildFactoryPlan({
      targets: [{ item: 'Desc_AluminumIngot_C', rate: 60 }],
      maxBeltMk: 5,
      maxPipeMk: 2,
    });
    const water = plan.extraction.find((e) => e.item === 'Desc_Water_C')!;
    expect(water.rate).toBeCloseTo(60);
    expect(water.building.id).toBe('Build_WaterPump_C');
    expect(plan.extraction.find((e) => e.item === 'Desc_OreBauxite_C')?.rate).toBeCloseTo(60);
  });

  it('reports oil byproducts as surplus', () => {
    const plan = buildFactoryPlan({ targets: [{ item: 'Desc_Plastic_C', rate: 20 }] });
    expect(plan.surplus.find((s) => s.item === 'Desc_HeavyOilResidue_C')?.rate).toBeCloseTo(10);
    expect(plan.extraction.find((e) => e.item === 'Desc_LiquidOil_C')?.building.id).toBe(
      'Build_OilPump_C',
    );
  });

  it('honours recipe overrides, sloops and overclocking', () => {
    const plan = buildFactoryPlan({
      targets: [{ item: 'Desc_IronPlate_C', rate: 40 }],
      sloops: { Recipe_IronPlate_C: 1 },
      maxClock: 2.5,
      clockStrategy: 'fill',
    });
    const plates = group(plan, 'Recipe_IronPlate_C')!;
    expect(plates.outputMultiplier).toBe(2);
    expect(plates.machines).toBeCloseTo(1);
    expect(plan.sloopCount).toBe(1);
    expect(plan.bom.find((b) => b.item === 'Desc_WAT1_C')?.amount).toBe(1);
  });

  it('forces an item to be imported with an empty override', () => {
    const plan = buildFactoryPlan({
      targets: [{ item: 'Desc_IronPlate_C', rate: 20 }],
      recipeOverrides: { Desc_IronIngot_C: '' },
    });
    expect(plan.imports).toEqual([{ item: 'Desc_IronIngot_C', rate: 30 }]);
    expect(plan.extraction).toEqual([]);
  });

  it('warns when fixed nodes cannot meet demand', () => {
    const plan = buildFactoryPlan({
      targets: [{ item: 'Desc_IronIngot_C', rate: 400 }],
      resources: { Desc_OreIron_C: { purity: 'impure', nodes: 1 } },
      maxBeltMk: 6,
    });
    expect(plan.warnings.some((w) => w.level === 'warn' && w.message.includes('Iron Ore'))).toBe(
      true,
    );
  });

  it('produces a readable checklist', () => {
    const plan = buildFactoryPlan({
      targets: [{ item: 'Desc_IronPlateReinforced_C', rate: 5 }],
      resources: { Desc_OreIron_C: { purity: 'pure' } },
    });
    const steps = buildChecklist(plan);
    expect(steps[0]?.title).toBe('Place 1× Miner Mk.1 on pure Iron Ore node at 50%');
    expect(steps.some((s) => s.title.startsWith('Build 1× Assembler: Reinforced Iron Plate'))).toBe(
      true,
    );
    expect(steps.some((s) => s.id === 'power')).toBe(true);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
  });
});

describe('format helpers', () => {
  it('formats rates, clocks and power', () => {
    expect(formatRate(22.5, 'Desc_IronPlate_C')).toBe('22.5/min');
    expect(formatRate(45, 'Desc_Water_C')).toBe('45 m³/min');
    expect(formatClock(2.5 / 3)).toBe('83.3333%');
    expect(formatMW(1250)).toBe('1.25 GW');
    expect(formatMW(37.42)).toBe('37.4 MW');
  });
});
