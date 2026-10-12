import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

/** Ticks every task in a tier (optional steps included). */
function finishTier(tier: number): void {
  for (const step of TIER_BY_NUMBER.get(tier)!.steps) {
    for (const task of step.tasks) useProgress.getState().toggleTask(task.id);
  }
}

describe('dashboard', () => {
  it('ticks the next task from the hero and shows the one after it', async () => {
    const { user } = renderRoute('/');
    const hero = await screen.findByRole('region', { name: 'Next task' });
    const pod = within(hero).getByRole('switch', { name: 'Dismantle the drop pod (20 Iron Ore)' });
    expect(within(hero).getByText('Place the HUB in the HUB Basin')).toBeInTheDocument();
    await user.click(pod);
    expect(useProgress.getState().tasks['t0-land-pod']).toBe(true);
    expect(
      within(hero).getByRole('switch', { name: 'Place the HUB in the HUB Basin' }),
    ).toBeInTheDocument();
  });

  it('offers to move on when the current tier is complete, never moving by itself', async () => {
    finishTier(0);
    const { user } = renderRoute('/');
    const hero = await screen.findByRole('region', { name: 'Next task' });
    expect(within(hero).getByRole('heading', { name: 'Tier 0 complete' })).toBeInTheDocument();
    expect(
      within(hero)
        .getByText(/Up next/)
        .closest('p'),
    ).toHaveTextContent(`Up next: Tier 1 · ${TIER_BY_NUMBER.get(1)!.title}`);
    expect(useSettings.getState().currentTier).toBe(0);
    await user.click(within(hero).getByRole('button', { name: 'Move to Tier 1' }));
    expect(useSettings.getState().currentTier).toBe(1);
  });

  it('shows run complete after the last tier', async () => {
    useSettings.getState().setCurrentTier(9);
    finishTier(9);
    renderRoute('/');
    const hero = await screen.findByRole('region', { name: 'Next task' });
    expect(within(hero).getByText(/Run complete/)).toBeInTheDocument();
  });

  it('lists the run as ten tier rows with the current one marked', async () => {
    renderRoute('/');
    const run = await screen.findByRole('region', { name: 'The run' });
    expect(within(run).getAllByRole('listitem')).toHaveLength(10);
    expect(within(run).getByRole('link', { name: /Tier 0.*Onboarding.*Current/ })).toHaveAttribute(
      'href',
      '/tier/0',
    );
  });

  it('has no a11y violations mid-run', async () => {
    useSettings.getState().setCurrentTier(2);
    useProgress.getState().toggleTask('t2-log2-submit');
    const { container } = renderRoute('/');
    await screen.findByRole('region', { name: 'Next task' });
    await expectNoA11yViolations(container);
  });
});
