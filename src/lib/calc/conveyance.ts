import type { ItemForm } from '../../data/types.ts';

export interface ConveyanceTier {
  mk: number;
  /** Items (belts) or m³ (pipes) per minute. */
  rate: number;
  buildingId: string;
}

/** Conveyor Belt Mk.1–Mk.6 (lifts match). Verified against generated data in tests. */
export const BELT_TIERS: readonly ConveyanceTier[] = [
  { mk: 1, rate: 60, buildingId: 'Build_ConveyorBeltMk1_C' },
  { mk: 2, rate: 120, buildingId: 'Build_ConveyorBeltMk2_C' },
  { mk: 3, rate: 270, buildingId: 'Build_ConveyorBeltMk3_C' },
  { mk: 4, rate: 480, buildingId: 'Build_ConveyorBeltMk4_C' },
  { mk: 5, rate: 780, buildingId: 'Build_ConveyorBeltMk5_C' },
  { mk: 6, rate: 1200, buildingId: 'Build_ConveyorBeltMk6_C' },
];

/** Pipeline Mk.1–Mk.2. */
export const PIPE_TIERS: readonly ConveyanceTier[] = [
  { mk: 1, rate: 300, buildingId: 'Build_Pipeline_C' },
  { mk: 2, rate: 600, buildingId: 'Build_PipelineMK2_C' },
];

export interface Conveyance {
  kind: 'belt' | 'pipe';
  mk: number;
  /** Capacity of one line. */
  capacity: number;
  lines: number;
  /** Fraction of total capacity used (0–1). */
  utilisation: number;
}

/**
 * Smallest belt/pipe tier (≤ the unlocked max) that carries `rate` on a
 * single line, else parallel lines of the highest unlocked tier.
 */
export function conveyanceFor(
  rate: number,
  form: ItemForm,
  maxBeltMk: number,
  maxPipeMk = 2,
): Conveyance {
  const kind = form === 'solid' ? 'belt' : 'pipe';
  const tiers = (kind === 'belt' ? BELT_TIERS : PIPE_TIERS).filter(
    (t) => t.mk <= Math.max(1, kind === 'belt' ? maxBeltMk : maxPipeMk),
  );
  const fit = tiers.find((t) => t.rate >= rate - 1e-9);
  const tier = fit ?? tiers[tiers.length - 1] ?? BELT_TIERS[0]!;
  const lines = Math.max(1, Math.ceil(rate / tier.rate - 1e-9));
  return {
    kind,
    mk: tier.mk,
    capacity: tier.rate,
    lines,
    utilisation: rate / (tier.rate * lines),
  };
}
