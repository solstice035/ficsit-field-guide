import { useId, useState } from 'react';
import { Badge, TierBadge } from '../../components/Badge.tsx';
import { cx } from '../../components/cx.ts';
import { Panel } from '../../components/Panel.tsx';
import { Tabs } from '../../components/Tabs.tsx';
import { SITE_BY_ID } from '../../content/index.ts';
import type { FactoryLayout } from '../../content/types.ts';
import { itemName } from '../../data/gameData.ts';
import { formatMW, formatRate } from '../../lib/plan/format.ts';
import { useSettings } from '../../state/settings.ts';
import { ConfigPanel } from './ConfigPanel.tsx';
import { FloorPlanView } from './FloorPlanView.tsx';
import { FlowDiagram } from './FlowDiagram.tsx';
import { BomTable, ChecklistView, InputsTables, MachinesTable } from './PlanTables.tsx';
import { SiteCheck } from './SiteCheck.tsx';
import { useLayoutPlan } from './useLayoutPlan.ts';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="tile px-3 py-2">
      <dt className="text-ink-faint text-xs">{label}</dt>
      <dd className="num text-lg font-semibold">{value}</dd>
      {sub && <dd className="text-ink-faint text-xs">{sub}</dd>}
    </div>
  );
}

export interface LayoutConfiguratorProps {
  layout: FactoryLayout;
  /** Hide the heading block (used by the Calculator, which has its own). */
  headless?: boolean;
}

/** Full configurator: controls + summary + flow, floor plan, tables and build list. */
export function LayoutConfigurator({ layout, headless }: LayoutConfiguratorProps) {
  const { user, config, plan } = useLayoutPlan(layout);
  const currentTier = useSettings((s) => s.currentTier);
  const site = layout.siteId ? SITE_BY_ID.get(layout.siteId) : undefined;
  const warnings = plan.warnings.filter((w) => w.level === 'warn');
  const infos = plan.warnings.filter((w) => w.level === 'info');
  const [configOpen, setConfigOpen] = useState(false);
  const configId = useId();

  return (
    <div className="space-y-5">
      {!headless && (
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={layout.tier} prefix="Tier " />
            {site && <Badge>{site.name}</Badge>}
            {plan.generators && <Badge tone="warn">Power plant</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl">{layout.name}</h1>
          <p className="text-ink-muted max-w-3xl">{layout.summary}</p>
        </header>
      )}

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat
          label={plan.generators ? 'Generates' : 'Output'}
          value={
            plan.generators
              ? formatMW(plan.generators.powerMW)
              : plan.outputs.length === 1
                ? formatRate(plan.outputs[0]!.rate, plan.outputs[0]!.item)
                : `${plan.outputs.length} products`
          }
          sub={
            plan.generators
              ? `${plan.generators.count}× ${plan.generators.building.name}`
              : plan.outputs.map((o) => itemName(o.item)).join(', ')
          }
        />
        <Stat
          label="Power use"
          value={formatMW(plan.power.totalMW)}
          sub={`machines ${formatMW(plan.power.productionMW)}`}
        />
        <Stat
          label="Machines"
          value={String(plan.machineCount)}
          sub={`${plan.groups.length} groups`}
        />
        <Stat
          label="Extractors"
          value={String(plan.extraction.reduce((n, e) => n + e.plan.nodes, 0))}
          sub={plan.extraction.map((e) => itemName(e.item)).join(', ') || 'none'}
        />
        <Stat
          label="Footprint"
          value={`${plan.floor.foundationsWide}×${plan.floor.foundationsDeep}`}
          sub="foundations (8 m)"
        />
        <Stat
          label="Shards / sloops"
          value={`${plan.shardCount} / ${plan.sloopCount}`}
          sub="Power Shards / Somersloops"
        />
      </dl>

      {(warnings.length > 0 || infos.length > 0) && (
        <div role="status" aria-live="polite" className="space-y-1">
          {warnings.map((w) => (
            <p
              key={w.message}
              className="border-warn/40 text-warn rounded border px-3 py-2 text-sm"
            >
              ⚠ {w.message}
            </p>
          ))}
          {infos.map((w) => (
            <p
              key={w.message}
              className="border-line text-ink-muted rounded border px-3 py-2 text-sm"
            >
              {w.message}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside
          aria-label="Layout settings"
          className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto"
        >
          {/* Below lg the settings collapse so the plan is not pushed a screen down. */}
          <button
            type="button"
            aria-expanded={configOpen}
            aria-controls={configId}
            onClick={() => setConfigOpen((o) => !o)}
            className="panel hover:border-line-strong flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-semibold lg:hidden"
          >
            <span>Configure</span>
            <span className="text-ink-muted text-sm font-normal">
              {configOpen ? 'Hide settings' : 'Show settings'}{' '}
              <span aria-hidden="true">{configOpen ? '▲' : '▼'}</span>
            </span>
          </button>
          <div
            id={configId}
            className={cx(configOpen ? 'mt-2 block' : 'hidden', 'lg:mt-0 lg:block')}
          >
            <Panel title="Configure" level={2} variant="card">
              <ConfigPanel layout={layout} user={user} config={config} plan={plan} />
            </Panel>
          </div>
        </aside>

        <Panel title="Plan" level={2} className="min-w-0">
          <Tabs
            label="Plan views"
            tabs={[
              { id: 'flow', label: 'Flow', content: <FlowDiagram plan={plan} /> },
              { id: 'floor', label: 'Floor plan', content: <FloorPlanView floor={plan.floor} /> },
              { id: 'machines', label: 'Machines', content: <MachinesTable plan={plan} /> },
              { id: 'inputs', label: 'Inputs & belts', content: <InputsTables plan={plan} /> },
              {
                id: 'build',
                label: 'Build list',
                content: <ChecklistView plan={plan} layoutId={layout.id} />,
              },
              {
                id: 'bom',
                label: 'Materials',
                content: <BomTable plan={plan} currentTier={currentTier} />,
              },
              {
                id: 'site',
                label: 'Site check',
                content: <SiteCheck layout={layout} plan={plan} />,
              },
            ]}
          />
          {layout.tips.length > 0 && (
            <div className="border-line mt-5 border-t pt-4">
              <h3 className="mb-2 text-base">Tips</h3>
              <ul className="text-ink-muted list-disc space-y-1 pl-5 text-sm">
                {layout.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
