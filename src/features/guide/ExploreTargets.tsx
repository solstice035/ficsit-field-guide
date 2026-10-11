import { Link } from 'react-router';
import { PurityBadge, TierBadge } from '../../components/Badge.tsx';
import type { ExploreTarget } from '../../content/types.ts';
import { itemName } from '../../data/gameData.ts';
import { formatDistance } from '../../lib/geo/geo.ts';
import { useExplore } from '../../state/explore.ts';
import { useSettings } from '../../state/settings.ts';
import {
  COLLECTIBLE_META,
  driveTier,
  effectivePurity,
  nearestCollectibles,
  nearestNodes,
} from '../explore/nearby.ts';

/** "Nearest N" lists for a step's exploration goals. */
export function ExploreTargets({ targets }: { targets: readonly ExploreTarget[] }) {
  const base = useSettings((s) => s.base);
  const collected = useExplore((s) => s.collected);
  const purityOverrides = useSettings((s) => s.purityOverrides);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {targets.map((target) => {
        const count = target.count ?? 3;
        if (target.kind === 'resource') {
          const resource = target.resource ?? '';
          const nodes = nearestNodes(resource, base, Math.min(count, 6));
          return (
            <div key={`${target.kind}-${resource}`} className="tile p-3">
              <h5 className="text-sm font-semibold">{target.note}</h5>
              <ol className="mt-2 space-y-1 text-sm">
                {nodes.map(({ item, distance, compass }) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span>
                      {itemName(resource)}{' '}
                      <PurityBadge purity={effectivePurity(item, purityOverrides)} />
                    </span>
                    <span className="text-ink-muted num">
                      {formatDistance(distance)} {compass}
                    </span>
                  </li>
                ))}
              </ol>
              <Link to={`/explore?resource=${resource}`} className="mt-2 inline-block text-sm">
                Show on map
              </Link>
            </div>
          );
        }
        const meta = COLLECTIBLE_META[target.kind];
        const list = nearestCollectibles(target.kind, base, Math.min(count, 6), collected);
        return (
          <div key={target.kind} className="tile p-3">
            <h5 className="text-sm font-semibold">
              <span
                aria-hidden="true"
                className="mr-1.5 inline-block size-2.5 rounded-full"
                style={{ background: meta.colour }}
              />
              {target.note}
            </h5>
            {list.length === 0 ? (
              <p className="text-ink-muted mt-2 text-sm">All collected nearby.</p>
            ) : (
              <ol className="mt-2 space-y-1 text-sm">
                {list.map(({ item, distance, compass }) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="text-ink-muted">
                      {meta.label}
                      {item.type === 'hardDrive' && (
                        <>
                          {' '}
                          <TierBadge tier={driveTier(item)} />
                        </>
                      )}
                    </span>
                    <span className="num">
                      {formatDistance(distance)} {compass}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <Link to={`/explore?type=${target.kind}`} className="mt-2 inline-block text-sm">
              Open in Explore
            </Link>
          </div>
        );
      })}
    </div>
  );
}
