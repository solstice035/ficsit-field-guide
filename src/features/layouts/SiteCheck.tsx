import { Link } from 'react-router';
import { Badge, PurityBadge } from '../../components/Badge.tsx';
import { SITE_BY_ID } from '../../content/index.ts';
import type { FactoryLayout } from '../../content/types.ts';
import { NODE_BY_ID, itemName } from '../../data/gameData.ts';
import { PURITIES } from '../../data/types.ts';
import { formatDistance } from '../../lib/geo/geo.ts';
import type { FactoryPlan } from '../../lib/plan/factoryPlan.ts';
import { layoutSiteIds, siteResources } from '../../lib/plan/layoutConfig.ts';
import { useSettings } from '../../state/settings.ts';
import { locate } from '../explore/nearby.ts';

const RANK = { impure: 0, normal: 1, pure: 2 } as const;

/** Compares the nodes this plan needs with what the layout's sites actually have. */
export function SiteCheck({ layout, plan }: { layout: FactoryLayout; plan: FactoryPlan }) {
  const base = useSettings((s) => s.base);
  const overrides = useSettings((s) => s.purityOverrides);
  const siteIds = layoutSiteIds(layout);
  const resources = siteResources(siteIds, overrides);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table>
          <caption className="text-ink-muted mb-2 text-left text-sm">
            Nodes needed vs nodes available at{' '}
            {siteIds.map((id) => SITE_BY_ID.get(id)?.name).join(', ') || 'no site'}
          </caption>
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th scope="col">Plan needs</th>
              <th scope="col">Sites have</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {plan.extraction.map((e) => {
              const isWater = e.building.id === 'Build_WaterPump_C';
              const site = resources.get(e.item);
              const usable = site
                ? PURITIES.filter((p) => RANK[p] >= RANK[e.purity]).reduce(
                    (n, p) => n + site.byPurity[p],
                    0,
                  )
                : 0;
              const ok = isWater || usable >= e.plan.nodes;
              return (
                <tr key={e.key} className="border-line border-t">
                  <td className="py-2 pr-3 font-medium">{itemName(e.item)}</td>
                  <td className="pr-3">
                    {isWater ? (
                      `${e.plan.nodes} Water Extractors`
                    ) : (
                      <>
                        {e.plan.nodes}× <PurityBadge purity={e.purity} />
                      </>
                    )}
                  </td>
                  <td className="pr-3 text-sm">
                    {isWater
                      ? 'Any open water'
                      : site
                        ? PURITIES.filter((p) => site.byPurity[p])
                            .map((p) => `${site.byPurity[p]} ${p}`)
                            .join(', ')
                        : 'None listed'}
                  </td>
                  <td>
                    {ok ? (
                      <Badge tone="ok">OK</Badge>
                    ) : (
                      <Badge tone="warn">Bring from elsewhere</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {siteIds.map((siteId) => {
        const site = SITE_BY_ID.get(siteId);
        if (!site) return null;
        const where = locate(site.centre, base);
        return (
          <section key={siteId} aria-labelledby={`site-${siteId}`} className="space-y-2">
            <h3 id={`site-${siteId}`} className="text-base">
              <Link to={`/explore?site=${siteId}`}>{site.name}</Link>{' '}
              <span className="text-ink-muted num text-sm font-normal">
                {formatDistance(where.distance)} {where.compass} of your base
              </span>
            </h3>
            <p className="text-ink-muted text-sm">{site.role}</p>
            <ul className="text-ink-muted list-disc space-y-1 pl-5 text-sm">
              {site.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-1.5">
              {site.nodeIds.map((nodeId) => {
                const node = NODE_BY_ID.get(nodeId);
                if (!node || node.type === 'well-core') return null;
                const purity = overrides[nodeId] ?? node.purity;
                return (
                  <li
                    key={nodeId}
                    className="bg-panel-2 border-line flex items-center gap-1.5 rounded border px-2 py-1 text-xs"
                  >
                    {node.resource === 'geothermal' ? 'Geyser' : itemName(node.resource)}{' '}
                    <PurityBadge purity={purity} />
                    <span className="text-ink-faint num">z {Math.round(node.z)} m</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
