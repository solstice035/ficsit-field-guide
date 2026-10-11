import { tierForCost } from '../../data/availability.ts';
import { COLLECTIBLES, NODES } from '../../data/gameData.ts';
import type { Collectible, CollectibleType, ResourceNode } from '../../data/types.ts';
import { type Point2D, bearingDeg, compass8, distance2D } from '../../lib/geo/geo.ts';

export interface Located<T> {
  item: T;
  distance: number;
  bearing: number;
  compass: string;
}

export function locate<T extends Point2D>(item: T, from: Point2D): Located<T> {
  const bearing = bearingDeg(from, item);
  return { item, distance: distance2D(from, item), bearing, compass: compass8(bearing) };
}

export function nearestCollectibles(
  type: CollectibleType,
  from: Point2D,
  n: number,
  collected: Readonly<Record<string, true>> = {},
  includeCollected = false,
): Located<Collectible>[] {
  return COLLECTIBLES.filter((c) => c.type === type && (includeCollected || !collected[c.id]))
    .map((c) => locate(c, from))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}

/** Nearest extractable nodes of a resource (well cores excluded). */
export function nearestNodes(resource: string, from: Point2D, n: number): Located<ResourceNode>[] {
  return NODES.filter((node) => node.resource === resource && node.type !== 'well-core')
    .map((node) => locate(node, from))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}

/** Tier at which a crash site's item cost becomes producible (0 when it has no item cost). */
export function driveTier(c: Collectible): number {
  return c.unlockCost?.length ? tierForCost(c.unlockCost) : 0;
}

export const COLLECTIBLE_META: Record<
  CollectibleType,
  {
    label: string;
    plural: string;
    colour: string;
    shape: 'circle' | 'diamond' | 'square' | 'triangle';
    blurb: string;
  }
> = {
  mercerSphere: {
    label: 'Mercer Sphere',
    plural: 'Mercer Spheres',
    colour: '#3fd6c6',
    shape: 'circle',
    blurb:
      'MAM Alien Technology: Dimensional Depot research and upgrades (97 in total) plus 1 per Depot Uploader.',
  },
  somersloop: {
    label: 'Somersloop',
    plural: 'Somersloops',
    colour: '#ff5fa2',
    shape: 'diamond',
    blurb:
      'Production Amplifier (up to double output), Alien Power Augmenter (10 each) and 3 MAM research nodes.',
  },
  hardDrive: {
    label: 'Hard Drive',
    plural: 'Hard Drives (crash sites)',
    colour: '#ff9b42',
    shape: 'square',
    blurb:
      'Research in the MAM to choose one of two alternate recipes. Some crash sites need items to open.',
  },
  slugBlue: {
    label: 'Blue Power Slug',
    plural: 'Blue Power Slugs',
    colour: '#5aa9ff',
    shape: 'triangle',
    blurb: '1 Power Shard each (overclocking up to 150%).',
  },
  slugYellow: {
    label: 'Yellow Power Slug',
    plural: 'Yellow Power Slugs',
    colour: '#ffd84d',
    shape: 'triangle',
    blurb: '2 Power Shards each.',
  },
  slugPurple: {
    label: 'Purple Power Slug',
    plural: 'Purple Power Slugs',
    colour: '#c084fc',
    shape: 'triangle',
    blurb: '5 Power Shards each.',
  },
};

export const COLLECTIBLE_TYPES: readonly CollectibleType[] = [
  'mercerSphere',
  'somersloop',
  'hardDrive',
  'slugBlue',
  'slugYellow',
  'slugPurple',
];
