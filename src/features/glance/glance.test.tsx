import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import { useProgress } from '../../state/progress.ts';
import { STORAGE_KEYS } from '../../state/storage.ts';
import { startCrossWindowSync } from '../../state/sync.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

afterEach(() => {
  Reflect.deleteProperty(navigator, 'wakeLock');
});

describe('glance', () => {
  it('shows the next task large, ticks it and moves on', async () => {
    const { user } = renderRoute('/glance');
    const next = await screen.findByRole('region', { name: 'Next task' });
    expect(within(next).getByRole('heading', { level: 1 })).toHaveTextContent(
      /01\s*Land and build the HUB/,
    );
    expect(within(next).getByText('Place the HUB in the HUB Basin')).toBeInTheDocument();
    await user.click(
      within(next).getByRole('switch', { name: 'Dismantle the drop pod (20 Iron Ore)' }),
    );
    expect(
      within(next).getByRole('switch', { name: 'Place the HUB in the HUB Basin' }),
    ).toBeInTheDocument();
    // No app chrome: the primary navigation is not here.
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull();
  });

  it('follows ticks made in another window', async () => {
    const stop = startCrossWindowSync();
    renderRoute('/glance');
    const next = await screen.findByRole('region', { name: 'Next task' });
    localStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({ state: { tasks: { 't0-land-pod': true } }, version: 2 }),
    );
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.progress }));
    });
    expect(
      await within(next).findByRole('switch', { name: 'Place the HUB in the HUB Basin' }),
    ).toBeInTheDocument();
    stop();
    localStorage.removeItem(STORAGE_KEYS.progress);
  });

  it('says quietly when the screen cannot be kept awake', async () => {
    renderRoute('/glance');
    expect(await screen.findByText(/can't keep the screen awake/)).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Keep screen awake' })).toBeNull();
  });

  it('holds a wake lock while asked and releases it when turned off', async () => {
    const release = vi.fn(() => Promise.resolve());
    const request = vi.fn(() => Promise.resolve({ release } as unknown as WakeLockSentinel));
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
    const { user } = renderRoute('/glance');
    const toggle = await screen.findByRole('switch', { name: 'Keep screen awake' });
    await user.click(toggle);
    expect(request).toHaveBeenCalledWith('screen');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await user.click(toggle);
    expect(release).toHaveBeenCalled();
  });

  it('offers the next tier when nothing is left', async () => {
    for (const step of TIER_BY_NUMBER.get(0)!.steps) {
      for (const task of step.tasks) useProgress.getState().toggleTask(task.id);
    }
    renderRoute('/glance');
    expect(await screen.findByRole('button', { name: 'Move to Tier 1' })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderRoute('/glance');
    await screen.findByRole('region', { name: 'Next task' });
    await expectNoA11yViolations(container);
  });
});
