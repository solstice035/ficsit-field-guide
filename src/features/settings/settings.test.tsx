import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLayouts } from '../../state/layouts.ts';
import { useSettings } from '../../state/settings.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

describe('settings', () => {
  it('overrides a node purity', async () => {
    const { user } = renderRoute('/settings');
    const select = await screen.findByRole('combobox', { name: 'Iron Ore purity at -1525, -458' });
    await user.selectOptions(select, 'normal');
    expect(useSettings.getState().purityOverrides).toEqual({ BP_ResourceNode114: 'normal' });
  });

  it('reports an invalid backup file without changing state', async () => {
    renderRoute('/settings');
    const input = await screen.findByLabelText('Backup file');
    const file = new File(['{"app":"something-else"}'], 'bad.json', { type: 'application/json' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(
      await screen.findByText('This file is not a FICSIT Field Guide backup.'),
    ).toBeInTheDocument();
  });

  it('needs two clicks to reset everything', async () => {
    useSettings.getState().setCurrentTier(5);
    const { user } = renderRoute('/settings');
    const reset = await screen.findByRole('button', { name: 'Reset everything' });
    await user.click(reset);
    expect(useSettings.getState().currentTier).toBe(5);
    await user.click(screen.getByRole('button', { name: 'Click again to erase everything' }));
    expect(useSettings.getState().currentTier).toBe(0);
  });

  it('has no a11y violations', async () => {
    const { container } = renderRoute('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    await expectNoA11yViolations(container);
  });
});

describe('calculator', () => {
  it('plans a free-form target and adds products', async () => {
    const { user, container } = renderRoute('/calculator');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Production calculator' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add product' }));
    expect(useLayouts.getState().calculator.targets).toHaveLength(2);
    await expectNoA11yViolations(container);
  });
});
