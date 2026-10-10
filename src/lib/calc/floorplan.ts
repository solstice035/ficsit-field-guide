import type { Footprint } from '../../data/types.ts';
import { FOUNDATION_M } from './constants.ts';

export interface FloorRowInput {
  key: string;
  label: string;
  buildingId: string;
  count: number;
  footprint?: Footprint;
  /** Number of distinct input belts/pipes feeding the manifold. */
  inputLanes: number;
  /** Number of distinct output belts/pipes leaving the manifold. */
  outputLanes: number;
}

export interface FloorRow extends FloorRowInput {
  machineW: number;
  machineL: number;
  /** Centre-to-centre spacing along the manifold (m). */
  pitchM: number;
  lengthM: number;
  depthM: number;
  /** Offset of this row from the top of the plan (m). */
  offsetM: number;
  foundationsLong: number;
  foundationsDeep: number;
}

export interface FloorPlan {
  rows: FloorRow[];
  widthM: number;
  depthM: number;
  foundationsWide: number;
  foundationsDeep: number;
}

export interface FloorOptions {
  /** Gap between adjacent machines (m). */
  gapM?: number;
  /** Width of one belt/pipe lane (m). */
  laneM?: number;
  /** Walkway margin at each end of a row (m). */
  marginM?: number;
  /** Gap between rows (m). */
  rowGapM?: number;
}

const DEFAULT_FOOTPRINT: Footprint = { w: 8, l: 8, h: 8 };

/**
 * Lays each machine group out as a straight manifold row (machines side by
 * side, input lanes in front, output lanes behind), stacked in production
 * order. Dimensions use the game's clearance boxes; foundation counts are
 * rounded up to 8 m foundations.
 */
export function planFloor(rows: readonly FloorRowInput[], options: FloorOptions = {}): FloorPlan {
  const { gapM = 1, laneM = 2, marginM = 2, rowGapM = 4 } = options;
  let offset = 0;
  const laid: FloorRow[] = rows
    .filter((r) => r.count > 0)
    .map((row) => {
      const fp = row.footprint ?? DEFAULT_FOOTPRINT;
      const pitchM = Math.ceil(fp.w) + gapM;
      const lengthM = row.count * pitchM - gapM + 2 * marginM;
      const depthM =
        Math.max(1, row.inputLanes) * laneM +
        1 +
        Math.ceil(fp.l) +
        1 +
        Math.max(1, row.outputLanes) * laneM;
      const laidRow: FloorRow = {
        ...row,
        machineW: fp.w,
        machineL: fp.l,
        pitchM,
        lengthM,
        depthM,
        offsetM: offset,
        foundationsLong: Math.ceil(lengthM / FOUNDATION_M),
        foundationsDeep: Math.ceil(depthM / FOUNDATION_M),
      };
      offset += depthM + rowGapM;
      return laidRow;
    });

  const widthM = laid.reduce((w, r) => Math.max(w, r.lengthM), 0);
  const depthM = laid.length ? offset - rowGapM : 0;
  return {
    rows: laid,
    widthM,
    depthM,
    foundationsWide: Math.ceil(widthM / FOUNDATION_M),
    foundationsDeep: Math.ceil(depthM / FOUNDATION_M),
  };
}
