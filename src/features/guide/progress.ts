import { TIERS, taskIdsOf } from '../../content/index.ts';
import type { TierGuide } from '../../content/types.ts';
import { MILESTONES_BY_TIER } from '../../data/gameData.ts';
import { useProgress } from '../../state/progress.ts';

export interface TierProgress {
  done: number;
  total: number;
}

type Flags = Record<string, true>;

/** Tasks + milestones completed in a tier. */
export function tierProgress(tier: TierGuide, tasks: Flags, milestones: Flags): TierProgress {
  const taskIds = taskIdsOf(tier);
  const milestoneIds = (MILESTONES_BY_TIER.get(tier.tier) ?? []).map((m) => m.id);
  const done =
    taskIds.filter((id) => tasks[id]).length + milestoneIds.filter((id) => milestones[id]).length;
  return { done, total: taskIds.length + milestoneIds.length };
}

export function useTierProgress(tier: TierGuide): TierProgress {
  const tasks = useProgress((s) => s.tasks);
  const milestones = useProgress((s) => s.milestones);
  return tierProgress(tier, tasks, milestones);
}

/** Progress for every tier (stable order 0–9). */
export function useAllTierProgress(): TierProgress[] {
  const tasks = useProgress((s) => s.tasks);
  const milestones = useProgress((s) => s.milestones);
  return TIERS.map((t) => tierProgress(t, tasks, milestones));
}
