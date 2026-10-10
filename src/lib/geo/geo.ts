/**
 * World geometry helpers. Coordinates are metres with x east and y south,
 * so north is −y (matches the in-game map with north at the top).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export type Compass8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

const COMPASS: readonly Compass8[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function distance2D(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Bearing in degrees clockwise from north (0–360). */
export function bearingDeg(from: Point2D, to: Point2D): number {
  const deg = (Math.atan2(to.x - from.x, -(to.y - from.y)) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export function compass8(deg: number): Compass8 {
  const index = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return COMPASS[index] ?? 'N';
}

/** Human distance: nearest 10 m below 1 km, else one-decimal km. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export interface Ranked<T> {
  item: T;
  distance: number;
}

/** The `n` closest points to `from` (planar distance). */
export function nearest<T extends Point2D>(
  items: readonly T[],
  from: Point2D,
  n: number,
): Ranked<T>[] {
  return items
    .map((item) => ({ item, distance: distance2D(from, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}
