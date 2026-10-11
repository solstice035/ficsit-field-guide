import { Link } from 'react-router';
import { Badge, TierBadge } from '../../components/Badge.tsx';
import { SITE_BY_ID } from '../../content/index.ts';
import type { FactoryLayout } from '../../content/types.ts';
import { itemName } from '../../data/gameData.ts';
import { formatMW, formatRate } from '../../lib/plan/format.ts';
import { useLayoutPlan } from './useLayoutPlan.ts';

/** Compact layout card: what it makes, its size and power, with a link to the configurator. */
export function LayoutSummaryCard({ layout }: { layout: FactoryLayout }) {
  const { plan } = useLayoutPlan(layout);
  const site = layout.siteId ? SITE_BY_ID.get(layout.siteId) : undefined;
  const outputs = plan.generators
    ? `${plan.generators.count}× ${plan.generators.building.name} → ${formatMW(plan.generators.powerMW)}`
    : plan.outputs.map((o) => `${formatRate(o.rate, o.item)} ${itemName(o.item)}`).join(' + ');

  return (
    <article className="tile hover:bg-panel-2 flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold">
          <Link to={`/layouts/${layout.id}`}>{layout.name}</Link>
        </h4>
        <TierBadge tier={layout.tier} />
      </div>
      <p className="text-ink-muted text-sm">{layout.summary}</p>
      <p className="text-sm">
        <span className="text-ink-faint">Makes: </span>
        {outputs}
      </p>
      <dl className="text-ink-muted grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-ink-faint">Machines</dt>
          <dd className="text-ink num font-semibold">{plan.machineCount}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Power use</dt>
          <dd className="text-ink num font-semibold">{formatMW(plan.power.totalMW)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Footprint</dt>
          <dd className="text-ink num font-semibold">
            {plan.floor.foundationsWide}×{plan.floor.foundationsDeep}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-1.5">
        {site && <Badge>{site.name}</Badge>}
        {plan.imports.length > 0 && <Badge tone="info">{plan.imports.length} imported</Badge>}
        {plan.warnings.some((w) => w.level === 'warn') && <Badge tone="warn">Check warnings</Badge>}
      </div>
    </article>
  );
}
