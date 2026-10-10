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
  /** Offset of this row from the left edge of the plan (m). */
  offsetX: number;
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
  /** Gap between rows, both across and down (m). */
  rowGapM?: number;
  /**
   * `pack` (default) places rows side by side on shelves, aiming for a
   * roughly square footprint; `stack` puts every row under the previous one.
   */
  arrangement?: 'pack' | 'stack';
  /** Shelf width for `pack` (m). Defaults to ~1.25 × √(total row area). */
  targetWidthM?: number;
}

const DEFAULT_FOOTPRINT: Footprint = { w: 8, l: 8, h: 8 };

/**
 * Lays each machine group out as a straight manifold row (machines side by
 * side, input lanes in front, output lanes behind) in production order.
 * Dimensions use the game's clearance boxes; foundation counts are rounded up
 * to 8 m foundations.
 */
export function planFloor(rows: readonly FloorRowInput[], options: FloorOptions = {}): FloorPlan {
  const { gapM = 1, laneM = 2, marginM = 2, rowGapM = 4, arrangement = 'pack' } = options;

  const sized = rows
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
      return { row, fp, pitchM, lengthM, depthM };
    });

  const longest = sized.reduce((m, s) => Math.max(m, s.lengthM), 0);
  // Area including the gaps around each row, so the packed result is near-square.
  const area = sized.reduce((n, s) => n + (s.lengthM + rowGapM) * (s.depthM + rowGapM), 0);
  const shelfWidth =
    arrangement === 'stack' ? 0 : Math.max(longest, options.targetWidthM ?? Math.sqrt(area) * 1.2);

  let x = 0;
  let y = 0;
  let shelfDepth = 0;
  const laid: FloorRow[] = sized.map(({ row, fp, pitchM, lengthM, depthM }) => {
    if (x > 0 && (arrangement === 'stack' || x + lengthM > shelfWidth)) {
      y += shelfDepth + rowGapM;
      x = 0;
      shelfDepth = 0;
    }
    const laidRow: FloorRow = {
      ...row,
      machineW: fp.w,
      machineL: fp.l,
      pitchM,
      lengthM,
      depthM,
      offsetX: x,
      offsetM: y,
      foundationsLong: Math.ceil(lengthM / FOUNDATION_M),
      foundationsDeep: Math.ceil(depthM / FOUNDATION_M),
    };
    x += lengthM + rowGapM;
    shelfDepth = Math.max(shelfDepth, depthM);
    return laidRow;
  });

  const widthM = laid.reduce((w, r) => Math.max(w, r.offsetX + r.lengthM), 0);
  const depthM = laid.length ? y + shelfDepth : 0;
  return {
    rows: laid,
    widthM,
    depthM,
    foundationsWide: Math.ceil(widthM / FOUNDATION_M),
    foundationsDeep: Math.ceil(depthM / FOUNDATION_M),
  };
}
