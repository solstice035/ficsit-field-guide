import { Link } from 'react-router';
import { SITE_BY_ID } from '../../content/index.ts';
import { formatDistance } from '../../lib/geo/geo.ts';
import { useSettings } from '../../state/settings.ts';
import { locate } from '../explore/nearby.ts';

/** Site links with distance and compass bearing from your base. */
export function SiteChips({ ids }: { ids: readonly string[] }) {
  const base = useSettings((s) => s.base);
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {ids.map((id) => {
        const site = SITE_BY_ID.get(id);
        if (!site) return null;
        const where = locate(site.centre, base);
        return (
          <li key={id} className="border-line bg-panel-2 rounded-md border p-3">
            <div className="flex items-baseline justify-between gap-2">
              <Link to={`/explore?site=${id}`} className="font-semibold">
                {site.name}
              </Link>
              <span className="text-ink-muted num text-xs">
                {formatDistance(where.distance)} {where.compass}
              </span>
            </div>
            <p className="text-ink-muted mt-1 text-sm">{site.role}</p>
          </li>
        );
      })}
    </ul>
  );
}
