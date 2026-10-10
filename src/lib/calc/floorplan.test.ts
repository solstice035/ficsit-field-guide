import { describe, expect, it } from 'vitest';
import { planFloor } from './floorplan.ts';

describe('planFloor', () => {
  it('sizes a manifold row from machine footprints', () => {
    const plan = planFloor([
      {
        key: 'smelt',
        label: 'Iron Ingot',
        buildingId: 'Build_SmelterMk1_C',
        count: 4,
        footprint: { w: 5, l: 10, h: 4.5 },
        inputLanes: 1,
        outputLanes: 1,
      },
    ]);
    const row = plan.rows[0]!;
    expect(row.pitchM).toBe(6);
    // 4 × 6 − 1 gap + 2 × 2 margins = 27 m → 4 foundations long.
    expect(row.lengthM).toBe(27);
    expect(row.foundationsLong).toBe(4);
    // lanes 2 + 1 + 10 + 1 + 2 = 16 m → 2 foundations deep.
    expect(row.depthM).toBe(16);
    expect(row.foundationsDeep).toBe(2);
    expect(plan.widthM).toBe(27);
    expect(plan.depthM).toBe(16);
  });

  it('stacks rows with a gap and widens multi-input rows', () => {
    const plan = planFloor([
      {
        key: 'a',
        label: 'A',
        buildingId: 'x',
        count: 1,
        footprint: { w: 8, l: 10, h: 6 },
        inputLanes: 1,
        outputLanes: 1,
      },
      {
        key: 'b',
        label: 'B',
        buildingId: 'y',
        count: 2,
        footprint: { w: 9, l: 16, h: 3 },
        inputLanes: 2,
        outputLanes: 1,
      },
    ]);
    expect(plan.rows[1]!.offsetM).toBe(plan.rows[0]!.depthM + 4);
    expect(plan.rows[1]!.depthM).toBe(2 * 2 + 1 + 16 + 1 + 2);
    expect(plan.depthM).toBe(plan.rows[0]!.depthM + 4 + plan.rows[1]!.depthM);
  });

  it('skips empty groups and falls back to an 8 m footprint', () => {
    const plan = planFloor([
      { key: 'none', label: 'None', buildingId: 'x', count: 0, inputLanes: 1, outputLanes: 1 },
      { key: 'one', label: 'One', buildingId: 'x', count: 1, inputLanes: 1, outputLanes: 1 },
    ]);
    expect(plan.rows).toHaveLength(1);
    expect(plan.rows[0]!.machineW).toBe(8);
  });
});
