import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProgress } from '../state/progress.ts';
import { expectNoA11yViolations } from '../test/axe.ts';
import { renderRoute } from '../test/renderRoute.tsx';

describe('storage failure notice', () => {
  it('warns, without throwing, when a save hits a full store', async () => {
    const { container } = renderRoute('/');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText(/isn.t saving your progress/)).toBeNull();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => act(() => useProgress.getState().toggleTask('t'))).not.toThrow();
    expect(useProgress.getState().tasks).toEqual({ t: true });
    expect(await screen.findByText(/isn.t saving your progress/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Export a backup' })).toHaveAttribute(
      'href',
      '/settings',
    );
    await expectNoA11yViolations(container);
  });
});
