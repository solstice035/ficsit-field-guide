import { TIER_0 } from './tiers/tier0.ts';
import { TIER_1 } from './tiers/tier1.ts';
import { TIER_2 } from './tiers/tier2.ts';
import { TIER_3 } from './tiers/tier3.ts';
import { TIER_4 } from './tiers/tier4.ts';
import { TIER_5 } from './tiers/tier5.ts';
import { TIER_6 } from './tiers/tier6.ts';
import { TIER_7 } from './tiers/tier7.ts';
import { TIER_8 } from './tiers/tier8.ts';
import { TIER_9 } from './tiers/tier9.ts';
import type { GuideStep, TierGuide } from './types.ts';

export const TIERS: readonly TierGuide[] = [
  TIER_0,
  TIER_1,
  TIER_2,
  TIER_3,
  TIER_4,
  TIER_5,
  TIER_6,
  TIER_7,
  TIER_8,
  TIER_9,
];

export const TIER_BY_NUMBER: ReadonlyMap<number, TierGuide> = new Map(
  TIERS.map((t) => [t.tier, t]),
);

/** Every task ID in a tier (for progress maths). */
export function taskIdsOf(tier: TierGuide): string[] {
  return tier.steps.flatMap((s) => s.tasks.map((t) => t.id));
}

/** Task ID → the milestone it submits, for every linked task. */
export const MILESTONE_BY_TASK: ReadonlyMap<string, string> = new Map(
  TIERS.flatMap((t) =>
    t.steps.flatMap((s) =>
      s.tasks.flatMap((task) => (task.milestoneId ? [[task.id, task.milestoneId] as const] : [])),
    ),
  ),
);

/** Task ID → the Space Elevator phase it delivers. */
export const PHASE_BY_TASK: ReadonlyMap<string, number> = new Map(
  TIERS.flatMap((t) =>
    t.steps.flatMap((s) =>
      s.tasks.flatMap((task) => (task.phase !== undefined ? [[task.id, task.phase] as const] : [])),
    ),
  ),
);

export function stepById(id: string): GuideStep | undefined {
  for (const tier of TIERS) {
    const step = tier.steps.find((s) => s.id === id);
    if (step) return step;
  }
  return undefined;
}

export { LAYOUTS, LAYOUT_BY_ID } from './layouts.ts';
export { SITES, SITE_BY_ID, DEFAULT_BASE } from './sites.ts';
export { SPACE_ELEVATOR_PHASES, PHASE_BY_NUMBER } from './spaceElevator.ts';
