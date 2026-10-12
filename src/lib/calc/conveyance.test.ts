import { describe, expect, it } from 'vitest';
import { BELT_TIERS, PIPE_TIERS, conveyanceFor } from './conveyance.ts';

describe('conveyance', () => {
  it('has the 1.0 belt and pipe speeds', () => {
    expect(BELT_TIERS.map((b) => b.rate)).toEqual([60, 120, 270, 480, 780, 1200]);
    expect(PIPE_TIERS.map((p) => p.rate)).toEqual([300, 600]);
  });

  it('picks the smallest belt that fits', () => {
    expect(conveyanceFor(45, 'solid', 6)).toMatchObject({ kind: 'belt', mk: 1, lines: 1 });
    expect(conveyanceFor(60, 'solid', 6)).toMatchObject({ mk: 1, lines: 1 });
    expect(conveyanceFor(61, 'solid', 6)).toMatchObject({ mk: 2, lines: 1 });
    expect(conveyanceFor(780, 'solid', 6)).toMatchObject({ mk: 5, lines: 1 });
  });

  it('uses parallel lines when the max belt is too slow', () => {
    const c = conveyanceFor(150, 'solid', 2);
    expect(c).toMatchObject({ kind: 'belt', mk: 2, lines: 2 });
    expect(c.utilisation).toBeCloseTo(150 / 240);
  });

  it('uses pipes for fluids', () => {
    expect(conveyanceFor(240, 'liquid', 6, 1)).toMatchObject({ kind: 'pipe', mk: 1, lines: 1 });
    expect(conveyanceFor(450, 'gas', 6, 2)).toMatchObject({ kind: 'pipe', mk: 2, lines: 1 });
    expect(conveyanceFor(450, 'liquid', 6, 1)).toMatchObject({ kind: 'pipe', mk: 1, lines: 2 });
  });
});
