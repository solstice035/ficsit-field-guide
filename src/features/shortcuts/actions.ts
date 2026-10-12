import { TIERS } from '../../content/index.ts';
import { nextInTier } from '../../lib/progress/progress.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';

/** Ticks the NEXT task of the current tier, read straight from the stores. */
export function tickNextTask(): void {
  const { tasks, milestones, phases, skipped, toggleTask } = useProgress.getState();
  const tier = TIERS[useSettings.getState().currentTier] ?? TIERS[0]!;
  const next = nextInTier(tier, { tasks, milestones, phases, skipped });
  if (next) toggleTask(next.task.id);
}

/** Opens `/glance` in its named window (reused if already open). */
export function openGlance(): void {
  window.open(`${import.meta.env.BASE_URL}glance`, 'ficsit-glance');
}

/**
 * Moves focus to the next (+1) or previous (−1) step toggle on the page. From
 * outside the queue it starts at the current step. Does nothing off the tier page.
 */
export function moveStepFocus(direction: 1 | -1): void {
  const toggles = [...document.querySelectorAll<HTMLElement>('[data-step-toggle]')];
  if (!toggles.length) return;
  const at = toggles.findIndex((t) => t === document.activeElement);
  if (at === -1) {
    const current = toggles.find((t) => t.dataset.stepState === 'current') ?? toggles[0]!;
    current.focus();
    return;
  }
  toggles[Math.min(toggles.length - 1, Math.max(0, at + direction))]?.focus();
}
