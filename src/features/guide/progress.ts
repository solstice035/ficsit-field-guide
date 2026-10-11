import { TIERS } from '../../content/index.ts';
import type { TierGuide } from '../../content/types.ts';
import { type Count, type ProgressFlags, tierProgress } from '../../lib/progress/progress.ts';
import { useProgress } from '../../state/progress.ts';

export type TierProgress = Count;

/** The flags progress maths needs, from the store. */
export function useProgressFlags(): ProgressFlags {
  const tasks = useProgress((s) => s.tasks);
  const milestones = useProgress((s) => s.milestones);
  const phases = useProgress((s) => s.phases);
  const skipped = useProgress((s) => s.skipped);
  return { tasks, milestones, phases, skipped };
}

/** Tasks done in a tier; each milestone counts once, through its "Submit" task. */
export function useTierProgress(tier: TierGuide): TierProgress {
  return tierProgress(tier, useProgressFlags());
}

/** Progress for every tier (stable order 0–9). */
export function useAllTierProgress(): TierProgress[] {
  const flags = useProgressFlags();
  return TIERS.map((t) => tierProgress(t, flags));
}
