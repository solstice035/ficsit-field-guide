import { describe, expect, it } from 'vitest';
import { buildFactoryPlan } from '../lib/plan/factoryPlan.ts';
import { SCHEMATIC_BY_ID } from './gameData.ts';
import { unlockSummary } from './unlocks.ts';

describe('unlockSummary', () => {
  it('lists buildings and scanner unlocks but not cosmetic swatches', () => {
    const summary = unlockSummary(SCHEMATIC_BY_ID.get('Schematic_3-1_C')!);
    expect(summary.recipes).toContain('Coal-Powered Generator');
    expect(summary.recipes).toContain('Water Extractor');
    expect(summary.recipes.some((r) => /swatch/i.test(r))).toBe(false);
    expect(summary.scanner).toEqual(['Coal']);
  });

  it('includes nested sub-schematic unlocks (Oil Processing → Refinery)', () => {
    const summary = unlockSummary(SCHEMATIC_BY_ID.get('Schematic_5-1_C')!);
    expect(summary.recipes).toContain('Refinery');
    expect(summary.recipes).toContain('Plastic');
  });
});

describe('power plant machine count', () => {
  it('counts generators as machines', () => {
    const plan = buildFactoryPlan({
      targets: [
        { item: 'Desc_Coal_C', rate: 120 },
        { item: 'Desc_Water_C', rate: 360 },
      ],
      generators: { buildingId: 'Build_GeneratorCoal_C', count: 8 },
    });
    expect(plan.machineCount).toBe(8);
    expect(plan.power.generatedMW).toBe(600);
  });
});
