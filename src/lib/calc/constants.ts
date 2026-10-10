import type { Purity } from '../../data/types.ts';

/** Overclock power exponent since 1.0 (log₂ 2.5). */
export const POWER_EXPONENT = 1.321929;

/** Node purity multipliers applied to extractor base rates. */
export const PURITY_MULTIPLIER: Readonly<Record<Purity, number>> = {
  impure: 0.5,
  normal: 1,
  pure: 2,
};

/** Clock speed limits (fractions; 2.5 = 250% with three Power Shards). */
export const MIN_CLOCK = 0.01;
export const MAX_CLOCK = 2.5;

/** Each Power Shard adds 50 percentage points of headroom above 100%. */
export const CLOCK_PER_SHARD = 0.5;

/** Foundation edge length in metres. */
export const FOUNDATION_M = 8;

/** Floating-point tolerance for rates and machine counts. */
export const EPSILON = 1e-9;
