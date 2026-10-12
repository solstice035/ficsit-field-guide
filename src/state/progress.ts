import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MILESTONE_BY_TASK, PHASE_BY_TASK, stepById } from '../content/index.ts';
import { mergeLinkedTicks } from '../lib/progress/progress.ts';
import { type Flags, isRecord, parseFlags, safeMerge } from './schema.ts';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

export interface ProgressState {
  /** Ticks for unlinked tasks. A task linked to a milestone or phase reads that flag. */
  tasks: Flags;
  milestones: Flags;
  research: Flags;
  /** Delivered Space Elevator phases, keyed by phase number. */
  phases: Flags;
  /** Skipped optional steps, keyed by step ID. */
  skipped: Flags;
  /** Ticks a task; a linked task ticks its milestone or phase instead. */
  toggleTask: (id: string) => void;
  toggleMilestone: (id: string) => void;
  toggleResearch: (id: string) => void;
  togglePhase: (phase: number) => void;
  /** Skips or unskips a step; ignored unless the step is optional. */
  toggleSkipped: (stepId: string) => void;
  reset: () => void;
}

const toggle = (flags: Flags, id: string): Flags => {
  if (flags[id]) {
    const next = { ...flags };
    delete next[id];
    return next;
  }
  return { ...flags, [id]: true };
};

const EMPTY = { tasks: {}, milestones: {}, research: {}, phases: {}, skipped: {} };

export type ProgressData = Pick<
  ProgressState,
  'tasks' | 'milestones' | 'research' | 'phases' | 'skipped'
>;

const PHASE_LINKS: ReadonlyMap<string, string> = new Map(
  [...PHASE_BY_TASK].map(([task, phase]) => [task, String(phase)]),
);

/**
 * Validates persisted progress; missing sections are empty. Ticks on linked
 * tasks (saved before version 2) move onto their milestone, so a backup of
 * any version restores without losing a tick.
 */
export function parseProgress(raw: Record<string, unknown>): ProgressData {
  const flags = (v: unknown, what: string): Flags => (v === undefined ? {} : parseFlags(v, what));
  const milestones = mergeLinkedTicks(
    flags(raw.tasks, 'task list'),
    flags(raw.milestones, 'milestone list'),
    MILESTONE_BY_TASK,
  );
  const phases = mergeLinkedTicks(
    milestones.tasks,
    flags(raw.phases, 'Space Elevator list'),
    PHASE_LINKS,
  );
  return {
    tasks: phases.tasks,
    milestones: milestones.targets,
    research: flags(raw.research, 'research list'),
    phases: phases.targets,
    skipped: flags(raw.skipped, 'skipped step list'),
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...EMPTY,
      toggleTask: (id) =>
        set((s) => {
          const milestone = MILESTONE_BY_TASK.get(id);
          if (milestone) return { milestones: toggle(s.milestones, milestone) };
          const phase = PHASE_LINKS.get(id);
          if (phase) return { phases: toggle(s.phases, phase) };
          return { tasks: toggle(s.tasks, id) };
        }),
      toggleMilestone: (id) => set((s) => ({ milestones: toggle(s.milestones, id) })),
      toggleResearch: (id) => set((s) => ({ research: toggle(s.research, id) })),
      togglePhase: (phase) => set((s) => ({ phases: toggle(s.phases, String(phase)) })),
      toggleSkipped: (stepId) =>
        set((s) => (stepById(stepId)?.optional ? { skipped: toggle(s.skipped, stepId) } : {})),
      reset: () => set(EMPTY),
    }),
    {
      name: STORAGE_KEYS.progress,
      // v2: linked task ticks live on the milestone or phase; adds `skipped`.
      version: 2,
      storage: persistStorage,
      // `parseProgress` (run by `merge`) does the v1 → v2 fold; leave the data as is here.
      migrate: (persisted) => (isRecord(persisted) ? persisted : {}) as unknown as ProgressState,
      merge: safeMerge<ProgressState>(parseProgress),
    },
  ),
);
