import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useExplore } from '../../state/explore.ts';
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
