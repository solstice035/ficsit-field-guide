import { create } from 'zustand';
import { useProgress } from '../../state/progress.ts';

export interface LastTick {
  taskId: string;
  label: string;
}

interface LastTickState {
  last: LastTick | null;
}

/**
 * The task most recently ticked from a NEXT surface or the `n` shortcut, so
 * every NEXT surface can say what changed and offer to undo it. Session only.
 */
export const useLastTick = create<LastTickState>()(() => ({ last: null }));

/** Ticks a NEXT task and remembers it for undo. */
export function tickAndRemember(tick: LastTick): void {
  useProgress.getState().toggleTask(tick.taskId);
  useLastTick.setState({ last: tick });
}

/** Unticks the remembered task, if any. */
export function undoLastTick(): void {
  const { last } = useLastTick.getState();
  if (!last) return;
  useProgress.getState().toggleTask(last.taskId);
  useLastTick.setState({ last: null });
}
