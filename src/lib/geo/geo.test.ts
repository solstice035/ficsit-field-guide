import { describe, expect, it } from 'vitest';
import { bearingDeg, compass8, distance2D, formatDistance, nearest } from './geo.ts';

describe('geo', () => {
  const origin = { x: 0, y: 0, z: 0 };

  it('measures planar distance in metres', () => {
    expect(distance2D(origin, { x: 300, y: 400 })).toBe(500);
  });

  it('treats −y as north', () => {
    expect(bearingDeg(origin, { x: 0, y: -100 })).toBeCloseTo(0);
    expect(bearingDeg(origin, { x: 100, y: 0 })).toBeCloseTo(90);
    expect(bearingDeg(origin, { x: 0, y: 100 })).toBeCloseTo(180);
    expect(bearingDeg(origin, { x: -100, y: 0 })).toBeCloseTo(270);
  });

  it('maps bearings to an 8-point compass', () => {
    expect(compass8(0)).toBe('N');
    expect(compass8(44)).toBe('NE');
    expect(compass8(100)).toBe('E');
    expect(compass8(200)).toBe('S');
    expect(compass8(338)).toBe('N');
  });

  it('formats distances', () => {
    expect(formatDistance(842.4)).toBe('840 m');
    expect(formatDistance(1234)).toBe('1.2 km');
    expect(formatDistance(12)).toBe('10 m');
  });

  it('returns the nearest n points', () => {
    const points = [
      { id: 'far', x: 1000, y: 0 },
      { id: 'near', x: 10, y: 0 },
      { id: 'mid', x: 100, y: 0 },
    ];
    expect(nearest(points, origin, 2).map((p) => p.item.id)).toEqual(['near', 'mid']);
    expect(nearest(points, origin, 5)[0]?.distance).toBe(10);
  });
});
