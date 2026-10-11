import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, persistStorage } from './storage.ts';

type Flags = Record<string, true>;

export interface ProgressState {
  tasks: Flags;
  milestones: Flags;
  research: Flags;
  /** Delivered Space Elevator phases, keyed by phase number. */
  phases: Flags;
  toggleTask: (id: string) => void;
  toggleMilestone: (id: string) => void;
  toggleResearch: (id: string) => void;
  togglePhase: (phase: number) => void;
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

const EMPTY = { tasks: {}, milestones: {}, research: {}, phases: {} };

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...EMPTY,
      toggleTask: (id) => set((s) => ({ tasks: toggle(s.tasks, id) })),
      toggleMilestone: (id) => set((s) => ({ milestones: toggle(s.milestones, id) })),
      toggleResearch: (id) => set((s) => ({ research: toggle(s.research, id) })),
      togglePhase: (phase) => set((s) => ({ phases: toggle(s.phases, String(phase)) })),
      reset: () => set(EMPTY),
    }),
    { name: STORAGE_KEYS.progress, version: 1, storage: persistStorage },
  ),
);
