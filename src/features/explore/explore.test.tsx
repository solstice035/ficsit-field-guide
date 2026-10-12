import { act, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NODES } from '../../data/gameData.ts';
import { DEFAULT_FILTERS, useExplore } from '../../state/explore.ts';
import { useSettings } from '../../state/settings.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

describe('exploration', () => {
  it('tracks collected items and hides them from the nearest list', async () => {
    const { user } = renderRoute('/explore');
    await screen.findByRole('heading', { level: 1, name: 'Exploration' });
    const progress = screen.getByRole('progressbar', { name: 'Mercer Spheres collected' });
    expect(progress).toHaveAttribute('aria-valuetext', '0 of 298 (0%)');

    const first = screen.getByRole('checkbox', { name: 'Collected Mercer Sphere 1' });
    await user.click(first);
    expect(Object.keys(useExplore.getState().collected)).toHaveLength(1);
    expect(progress).toHaveAttribute('aria-valuetext', '1 of 298 (0%)');
    // Hidden from the list once collected (hide collected is on by default).
    expect(screen.getByRole('checkbox', { name: 'Collected Mercer Sphere 1' })).not.toBeChecked();
  });

  it('opens the crash-site list from a deep link with unlock costs', async () => {
    renderRoute('/explore?type=hardDrive');
    const tab = await screen.findByRole('tab', { name: 'Hard Drives (crash sites)' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    const table = screen.getByRole('table', { name: 'Nearest Hard Drives (crash sites)' });
    expect(within(table).getByRole('columnheader', { name: 'To open' })).toBeInTheDocument();
  });

  it('treats deep-linked filters as starting values the user can change', async () => {
    const { user, router } = renderRoute('/explore?resource=Desc_OreIron_C&type=slugBlue');
    const select = await screen.findByRole('combobox', { name: 'Resource nodes' });
    expect(select).toHaveValue('Desc_OreIron_C');
    await user.selectOptions(select, 'Desc_Coal_C');
    expect(select).toHaveValue('Desc_Coal_C');

    const slugs = screen.getByRole('checkbox', { name: /Blue Power Slugs/ });
    expect(slugs).toBeChecked();
    await user.click(slugs);
    expect(slugs).not.toBeChecked();
    expect(router.state.location.search).toBe('');
  });

  it('applies purity overrides to the map filter', async () => {
    const markers = () =>
      Number(
        /Map showing (\d+) markers/.exec(
          screen.getByRole('img', { name: /Map showing/ }).textContent ?? '',
        )?.[1],
      );
    useExplore.getState().setFilters({
      types: { ...DEFAULT_FILTERS.types, mercerSphere: false, somersloop: false, hardDrive: false },
      resource: 'Desc_OreIron_C',
      purities: { impure: false, normal: true, pure: true },
    });
    const node = NODES.find((n) => n.resource === 'Desc_OreIron_C' && n.purity === 'normal')!;
    renderRoute('/explore');
    await screen.findByRole('heading', { level: 1, name: 'Exploration' });
    const before = markers();
    act(() => useSettings.getState().setPurityOverride(node.id, 'impure'));
    expect(markers()).toBe(before - 1);
  });

  it('applies the crash-site tier filter to the nearest list', async () => {
    useExplore.getState().setFilters({ drivesUpToTier: 0 });
    renderRoute('/explore?type=hardDrive');
    const table = await screen.findByRole('table', { name: 'Nearest Hard Drives (crash sites)' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(within(row).queryAllByTitle(/Available from Tier [1-9]/)).toEqual([]);
    }
  });

  it('sets the base by clicking the map', async () => {
    const { user } = renderRoute('/explore');
    const button = await screen.findByRole('button', { name: 'Set base on the map' });
    await user.click(button);
    expect(screen.getByRole('button', { name: 'Click the map to set your base…' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('has no a11y violations', async () => {
    const { container } = renderRoute('/explore');
    await screen.findByRole('heading', { level: 1, name: 'Exploration' });
    await expectNoA11yViolations(container);
  });
});
