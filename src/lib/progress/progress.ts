/**
 * Guide progress maths. Pure: callers pass the flags in.
 *
 * A task linked to a milestone (`GuideTask.milestoneId`) has no flag of its
 * own; it is done when the milestone is submitted. Only steps marked
 * `optional` can be skipped, and skipped steps leave tier progress.
 */
import type { GuideStep, GuideTask, TierGuide } from '../../content/types.ts';

export type Flags = Readonly<Record<string, true>>;

export interface ProgressFlags {
  tasks: Flags;
  milestones: Flags;
  /** Skipped steps, keyed by step ID. */
  skipped: Flags;
}

export interface Count {
  done: number;
  total: number;
}

export function isTaskDone(task: GuideTask, p: ProgressFlags): boolean {
  return task.milestoneId ? !!p.milestones[task.milestoneId] : !!p.tasks[task.id];
}

export function isStepSkipped(step: GuideStep, p: ProgressFlags): boolean {
  return !!step.optional && !!p.skipped[step.id];
}

export function stepProgress(step: GuideStep, p: ProgressFlags): Count {
  return {
    done: step.tasks.filter((t) => isTaskDone(t, p)).length,
    total: step.tasks.length,
  };
}

/** Still has work to do: not skipped and at least one task left. */
export function isStepOpen(step: GuideStep, p: ProgressFlags): boolean {
  return !isStepSkipped(step, p) && step.tasks.some((t) => !isTaskDone(t, p));
}

/** Done and total tasks over the tier's steps that aren't skipped. */
export function tierProgress(tier: TierGuide, p: ProgressFlags): Count {
  return tier.steps
    .filter((s) => !isStepSkipped(s, p))
    .reduce(
      (acc, s) => {
        const c = stepProgress(s, p);
        return { done: acc.done + c.done, total: acc.total + c.total };
      },
      { done: 0, total: 0 },
    );
}

/**
 * Folds old separate ticks into one: a ticked linked task ticks its milestone,
 * and linked tasks lose their own flag. Nothing ticked is lost.
 */
export function mergeLinkedTicks(
  tasks: Flags,
  milestones: Flags,
  links: ReadonlyMap<string, string>,
): { tasks: Record<string, true>; milestones: Record<string, true> } {
  const nextTasks: Record<string, true> = {};
  const nextMilestones: Record<string, true> = { ...milestones };
  for (const id of Object.keys(tasks)) {
    const milestone = links.get(id);
    if (milestone) nextMilestones[milestone] = true;
    else nextTasks[id] = true;
  }
  return { tasks: nextTasks, milestones: nextMilestones };
}
