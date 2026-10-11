import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

  it('persists ticked tasks and milestones', async () => {
    const { user } = renderRoute('/tier/0');
    const task = await screen.findByRole('checkbox', { name: 'Place the HUB in the HUB Basin' });
    await user.click(task);
    expect(task).toBeChecked();
    expect(useProgress.getState().tasks['t0-land-hub']).toBe(true);
    expect(screen.getAllByText('1/3 tasks').length).toBeGreaterThan(0);

    const milestones = screen.getByRole('region', { name: 'HUB Upgrades' });
    await user.click(within(milestones).getByRole('checkbox', { name: 'HUB Upgrade 1' }));
    expect(useProgress.getState().milestones['Schematic_Tutorial1_C']).toBe(true);
  });

  it('ticks a milestone and its Submit task together, counting it once', async () => {
    const { user } = renderRoute('/tier/1');
    const toggle = await screen.findByRole('button', { name: /Base Building/ });
    await user.click(toggle);
    const task = screen.getByRole('checkbox', { name: 'Submit Base Building' });
    await user.click(task);
    expect(useProgress.getState().milestones['Schematic_1-1_C']).toBe(true);
    expect(useProgress.getState().tasks['t1-bb-submit']).toBeUndefined();

    const milestones = screen.getByRole('region', { name: /Milestones|HUB/ });
    const card = within(milestones).getByRole('checkbox', { name: 'Base Building' });
    expect(card).toBeChecked();
    await user.click(card);
    expect(task).not.toBeChecked();
  });

  it('skips an optional step and drops it from tier progress', async () => {
    const { user } = renderRoute('/tier/2');
    const bar = await screen.findByRole('progressbar', { name: /Tier 2/ });
    const total = () => Number(/of (\d+)/.exec(bar.getAttribute('aria-valuetext') ?? '')?.[1]);
    const totalBefore = total();
    await user.click(screen.getByRole('button', { name: /Jump Pads \(optional\)/ }));
    await user.click(screen.getByRole('button', { name: 'Skip this optional step' }));
    expect(screen.getByRole('button', { name: 'Unskip this step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Skipped')).toBeInTheDocument();
    expect(total()).toBe(totalBefore - 1);
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
