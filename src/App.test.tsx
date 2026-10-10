import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';
import { expectNoA11yViolations } from './test/axe.ts';

describe('App', () => {
  it('renders the title without a11y violations', async () => {
    const { container } = render(<App />);
    expect(screen.getByRole('heading', { name: 'FICSIT Field Guide' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
