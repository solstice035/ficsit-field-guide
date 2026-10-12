import { useEffect, useState } from 'react';
import { TIERS } from '../../content/index.ts';
import type { TierGuide } from '../../content/types.ts';
import { MILESTONE_BY_TASK, PHASE_BY_TASK } from '../../content/index.ts';
import { type NextTask, isTaskDone, nextInTier, stepStates } from '../../lib/progress/progress.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { type LastTick, tickAndRemember, undoLastTick, useLastTick } from './lastTick.ts';
import { useProgressFlags } from './progress.ts';

/** A task's link (milestone or phase), so a remembered tick reads the right flag. */
const linkOf = (taskId: string) => ({
  milestoneId: MILESTONE_BY_TASK.get(taskId),
  phase: PHASE_BY_TASK.get(taskId),
});

/** Wait before a fresh line can be marked seen, so the tick itself doesn't clear it. */
const SEEN_DELAY_MS = 1200;

/**
 * Holds `true` from when `key` changes until the player next moves, types or
 * touches, so a line that just changed stays lit until it has been seen.
 */
export function useFreshUntilSeen(key: string): boolean {
  const [seenKey, setSeenKey] = useState(key);
  const fresh = seenKey !== key;
  useEffect(() => {
    if (!fresh) return;
    const markSeen = () => setSeenKey(key);
    const events = ['pointermove', 'keydown', 'touchstart'] as const;
    const timer = window.setTimeout(() => {
      for (const e of events) window.addEventListener(e, markSeen, { once: true, passive: true });
    }, SEEN_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, markSeen);
    };
  }, [fresh, key]);
  return fresh;
}

export interface NextTaskState {
  /** The player's current tier. */
  tier: TierGuide;
  /** Null when the current tier is complete. */
  next: NextTask | null;
  /** The task after `next`, in the same step or the next open one. */
  after: NextTask | null;
  /** Up to three open steps after the current one. */
  then: NextTask['step'][];
  /** True while the line that just replaced a ticked task hasn't been seen. */
  fresh: boolean;
  /** The last task ticked from a NEXT surface, while it is still ticked. */
  lastTicked: LastTick | null;
  tick: () => void;
  undo: () => void;
  skip: () => void;
  advanceTier: () => void;
}

/** Everything a NEXT surface (strip, hero, glance) needs about the current tier. */
export function useNextTask(): NextTaskState {
  const currentTier = useSettings((s) => s.currentTier);
  const setCurrentTier = useSettings((s) => s.setCurrentTier);
  const flags = useProgressFlags();
  const toggleSkipped = useProgress((s) => s.toggleSkipped);
  const tier = TIERS[currentTier] ?? TIERS[0]!;
  const next = nextInTier(tier, flags);
  const fresh = useFreshUntilSeen(next?.task.id ?? `complete-${tier.tier}`);
  const last = useLastTick((s) => s.last);
  const lastTicked =
    last && isTaskDone({ id: last.taskId, label: last.label, ...linkOf(last.taskId) }, flags)
      ? last
      : null;

  // "After" pretends the next task is done and asks again.
  const after = next
    ? nextInTier(tier, {
        ...flags,
        ...(next.task.milestoneId
          ? { milestones: { ...flags.milestones, [next.task.milestoneId]: true } }
          : next.task.phase !== undefined
            ? { phases: { ...flags.phases, [String(next.task.phase)]: true } }
            : { tasks: { ...flags.tasks, [next.task.id]: true } }),
      })
    : null;
  const states = stepStates(tier, flags);
  const then = tier.steps.filter((_step, i) => states[i] === 'later').slice(0, 3);

  return {
    tier,
    next,
    after,
    then,
    fresh,
    lastTicked,
    tick: () => next && tickAndRemember({ taskId: next.task.id, label: next.task.label }),
    undo: undoLastTick,
    skip: () => next && toggleSkipped(next.step.id),
    advanceTier: () => setCurrentTier(tier.tier + 1),
  };
}
