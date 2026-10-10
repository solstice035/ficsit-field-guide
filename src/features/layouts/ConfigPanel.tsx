import { Disclosure } from '../../components/Disclosure.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import {
  NumberField,
  Segmented,
  SelectField,
  type SelectOption,
} from '../../components/Fields.tsx';
import type { FactoryLayout } from '../../content/types.ts';
import { buildingTier, recipeTier } from '../../data/availability.ts';
import {
  BUILDING_BY_ID,
  RECIPE_UNLOCKED_BY,
  SCHEMATIC_BY_ID,
  itemName,
} from '../../data/gameData.ts';
import { recipeOptionsFor } from '../../data/recipeDefaults.ts';
import { PURITIES, type Purity, type Recipe } from '../../data/types.ts';
import { BELT_TIERS, PIPE_TIERS } from '../../lib/calc/conveyance.ts';
import type { FactoryPlan, MinerMk, PlanConfig } from '../../lib/plan/factoryPlan.ts';
import {
  type LayoutUserConfig,
  layoutSiteIds,
  siteResources,
} from '../../lib/plan/layoutConfig.ts';
import { useLayouts } from '../../state/layouts.ts';
import { useSettings } from '../../state/settings.ts';

const DEFAULT = '__default';
const IMPORT = '__import';

function unlockLabel(recipe: Recipe): string {
  if (!recipe.alternate) {
    const tier = recipeTier(recipe.id);
    return Number.isFinite(tier) ? `T${tier}` : '';
  }
  const source = (RECIPE_UNLOCKED_BY.get(recipe.id) ?? [])
    .map((id) => SCHEMATIC_BY_ID.get(id))
    .find(Boolean);
  if (source?.type === 'mam') return `MAM: ${source.name}`;
  return 'Hard Drive';
}

