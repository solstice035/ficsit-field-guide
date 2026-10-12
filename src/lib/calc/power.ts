import { CLOCK_PER_SHARD, EPSILON, MAX_CLOCK, POWER_EXPONENT } from './constants.ts';

/** Power scale for a clock speed (fraction): `clock^exponent`. */
export function clockPowerFactor(clock: number, exponent = POWER_EXPONENT): number {
  return clock <= 0 ? 0 : clock ** exponent;
}

/** Output multiplier from Somersloops: `1 + filled/slots` (no slots → 1). */
export function sloopOutputFactor(sloops: number, slots: number): number {
  if (slots <= 0 || sloops <= 0) return 1;
  return 1 + Math.min(sloops, slots) / slots;
}

/** Power multiplier from Somersloops: `(1 + filled/slots)²`. */
export function sloopPowerFactor(sloops: number, slots: number): number {
  return sloopOutputFactor(sloops, slots) ** 2;
}

export interface MachinePowerInput {
  baseMW: number;
  clock: number;
  exponent?: number;
  sloops?: number;
  slots?: number;
}

/** Power draw of one machine in MW. */
export function machinePowerMW({
  baseMW,
  clock,
  exponent = POWER_EXPONENT,
  sloops = 0,
  slots = 0,
}: MachinePowerInput): number {
  return baseMW * clockPowerFactor(clock, exponent) * sloopPowerFactor(sloops, slots);
}

export type ClockStrategy = 'even' | 'fill';

export interface MachineGroup {
  count: number;
  /** Clock speed as a fraction (1 = 100%). */
  clock: number;
}

export interface MachineSplit {
  count: number;
  groups: MachineGroup[];
}

export interface SplitOptions {
  strategy?: ClockStrategy;
  /** Highest clock to plan for (1 = no shards, 2.5 = three shards). */
  maxClock?: number;
}

/**
 * Turns a fractional machine requirement (in 100%-machines) into whole
 * machines and clock speeds.
 *
 * - `even`: every machine runs at the same clock (lowest total power).
 * - `fill`: machines run at `maxClock`; one runs the remainder.
 */
export function splitMachines(machines: number, options: SplitOptions = {}): MachineSplit {
  const { strategy = 'even', maxClock = 1 } = options;
  const clockCap = Math.min(Math.max(maxClock, EPSILON), MAX_CLOCK);
  if (machines <= EPSILON) return { count: 0, groups: [] };

  const count = Math.max(1, Math.ceil(machines / clockCap - 1e-6));

  if (strategy === 'even') {
    return { count, groups: [{ count, clock: machines / count }] };
  }

  const full = Math.floor(machines / clockCap + 1e-6);
  const remainder = machines - full * clockCap;
  const groups: MachineGroup[] = [];
  if (full > 0) groups.push({ count: full, clock: clockCap });
  if (remainder > 1e-6) groups.push({ count: 1, clock: remainder });
  return { count: groups.reduce((n, g) => n + g.count, 0), groups };
}

/** Power Shards needed to reach a clock speed. */
export function powerShardsFor(clock: number): number {
  if (clock <= 1 + 1e-6) return 0;
  return Math.ceil((clock - 1 - 1e-6) / CLOCK_PER_SHARD);
}
