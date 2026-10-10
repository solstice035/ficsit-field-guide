import { describe, expect, it } from 'vitest';
import { extractorRate, planExtraction } from './extraction.ts';

describe('extraction', () => {
  it('scales by purity and clock', () => {
    expect(extractorRate(60, 'impure')).toBe(30);
    expect(extractorRate(60, 'normal')).toBe(60);
    expect(extractorRate(60, 'pure')).toBe(120);
    expect(extractorRate(240, 'pure', 2.5)).toBe(1200);
  });

  it('caps at the belt limit', () => {
    expect(extractorRate(240, 'pure', 2.5, 780)).toBe(780);
  });

  it('plans nodes for a demand', () => {
    const plan = planExtraction({
      rate: 150,
      baseRatePerMin: 60,
      purity: 'pure',
      clock: 1,
      basePowerMW: 5,
    });
    expect(plan.perNode).toBe(120);
    expect(plan.exactNodes).toBeCloseTo(1.25);
    expect(plan.nodes).toBe(2);
    // Running both nodes evenly needs 62.5% clock.
    expect(plan.clockAcrossNodes).toBeCloseTo(0.625);
    expect(plan.powerMW).toBeCloseTo(2 * 5 * 0.625 ** 1.321929);
  });

  it('reports a single under-clocked node when one is enough', () => {
    const plan = planExtraction({
      rate: 45,
      baseRatePerMin: 60,
      purity: 'normal',
      clock: 1,
      basePowerMW: 5,
    });
    expect(plan.nodes).toBe(1);
    expect(plan.clockAcrossNodes).toBeCloseTo(0.75);
  });

  it('honours a fixed node count', () => {
    const plan = planExtraction({
      rate: 300,
      baseRatePerMin: 60,
      purity: 'pure',
      clock: 1,
      basePowerMW: 5,
      availableNodes: 1,
    });
    expect(plan.nodes).toBe(1);
    expect(plan.clockAcrossNodes).toBeCloseTo(2.5);
    expect(plan.shortfall).toBe(0);
  });

  it('flags a shortfall when available nodes cannot meet demand at 250%', () => {
    const plan = planExtraction({
      rate: 400,
      baseRatePerMin: 60,
      purity: 'pure',
      clock: 1,
      basePowerMW: 5,
      availableNodes: 1,
    });
    expect(plan.clockAcrossNodes).toBe(2.5);
    expect(plan.shortfall).toBeCloseTo(100);
  });
});
