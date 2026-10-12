import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLayouts } from '../../state/layouts.ts';
import { expectNoA11yViolations } from '../../test/axe.ts';
import { renderRoute } from '../../test/renderRoute.tsx';

const statValue = (label: string): string => {
  const term = screen.getByText(label, { selector: 'dt' });
  return term.parentElement?.querySelector('dd')?.textContent ?? '';
};

describe('layout configurator', () => {
  it('shows the plan summary for a layout', async () => {
    renderRoute('/layouts/t2-reinforced-plates');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reinforced Iron Plates' }),
    ).toBeInTheDocument();
    expect(statValue('Output')).toBe('5/min');
    expect(statValue('Machines')).toBe('8');
    expect(statValue('Extractors')).toBe('1');
  });

  it('recalculates when the target rate changes', async () => {
    const { user } = renderRoute('/layouts/t2-reinforced-plates');
    const rate = await screen.findByRole('spinbutton', { name: 'Reinforced Iron Plate' });
    await user.clear(rate);
    await user.type(rate, '10');
    expect(statValue('Output')).toBe('10/min');
    expect(Number(statValue('Machines'))).toBeGreaterThan(8);
    expect(useLayouts.getState().configs['t2-reinforced-plates']?.targetRates).toEqual({
      Desc_IronPlateReinforced_C: 10,
    });
  });

  it('uses more nodes when purity drops', async () => {
    const { user } = renderRoute('/layouts/t1-iron-works');
    await screen.findByRole('heading', { level: 1, name: 'Iron Works Mk.1' });
    expect(statValue('Extractors')).toBe('3');
    const purity = screen.getByRole('group', { name: 'Iron Ore' });
    await user.click(within(purity).getByRole('radio', { name: 'Impure' }));
    expect(statValue('Extractors')).toBe('5');
  });

  it('halves and doubles every target', async () => {
    const { user } = renderRoute('/layouts/t4-phase-2-mall');
    await user.click(await screen.findByRole('button', { name: 'Double' }));
    expect(useLayouts.getState().configs['t4-phase-2-mall']?.targetRates).toEqual({
      Desc_SpaceElevatorPart_1_C: 10,
      Desc_SpaceElevatorPart_2_C: 10,
      Desc_SpaceElevatorPart_3_C: 1,
    });
  });

  it('collapses the settings behind a disclosure on small screens', async () => {
    const { user } = renderRoute('/layouts/t2-reinforced-plates');
    const toggle = await screen.findByRole('button', { name: /Configure/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const region = document.getElementById(toggle.getAttribute('aria-controls')!);
    expect(region).toHaveClass('hidden', 'lg:block');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(region).not.toHaveClass('hidden');
  });

  it('zooms the flow diagram in steps', async () => {
    const { user } = renderRoute('/layouts/t2-reinforced-plates');
    const zoom = await screen.findByRole('group', { name: 'Diagram zoom' });
    await user.click(within(zoom).getByRole('button', { name: '100%' }));
    expect(within(zoom).getByText('100%', { selector: 'span' })).toBeInTheDocument();
    await user.click(within(zoom).getByRole('button', { name: 'Zoom in' }));
    expect(within(zoom).getByText('125%')).toBeInTheDocument();
    await user.click(within(zoom).getByRole('button', { name: 'Zoom out' }));
    await user.click(within(zoom).getByRole('button', { name: 'Zoom out' }));
    expect(within(zoom).getByText('80%')).toBeInTheDocument();
  });

  it('switches between plan views', async () => {
    const { user } = renderRoute('/layouts/t2-reinforced-plates');
    await user.click(await screen.findByRole('tab', { name: 'Build list' }));
    expect(screen.getByText('Build 1× Assembler: Reinforced Iron Plate')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Machines' }));
    expect(screen.getByRole('table', { name: 'Machines by production stage' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Floor plan' }));
    expect(screen.getByRole('img', { name: /Floor plan/ })).toBeInTheDocument();
  });

  it('imports intermediates by default and can build the full chain', async () => {
    const { user } = renderRoute('/layouts/t6-modular-engines');
    await screen.findByRole('heading', { level: 1, name: 'Modular Engines' });
    expect(screen.getByText(/Bring in from elsewhere.*Rubber 15\/min/)).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Build the full chain from ore' }));
    expect(screen.queryByText(/Bring in from elsewhere.*Rubber 15\/min/)).not.toBeInTheDocument();
  });

  it('runs a power plant layout', async () => {
    renderRoute('/layouts/t3-coal-power');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Coal Power Plant (8 : 3)' }),
    ).toBeInTheDocument();
    expect(statValue('Generates')).toBe('600 MW');
  });

  it('has no a11y violations', async () => {
    const { container } = renderRoute('/layouts/t2-smart-plating');
    await screen.findByRole('heading', { level: 1, name: 'Smart Plating (Phase 1)' });
    await expectNoA11yViolations(container);
  });

  it('lists all layouts on the index page', async () => {
    const { container } = renderRoute('/layouts');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Factory layouts' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThanOrEqual(40);
    await expectNoA11yViolations(container);
  });
});
