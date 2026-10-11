import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from './test/axe.ts';
import { renderRoute } from './test/renderRoute.tsx';

describe('app shell and dashboard', () => {
  it('renders the dashboard with primary navigation and no a11y violations', async () => {
    const { container } = renderRoute('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'From drop pod to Project Assembly' }),
    ).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const name of [
      'Dashboard',
      'Tier guide',
      'Layouts',
      'Explore',
      'Calculator',
      'Settings',
    ]) {
      expect(within(nav).getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('Land and build the HUB')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('marks the current tier and lists the steps after the next one', async () => {
    renderRoute('/');
    const current = await screen.findByRole('link', { name: /Tier 0.*Current/ });
    expect(current).toHaveAttribute('href', '/tier/0');
    expect(screen.getByText('Then')).toBeInTheDocument();
  });

  it('shows a not-found page for unknown routes', async () => {
    renderRoute('/nope');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('redirects /tier to Tier 0', async () => {
    const { router } = renderRoute('/tier');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Onboarding' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/tier/0');
  });
});
