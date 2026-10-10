import { useMemo } from 'react';
import { NumberField, SelectField } from '../../components/Fields.tsx';
import { Panel } from '../../components/Panel.tsx';
import type { FactoryLayout } from '../../content/types.ts';
import { itemTier } from '../../data/availability.ts';
import { ITEMS, RECIPES_PRODUCING } from '../../data/gameData.ts';
import { useLayouts } from '../../state/layouts.ts';
import { LayoutConfigurator } from '../layouts/LayoutConfigurator.tsx';

export const CALCULATOR_ID = 'calculator';

/** Items you can plan for: anything with a machine recipe or a raw resource, available in-game. */
const PLANNABLE = ITEMS.filter(
  (i) => (RECIPES_PRODUCING.has(i.id) || i.isResource) && Number.isFinite(itemTier(i.id)),
).sort((a, b) => a.name.localeCompare(b.name));

export function CalculatorPage() {
  const calculator = useLayouts((s) => s.calculator);
  const setCalculator = useLayouts((s) => s.setCalculator);

  const layout = useMemo<FactoryLayout>(
    () => ({
      id: CALCULATOR_ID,
      name: 'Calculator',
      tier: calculator.tier,
      summary: 'Free-form production plan.',
      targets: calculator.targets,
      tips: [],
    }),
    [calculator],
  );

  const setTarget = (index: number, patch: Partial<{ item: string; rate: number }>) =>
    setCalculator({
      ...calculator,
      targets: calculator.targets.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl">Production calculator</h1>
        <p className="text-ink-muted max-w-3xl">
          Plan anything: pick products and rates, then tune recipes, miners, belts, purity and
          clocks exactly like a layout. Tier sets the default miners and belts.
        </p>
      </header>

      <Panel title="Targets" level={2}>
        <div className="space-y-3">
          {calculator.targets.map((t, i) => (
            <div
              key={`${t.item}-${i}`}
              className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
            >
              <SelectField
                label={`Product ${i + 1}`}
                value={t.item}
                onChange={(item) => setTarget(i, { item })}
                options={PLANNABLE.map((item) => ({
                  value: item.id,
                  label: `${item.name} (T${itemTier(item.id)})`,
                }))}
              />
              <NumberField
                label="Rate"
                value={t.rate}
                min={0.01}
                max={100000}
                step={0.5}
                suffix="/min"
                onChange={(rate) => setTarget(i, { rate })}
              />
              <button
                type="button"
                disabled={calculator.targets.length === 1}
                onClick={() =>
                  setCalculator({
                    ...calculator,
                    targets: calculator.targets.filter((_, j) => j !== i),
                  })
                }
                className="border-line-strong hover:border-danger rounded border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Remove<span className="sr-only">{` product ${i + 1}`}</span>
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={() =>
                setCalculator({
                  ...calculator,
                  targets: [...calculator.targets, { item: 'Desc_IronPlate_C', rate: 30 }],
                })
              }
              className="border-line-strong hover:border-accent rounded border px-3 py-1.5 text-sm"
            >
              Add product
            </button>
            <SelectField
              label="Plan for tier"
              value={String(calculator.tier)}
              onChange={(v) => setCalculator({ ...calculator, tier: Number(v) })}
              options={Array.from({ length: 10 }, (_, t) => ({
                value: String(t),
                label: `Tier ${t}`,
              }))}
              className="w-40"
            />
          </div>
        </div>
      </Panel>

      <LayoutConfigurator key={`${calculator.tier}`} layout={layout} headless />
    </div>
  );
}
