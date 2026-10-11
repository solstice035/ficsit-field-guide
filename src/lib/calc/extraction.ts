import type { Purity } from '../../data/types.ts';
import { MAX_CLOCK, PURITY_MULTIPLIER } from './constants.ts';
import { clockPowerFactor } from './power.ts';

/** Extractor output per node (per minute), optionally capped by the output belt/pipe. */
export function extractorRate(
  baseRatePerMin: number,
  purity: Purity,
  clock = 1,
  cap = Number.POSITIVE_INFINITY,
): number {
  return Math.min(baseRatePerMin * PURITY_MULTIPLIER[purity] * clock, cap);
}

export interface ExtractionInput {
  /** Demand per minute. */
  rate: number;
  /** Extractor base rate on a normal node at 100%. */
  baseRatePerMin: number;
  purity: Purity;
  /** Preferred clock per extractor (1 = 100%, up to 2.5). */
  clock: number;
  basePowerMW: number;
  /** Output cap per node (belt/pipe limit). */
  cap?: number;
  /** Limit to a fixed number of nodes; the clock is raised to suit. */
  availableNodes?: number;
}

export interface ExtractionPlan {
  perNode: number;
  exactNodes: number;
  nodes: number;
  /** Clock that spreads the demand evenly across `nodes`. */
  clockAcrossNodes: number;
  powerMW: number;
  /** Unmet demand when `availableNodes` cannot cover it at 250%. */
  shortfall: number;
}

/** Plans how many nodes/extractors cover a demand, and at what clock. */
export function planExtraction(input: ExtractionInput): ExtractionPlan {
  const { rate, baseRatePerMin, purity, clock, basePowerMW, cap, availableNodes } = input;
  const atFull = baseRatePerMin * PURITY_MULTIPLIER[purity];
  const perNode = extractorRate(baseRatePerMin, purity, clock, cap);
  const exactNodes = perNode > 0 ? rate / perNode : 0;

  if (rate <= 0 || atFull <= 0) {
    return { perNode, exactNodes: 0, nodes: 0, clockAcrossNodes: 0, powerMW: 0, shortfall: 0 };
  }

  const nodes =
    availableNodes !== undefined
      ? Math.max(1, availableNodes)
      : Math.max(1, Math.ceil(exactNodes - 1e-6));
  const maxPerNode = Math.min(atFull * MAX_CLOCK, cap ?? Number.POSITIVE_INFINITY);
  const perNodeNeeded = rate / nodes;
  const shortfall = Math.max(0, rate - maxPerNode * nodes);
  const clockAcrossNodes = Math.min(perNodeNeeded, maxPerNode) / atFull;

  return {
    perNode,
    exactNodes,
    nodes,
    clockAcrossNodes,
    powerMW: nodes * basePowerMW * clockPowerFactor(clockAcrossNodes),
    shortfall,
  };
}
