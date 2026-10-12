import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

describe('tier guide', () => {
  it('has one tab per tier with the active tier selected', async () => {
    renderRoute('/tier/2');
    const tablist = await screen.findByRole('tablist', { name: 'Tiers' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(10);
    expect(within(tablist).getByRole('tab', { selected: true })).toHaveTextContent('Tier 2');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/Tier 2/);
    expect(screen.getByRole('heading', { level: 1, name: 'Part Assembly' })).toBeInTheDocument();
  });

  it('moves between tiers with the arrow keys', async () => {
    const { user, router } = renderRoute('/tier/2');
    const selected = await screen.findByRole('tab', { selected: true });
    selected.focus();
    await user.keyboard('{ArrowRight}');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Coal Power & Steel' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/tier/3');
    await user.keyboard('{Home}');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Onboarding' }),
    ).toBeInTheDocument();
  });

  it('ticks the next task from the NEXT strip and advances in place', async () => {
    const { user } = renderRoute('/tier/0');
    const strip = await screen.findByRole('region', { name: 'Next task' });
    const pod = 'Dismantle the drop pod (20 Iron Ore)';
    const first = within(strip).getByRole('switch', { name: pod });
    expect(first).toHaveAttribute('aria-checked', 'false');
    await user.click(first);
    expect(useProgress.getState().tasks['t0-land-pod']).toBe(true);
    // The strip now offers the step's next task, and the queue row shows the first one ticked.
    expect(
      within(strip).getByRole('switch', { name: 'Place the HUB in the HUB Basin' }),
    ).toHaveAttribute('aria-checked', 'false');
    const queue = screen.getByRole('region', { name: 'Steps' });
    expect(within(queue).getByRole('switch', { name: pod })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('opens the current step and collapses it once done', async () => {
    renderRoute('/tier/0');
    const steps = await screen.findByRole('region', { name: 'Steps' });
    const [first, second] = within(steps).getAllByRole('button', { expanded: true });
    expect(first).toHaveAccessibleName(/NEXT/);
    expect(second).toBeUndefined();
    expect(within(steps).getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(3);
  });

  it('ticks a milestone through its Submit task, counting it once', async () => {
    useSettings.getState().setCurrentTier(1);
    const { user } = renderRoute('/tier/1');
    const queue = await screen.findByRole('region', { name: 'Steps' });
    await user.click(within(queue).getByRole('button', { name: /Base Building/ }));
    const task = within(queue).getByRole('switch', { name: 'Submit Base Building' });
    await user.click(task);
    expect(useProgress.getState().milestones['Schematic_1-1_C']).toBe(true);
    expect(useProgress.getState().tasks['t1-bb-submit']).toBeUndefined();
    expect(within(queue).getAllByText('Submitted').length).toBeGreaterThan(0);
  });

  it('skips an optional step and drops it from tier progress', async () => {
    const { user } = renderRoute('/tier/2');
    const bar = await screen.findByRole('progressbar', { name: /Tier 2/ });
    const total = () => Number(/of (\d+)/.exec(bar.getAttribute('aria-valuetext') ?? '')?.[1]);
    const totalBefore = total();
    await user.click(screen.getByRole('button', { name: /Jump Pads \(optional\)/ }));
    await user.click(screen.getByRole('button', { name: 'Skip this optional step' }));
    // A skipped step collapses like a finished one; reopen it to undo.
    await user.click(screen.getByRole('button', { name: /Jump Pads \(optional\)/ }));
    expect(screen.getByRole('button', { name: 'Unskip this step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('– Skipped')).toBeInTheDocument();
    expect(total()).toBe(totalBefore - 1);
  });

  it('offers a skip on the NEXT strip when the next step is optional', async () => {
    useSettings.getState().setCurrentTier(2);
    const tier2 = TIER_BY_NUMBER.get(2)!;
    for (const step of tier2.steps) {
      if (step.optional) break;
      for (const task of step.tasks) useProgress.getState().toggleTask(task.id);
    }
    const { user } = renderRoute('/tier/2');
    const strip = await screen.findByRole('region', { name: 'Next task' });
    await user.click(within(strip).getByRole('button', { name: 'Skip step' }));
    expect(useProgress.getState().skipped['t2-jump-pads']).toBe(true);
  });

  it('hides finished steps when asked and remembers it', async () => {
    for (const task of TIER_BY_NUMBER.get(0)!.steps[0]!.tasks) {
      useProgress.getState().toggleTask(task.id);
    }
    const { user } = renderRoute('/tier/0');
    await user.click(await screen.findByRole('switch', { name: 'Hide completed' }));
    expect(useSettings.getState().hideCompleted).toBe(true);
    expect(screen.getByText('1 finished step hidden.')).toBeInTheDocument();
  });

  it('says which tier you are on when viewing another', async () => {
    renderRoute('/tier/3');
    const strip = await screen.findByRole('region', { name: 'Next task' });
    expect(within(strip).getByRole('link', { name: 'Tier 0' })).toBeInTheDocument();
  });

  it('expands a step to reveal its layouts and checklist', async () => {
    const { user } = renderRoute('/tier/2');
    const toggle = await screen.findByRole('button', {
      name: /Space Elevator Phase 1: 50 Smart Plating/,
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('link', { name: 'Smart Plating (Phase 1)' }).length).toBeGreaterThan(
      0,
    );
  });

  it('sets the current tier', async () => {
    const { user } = renderRoute('/tier/4');
    await user.click(await screen.findByRole('button', { name: 'Set as my current tier' }));
    expect(useSettings.getState().currentTier).toBe(4);
    expect(screen.getByText('Your current tier')).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderRoute('/tier/3');
    await screen.findByRole('heading', { level: 1, name: 'Coal Power & Steel' });
    await expectNoA11yViolations(container);
  });
});
