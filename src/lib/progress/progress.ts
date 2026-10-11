/**
 * Guide progress maths. Pure: callers pass the flags in.
 *
 * A task linked to a milestone (`milestoneId`) or a Space Elevator phase
 * (`phase`) has no flag of its own; it is done when that is. Only steps marked
 * `optional` can be skipped, and skipped steps leave tier progress.
 */
import type { GuideStep, GuideTask, TierGuide } from '../../content/types.ts';

export type Flags = Readonly<Record<string, true>>;

export interface ProgressFlags {
  tasks: Flags;
  milestones: Flags;
  /** Delivered Space Elevator phases, keyed by phase number. */
  phases: Flags;
  /** Skipped steps, keyed by step ID. */
  skipped: Flags;
}

export interface Count {
  done: number;
  total: number;
}

export function isTaskDone(task: GuideTask, p: ProgressFlags): boolean {
  if (task.milestoneId) return !!p.milestones[task.milestoneId];
  if (task.phase !== undefined) return !!p.phases[String(task.phase)];
  return !!p.tasks[task.id];
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
 * Folds old separate ticks into one: a ticked linked task ticks its target
 * (a milestone or phase flag), and linked tasks lose their own flag. Nothing
 * ticked is lost.
 */
export function mergeLinkedTicks(
  tasks: Flags,
  targets: Flags,
  links: ReadonlyMap<string, string>,
): { tasks: Record<string, true>; targets: Record<string, true> } {
  const nextTasks: Record<string, true> = {};
  const nextTargets: Record<string, true> = { ...targets };
  for (const id of Object.keys(tasks)) {
    const target = links.get(id);
    if (target) nextTargets[target] = true;
    else nextTasks[id] = true;
  }
  return { tasks: nextTasks, targets: nextTargets };
}

export interface NextTask {
  step: GuideStep;
  /** Position of the step in the tier, from 0. */
  index: number;
  task: GuideTask;
}

/** The first task left in the tier's first open step, or null when the tier is complete. */
export function nextInTier(tier: TierGuide, p: ProgressFlags): NextTask | null {
  const index = tier.steps.findIndex((s) => isStepOpen(s, p));
  const step = tier.steps[index];
  const task = step?.tasks.find((t) => !isTaskDone(t, p));
  return step && task ? { step, index, task } : null;
}

export type StepState = 'done' | 'skipped' | 'current' | 'later';

/** Each step's place in the queue: only the first open step is current. */
export function stepStates(tier: TierGuide, p: ProgressFlags): StepState[] {
  const current = tier.steps.findIndex((s) => isStepOpen(s, p));
  return tier.steps.map((s, i) => {
    if (isStepSkipped(s, p)) return 'skipped';
    if (!isStepOpen(s, p)) return 'done';
    return i === current ? 'current' : 'later';
  });
}
