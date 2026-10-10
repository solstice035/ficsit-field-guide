import { describe, expect, it } from 'vitest';
import {
  clockPowerFactor,
  machinePowerMW,
  powerShardsFor,
  sloopOutputFactor,
  sloopPowerFactor,
  splitMachines,
} from './power.ts';

describe('power maths', () => {
  it('uses the 1.0 overclock exponent', () => {
    expect(clockPowerFactor(1)).toBeCloseTo(1);
    expect(clockPowerFactor(2.5)).toBeCloseTo(3.3578, 3);
    expect(clockPowerFactor(0.5)).toBeCloseTo(0.4, 2);
  });

  it('applies somersloop multipliers', () => {
    expect(sloopOutputFactor(1, 1)).toBe(2);
    expect(sloopOutputFactor(1, 2)).toBe(1.5);
    expect(sloopOutputFactor(0, 4)).toBe(1);
    expect(sloopOutputFactor(3, 0)).toBe(1);
    expect(sloopPowerFactor(4, 4)).toBe(4);
    expect(sloopPowerFactor(2, 4)).toBe(2.25);
  });

  it('computes machine power', () => {
    expect(machinePowerMW({ baseMW: 4, clock: 1 })).toBeCloseTo(4);
    expect(machinePowerMW({ baseMW: 55, clock: 1, sloops: 4, slots: 4 })).toBeCloseTo(220);
    expect(machinePowerMW({ baseMW: 15, clock: 2.5 })).toBeCloseTo(15 * 2.5 ** 1.321929);
  });

  it('splits fractional machines evenly by default', () => {
    expect(splitMachines(2.5)).toEqual({ count: 3, groups: [{ count: 3, clock: 2.5 / 3 }] });
    expect(splitMachines(2)).toEqual({ count: 2, groups: [{ count: 2, clock: 1 }] });
    expect(splitMachines(0)).toEqual({ count: 0, groups: [] });
  });

  it('can fill machines then run a remainder', () => {
    const split = splitMachines(2.5, { strategy: 'fill' });
    expect(split.count).toBe(3);
    expect(split.groups).toEqual([
      { count: 2, clock: 1 },
      { count: 1, clock: 0.5 },
    ]);
  });

  it('respects an overclock ceiling', () => {
    const split = splitMachines(5, { maxClock: 2.5 });
    expect(split).toEqual({ count: 2, groups: [{ count: 2, clock: 2.5 }] });
  });

  it('tolerates floating point noise when counting machines', () => {
    expect(splitMachines(3.0000000001).count).toBe(3);
  });

  it('counts power shards for overclocks', () => {
    expect(powerShardsFor(1)).toBe(0);
    expect(powerShardsFor(1.5)).toBe(1);
    expect(powerShardsFor(1.51)).toBe(2);
    expect(powerShardsFor(2.5)).toBe(3);
  });
});