function recipeLabel(recipe: Recipe): string {
  const building = BUILDING_BY_ID.get(recipe.producedIn[0] ?? '')?.name ?? '';
  return `${recipe.alternate ? 'Alt: ' : ''}${recipe.name} · ${building} · ${unlockLabel(recipe)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-line space-y-3 border-t pt-3 first:border-t-0 first:pt-0">
      <legend className="text-ink-faint float-left mb-1 w-full text-xs font-semibold tracking-wide uppercase">
        {title}
      </legend>
      <div className="clear-both space-y-3">{children}</div>
    </fieldset>
  );
}

export interface ConfigPanelProps {
  layout: FactoryLayout;
  user: LayoutUserConfig;
  config: PlanConfig;
  plan: FactoryPlan;
}

/** All the knobs for a layout. Every change is persisted per layout. */
export function ConfigPanel({ layout, user, config, plan }: ConfigPanelProps) {
  const update = useLayouts((s) => s.update);
  const setEntry = useLayouts((s) => s.setEntry);
  const resetLayout = useLayouts((s) => s.resetLayout);
  const purityOverrides = useSettings((s) => s.purityOverrides);
  const id = layout.id;
  const atSites = siteResources(layoutSiteIds(layout), purityOverrides);

  const scaleTargets = (factor: number) => {
    const rates: Record<string, number> = {};
    for (const t of layout.targets)
      rates[t.item] = Math.max(0.01, (user.targetRates?.[t.item] ?? t.rate) * factor);
    update(id, { targetRates: rates });
  };

  // Items whose recipe can be chosen: produced here (primary product) or imported.
  const choosable = [
    ...new Set([
      ...plan.groups.map((g) => g.recipe.products[0]?.item ?? ''),
      ...plan.imports.map((i) => i.item),
    ]),
  ].filter((item) => item && recipeOptionsFor(item).length > 0);

  const tierHint = (mk: number, ids: readonly { mk: number; buildingId: string }[]) => {
    const tier = buildingTier(ids.find((t) => t.mk === mk)?.buildingId ?? '');
    return Number.isFinite(tier) ? `Unlocked in Tier ${tier}` : undefined;
  };

  return (
    <div className="space-y-4">
      <Section title={layout.generators ? 'Power plant' : 'Targets'}>
        {layout.generators ? (
          <NumberField
            label={`${BUILDING_BY_ID.get(layout.generators.buildingId)?.name ?? 'Generators'} (count)`}
            value={user.generatorCount ?? layout.generators.count}
            min={1}
            max={500}
            onChange={(v) => update(id, { generatorCount: Math.round(v) })}
          />
        ) : (
          <>
            {layout.targets.map((t) => (
              <NumberField
                key={t.item}
                label={itemName(t.item)}
                value={user.targetRates?.[t.item] ?? t.rate}
                min={0.01}
                max={100000}
                step={0.5}
                suffix="/min"
                onChange={(v) => setEntry(id, 'targetRates', t.item, v)}
              />
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scaleTargets(0.5)}
                className="border-line-strong hover:border-accent rounded border px-2 py-1 text-xs"
              >
                Halve
              </button>
              <button
                type="button"
                onClick={() => scaleTargets(2)}
                className="border-line-strong hover:border-accent rounded border px-2 py-1 text-xs"
              >
                Double
              </button>
            </div>
          </>
        )}
        {layout.imports?.length ? (
          <Checkbox
            checked={!!user.fullChain}
            onChange={(v) => update(id, { fullChain: v })}
            label="Build the full chain from ore"
            description={`By default this layout imports ${layout.imports.map(itemName).join(', ')} from their own layouts.`}
          />
        ) : null}
      </Section>

      <Section title="Equipment">
        <Segmented<MinerMk>
          legend="Miner"
          value={config.minerMk}
          onChange={(v) => update(id, { minerMk: v })}
          options={([1, 2, 3] as const).map((mk) => {
            const tier = buildingTier(`Build_MinerMk${mk}_C`);
            return { value: mk, label: `Mk.${mk}`, title: `Unlocked in Tier ${tier}` };
          })}
        />
        <Segmented
          legend="Fastest belt"
          value={config.maxBeltMk}
          onChange={(v) => update(id, { maxBeltMk: v })}
          options={BELT_TIERS.map((t) => ({
            value: t.mk,
            label: `Mk.${t.mk}`,
            title: `${t.rate}/min · ${tierHint(t.mk, BELT_TIERS) ?? ''}`,
          }))}
          hint={`Mk.${config.maxBeltMk} carries ${BELT_TIERS[config.maxBeltMk - 1]?.rate}/min`}
        />
        <Segmented
          legend="Fastest pipe"
          value={config.maxPipeMk}
          onChange={(v) => update(id, { maxPipeMk: v })}
          options={PIPE_TIERS.map((t) => ({
            value: t.mk,
            label: `Mk.${t.mk}`,
            title: `${t.rate} m³/min · ${tierHint(t.mk, PIPE_TIERS) ?? ''}`,
          }))}
        />
      </Section>

      <Section title="Clocks">
        <NumberField
          label="Preferred extractor clock"
          value={Math.round(config.extractorClock * 100)}
          min={1}
          max={250}
          suffix="%"
          hint="Higher clocks use fewer nodes. Above 100% needs Power Shards."
          onChange={(v) => update(id, { extractorClock: v / 100 })}
        />
        <NumberField
          label="Machine clock ceiling"
          value={Math.round(config.maxClock * 100)}
          min={1}
          max={250}
          suffix="%"
          hint="100% = no shards. 250% = fewest machines (3 shards each)."
          onChange={(v) => update(id, { maxClock: v / 100 })}
        />
        <Segmented
          legend="Split fractional machines"
          value={config.clockStrategy}
          onChange={(v) => update(id, { clockStrategy: v })}
          options={[
            {
              value: 'even',
              label: 'Evenly',
              title: 'All machines at the same clock (least power)',
            },
            {
              value: 'fill',
              label: 'Fill + 1',
              title: 'All at the ceiling, one running the remainder',
            },
          ]}
        />
      </Section>

      {plan.extraction.some((e) => e.building.id !== 'Build_WaterPump_C') && (
        <Section title="Node purity">
          {plan.extraction
            .filter((e) => e.building.id !== 'Build_WaterPump_C')
            .map((e) => {
              const site = atSites.get(e.item);
              const available = site
                ? PURITIES.filter((p) => site.byPurity[p] > 0)
                    .map((p) => `${site.byPurity[p]} ${p}`)
                    .join(', ')
                : 'none at this layout’s sites';
              return (
                <div key={e.item} className="space-y-2">
                  <Segmented<Purity>
                    legend={itemName(e.item)}
                    value={config.resources[e.item]?.purity ?? 'normal'}
                    onChange={(v) => setEntry(id, 'purity', e.item, v)}
                    options={PURITIES.map((p) => ({
                      value: p,
                      label: p[0]!.toUpperCase() + p.slice(1),
                    }))}
                    hint={`Sites: ${available}`}
                  />
                  <NumberField
                    label={`Limit ${itemName(e.item)} nodes (0 = as many as needed)`}
                    value={user.nodes?.[e.item] ?? 0}
                    min={0}
                    max={50}
                    onChange={(v) =>
                      setEntry(id, 'nodes', e.item, v > 0 ? Math.round(v) : undefined)
                    }
                  />
                </div>
              );
            })}
        </Section>
      )}

      {choosable.length > 0 && (
        <Section title="Recipes">
          {choosable.map((item) => {
            const options = recipeOptionsFor(item);
            const effective = config.recipeOverrides[item];
            const value = effective === undefined ? DEFAULT : effective === '' ? IMPORT : effective;
            const selectOptions: SelectOption[] = [
              { value: DEFAULT, label: 'Default recipe' },
              { value: IMPORT, label: 'Import from elsewhere' },
              ...options.map((r) => ({ value: r.id, label: recipeLabel(r) })),
            ];
            return (
              <SelectField
                key={item}
                label={itemName(item)}
                value={value}
                options={selectOptions}
                onChange={(v) =>
                  setEntry(
                    id,
                    'recipeOverrides',
                    item,
                    v === DEFAULT ? undefined : v === IMPORT ? '' : v,
                  )
                }
              />
            );
          })}
        </Section>
      )}

      {plan.groups.some((g) => g.building.sloopSlots > 0) && (
        <Disclosure summary={<span className="text-sm font-medium">Somersloops (advanced)</span>}>
          <div className="mt-3 space-y-3">
            {plan.groups
              .filter((g) => g.building.sloopSlots > 0)
              .map((g) => (
                <Segmented
                  key={g.key}
                  legend={`${g.recipe.name} (${g.building.name})`}
                  value={user.sloops?.[g.key] ?? 0}
                  onChange={(v) => setEntry(id, 'sloops', g.key, v || undefined)}
                  options={Array.from({ length: g.building.sloopSlots + 1 }, (_, n) => ({
                    value: n,
                    label: String(n),
                  }))}
                />
              ))}
          </div>
        </Disclosure>
      )}

      <button
        type="button"
        onClick={() => resetLayout(id)}
        className="border-line-strong text-ink-muted hover:text-ink hover:border-danger w-full rounded border px-3 py-1.5 text-sm"
      >
        Reset this layout to defaults
      </button>
    </div>
  );
}
