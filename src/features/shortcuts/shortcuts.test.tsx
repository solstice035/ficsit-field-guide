import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProgress } from '../../state/progress.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

describe('keyboard shortcuts', () => {
  it('n ticks the NEXT task', async () => {
    const { user } = renderRoute('/tier/0');
    await screen.findByRole('region', { name: 'Next task' });
    await user.keyboard('n');
    expect(useProgress.getState().tasks['t0-land-pod']).toBe(true);
  });

  it('n does nothing while typing in a field', async () => {
    const { user } = renderRoute('/calculator');
    const field = (await screen.findAllByRole('spinbutton'))[0]!;
    await user.click(field);
    await user.keyboard('n');
    expect(useProgress.getState().tasks).toEqual({});
  });

  it('j and k move focus between steps, starting at the current one', async () => {
    const { user } = renderRoute('/tier/0');
    await screen.findByRole('region', { name: 'Steps' });
    await user.keyboard('j');
    expect(document.activeElement).toHaveAttribute('data-step-state', 'current');
    expect(document.activeElement).toHaveAccessibleName(/Land and build the HUB/);
    await user.keyboard('j');
    expect(document.activeElement).toHaveAccessibleName(/HUB Upgrade 1/);
    await user.keyboard('k');
    expect(document.activeElement).toHaveAccessibleName(/Land and build the HUB/);
  });

  it('g opens glance in its own window', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const { user } = renderRoute('/');
    await screen.findByRole('region', { name: 'Next task' });
    await user.keyboard('g');
    expect(open).toHaveBeenCalledWith('/glance', 'ficsit-glance');
  });

  it('? opens the shortcut sheet, Esc closes it, and the sheet passes axe', async () => {
    const { user, container } = renderRoute('/tier/0');
    await screen.findByRole('region', { name: 'Next task' });
    await user.keyboard('?');
    const sheet = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
    expect(sheet).toHaveTextContent('Tick the NEXT task');
    await expectNoA11yViolations(container);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('announces each shortcut on its visible control', async () => {
    renderRoute('/');
    const hero = await screen.findByRole('region', { name: 'Next task' });
    expect(hero.querySelector('[role="switch"]')).toHaveAttribute('aria-keyshortcuts', 'n');
    expect(screen.getByRole('link', { name: /Glance/ })).toHaveAttribute('aria-keyshortcuts', 'g');
    expect(screen.getByRole('button', { name: 'Keyboard shortcuts' })).toHaveAttribute(
      'aria-keyshortcuts',
      '?',
    );
  });
});
