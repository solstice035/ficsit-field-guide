import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Badge, PurityBadge, TierBadge } from '../../components/Badge.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import { SelectField } from '../../components/Fields.tsx';
import { ItemAmounts } from '../../components/ItemAmounts.tsx';
import { Panel } from '../../components/Panel.tsx';
import { ProgressBar } from '../../components/ProgressBar.tsx';
import { Tabs } from '../../components/Tabs.tsx';
import { SITES, SITE_BY_ID } from '../../content/index.ts';
import {
  COLLECTIBLES,
  COLLECTIBLE_BY_ID,
  ITEMS,
  NODES,
  NODE_BY_ID,
  itemName,
} from '../../data/gameData.ts';
import { type CollectibleType, PURITIES } from '../../data/types.ts';
import { formatDistance } from '../../lib/geo/geo.ts';
import { useExplore } from '../../state/explore.ts';
import { useSettings } from '../../state/settings.ts';
import { MarkerGlyph, WorldMap, type MapPoint } from './WorldMap.tsx';
import {
  COLLECTIBLE_META,
  COLLECTIBLE_TYPES,
  collectibleVisible,
  driveTier,
  effectivePurity,
  locate,
  nearestCollectibles,
} from './nearby.ts';

const PURITY_COLOUR = { impure: '#ff8a8a', normal: '#ffd166', pure: '#5ee08f' } as const;
const RESOURCES = ITEMS.filter((i) => i.isResource);
const RESOURCE_IDS = new Set(RESOURCES.map((r) => r.id));

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const base = useSettings((s) => s.base);
  const setBase = useSettings((s) => s.setBase);
  const currentTier = useSettings((s) => s.currentTier);
  const purityOverrides = useSettings((s) => s.purityOverrides);
  const { collected, filters, setFilters, toggleCollected } = useExplore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  // Deep links: ?type=… and ?resource=… seed the filters once, then leave the
  // URL so the controls stay editable; ?site=… focuses the map.
  const linkedSite = params.get('site') ? SITE_BY_ID.get(params.get('site')!) : undefined;
  const [listTab] = useState(() => params.get('type') ?? 'mercerSphere');
  const [focus, setFocus] = useState(() =>
    linkedSite ? { x: linkedSite.centre.x, y: linkedSite.centre.y, nonce: 1 } : null,
  );
  useEffect(() => {
    const type = params.get('type') as CollectibleType | null;
    const resource = params.get('resource');
    if (!type && resource === null) return;
    const { filters: current, setFilters: apply } = useExplore.getState();
    apply({
      ...(type && type in current.types ? { types: { ...current.types, [type]: true } } : {}),
      ...(resource !== null && (resource === '' || RESOURCE_IDS.has(resource)) ? { resource } : {}),
    });
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('type');
        next.delete('resource');
        return next;
      },
      { replace: true },
    );
  }, [params, setParams]);
  const { types, resource } = filters;

  const points = useMemo<MapPoint[]>(() => {
    const list: MapPoint[] = [];
    const filter = {
      collected,
      hideCollected: filters.hideCollected,
      drivesUpToTier: filters.drivesUpToTier,
    };
    for (const c of COLLECTIBLES) {
      if (!types[c.type] || !collectibleVisible(c, filter)) continue;
      const meta = COLLECTIBLE_META[c.type];
      list.push({
        id: c.id,
        x: c.x,
        y: c.y,
        colour: meta.colour,
        shape: meta.shape,
        label: meta.label,
        dim: !!collected[c.id],
      });
    }
    if (resource) {
      for (const n of NODES) {
        const purity = effectivePurity(n, purityOverrides);
        if (n.resource !== resource || n.type === 'well-core' || !filters.purities[purity])
          continue;
        list.push({
          id: n.id,
          x: n.x,
          y: n.y,
          colour: PURITY_COLOUR[purity],
          shape: 'square',
          label: `${itemName(n.resource)} (${purity})`,
        });
      }
    }
    return list;
  }, [
    types,
    collected,
    filters.hideCollected,
    filters.drivesUpToTier,
    filters.purities,
    resource,
    purityOverrides,
  ]);

  const selected = selectedId
    ? (COLLECTIBLE_BY_ID.get(selectedId) ?? NODE_BY_ID.get(selectedId))
    : undefined;

  const counts = COLLECTIBLE_TYPES.map((type) => {
    const all = COLLECTIBLES.filter((c) => c.type === type);
    return { type, total: all.length, got: all.filter((c) => collected[c.id]).length };
  });

  const locateOnMap = (id: string, x: number, y: number) => {
    setSelectedId(id);
    setFocus((f) => ({ x, y, nonce: (f?.nonce ?? 0) + 1 }));
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl">Exploration</h1>
        <p className="text-ink-muted max-w-3xl">
          Every Mercer Sphere, Somersloop, crash site and Power Slug, plus all resource nodes,
          plotted from game coordinates and sorted by distance from your base. Tick items off as you
          collect them.
        </p>
      </header>

      <section
        aria-label="Collection progress"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {counts.map(({ type, total, got }) => (
          <div key={type} className="tile p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium">
                <MarkerGlyph
                  shape={COLLECTIBLE_META[type].shape}
                  colour={COLLECTIBLE_META[type].colour}
                />
                {COLLECTIBLE_META[type].plural}
              </span>
              <span className="num text-ink-muted text-sm">
                {got} / {total}
              </span>
            </div>
            <ProgressBar
              value={got}
              max={total}
              label={`${COLLECTIBLE_META[type].plural} collected`}
              className="mt-2"
            />
            <p className="text-ink-faint mt-2 text-xs">{COLLECTIBLE_META[type].blurb}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside aria-label="Map filters" className="space-y-4">
          <Panel title="Show" level={2} variant="card">
            <div className="space-y-2">
              {COLLECTIBLE_TYPES.map((type) => (
                <Checkbox
                  key={type}
                  checked={types[type]}
                  onChange={(v) => setFilters({ types: { ...filters.types, [type]: v } })}
                  label={
                    <span className="flex items-center gap-2">
                      <MarkerGlyph
                        shape={COLLECTIBLE_META[type].shape}
                        colour={COLLECTIBLE_META[type].colour}
                      />
                      {COLLECTIBLE_META[type].plural}
                    </span>
                  }
                />
              ))}
              <Checkbox
                checked={filters.hideCollected}
                onChange={(v) => setFilters({ hideCollected: v })}
                label="Hide collected"
              />
            </div>
            <SelectField
              className="mt-4"
              label="Crash sites"
              value={filters.drivesUpToTier === null ? 'all' : String(filters.drivesUpToTier)}
              onChange={(v) => setFilters({ drivesUpToTier: v === 'all' ? null : Number(v) })}
              options={[
                { value: 'all', label: 'All crash sites' },
                ...Array.from({ length: 10 }, (_, t) => ({
                  value: String(t),
                  label:
                    t === currentTier ? `Openable at my tier (Tier ${t})` : `Openable by Tier ${t}`,
                })),
              ]}
              hint="Based on the items each crash site needs to open."
            />
            <SelectField
              className="mt-4"
              label="Resource nodes"
              value={resource}
              onChange={(v) => setFilters({ resource: v })}
              options={[
                { value: '', label: 'None' },
                ...RESOURCES.map((r) => ({ value: r.id, label: r.name })),
              ]}
              {...(resource ? { hint: 'Shown as squares, coloured by purity.' } : {})}
            />
            {resource && (
              <div className="mt-2 flex flex-wrap gap-3">
                {PURITIES.map((p) => (
                  <Checkbox
                    key={p}
                    checked={filters.purities[p]}
                    onChange={(v) => setFilters({ purities: { ...filters.purities, [p]: v } })}
                    label={<PurityBadge purity={p} />}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Your base" level={2} variant="card">
            <p className="text-ink-muted num text-sm">
              x {Math.round(base.x)} m, y {Math.round(base.y)} m
            </p>
            <button
              type="button"
              aria-pressed={picking}
              onClick={() => setPicking((p) => !p)}
              className={`mt-2 w-full rounded border px-3 py-1.5 text-sm ${picking ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong hover:border-accent'}`}
            >
              {picking ? 'Click the map to set your base…' : 'Set base on the map'}
            </button>
          </Panel>

          {selected && (
            <Panel title="Selected" level={2} variant="card">
              <SelectedDetails
                id={selected.id}
                base={base}
                collected={!!collected[selected.id]}
                onToggle={() => toggleCollected(selected.id)}
              />
            </Panel>
          )}
        </aside>

        <div className="min-w-0 space-y-8">
          <WorldMap
            points={points}
            base={base}
            labels={SITES.map((s) => ({
              id: s.id,
              x: s.centre.x,
              y: s.centre.y - 60,
              text: s.name,
            }))}
            selectedId={selectedId}
            onSelect={setSelectedId}
            focus={focus}
            {...(picking
              ? {
                  onPick: (x: number, y: number) => {
                    setBase({ x, y, z: base.z });
                    setPicking(false);
                  },
                }
              : {})}
          />

          <Panel title="Nearest to your base" level={2}>
            <Tabs
              label="Collectible lists"
              defaultTab={listTab}
              tabs={COLLECTIBLE_TYPES.map((type) => ({
                id: type,
                label: COLLECTIBLE_META[type].plural,
                content: (
                  <NearestTable
                    type={type}
                    base={base}
                    collected={collected}
                    hideCollected={filters.hideCollected}
                    drivesUpToTier={filters.drivesUpToTier}
                    currentTier={currentTier}
                    onToggle={toggleCollected}
                    onLocate={locateOnMap}
                  />
                ),
              }))}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

interface NearestTableProps {
  type: CollectibleType;
  base: { x: number; y: number; z: number };
  collected: Record<string, true>;
  hideCollected: boolean;
  drivesUpToTier: number | null;
  currentTier: number;
  onToggle: (id: string) => void;
  onLocate: (id: string, x: number, y: number) => void;
}

function NearestTable({
  type,
  base,
  collected,
  hideCollected,
  drivesUpToTier,
  currentTier,
  onToggle,
  onLocate,
}: NearestTableProps) {
  const rows = nearestCollectibles(type, base, 30, collected, !hideCollected, drivesUpToTier);
  if (!rows.length)
    return <p className="text-ink-muted text-sm">Nothing left to collect. Well done, pioneer.</p>;
  return (
    <div className="relative overflow-x-auto">
      <table>
        <caption className="sr-only">{`Nearest ${COLLECTIBLE_META[type].plural}`}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Distance</th>
            <th scope="col">Bearing</th>
            <th scope="col">Height</th>
            <th scope="col">Coordinates (m)</th>
            {type === 'hardDrive' && <th scope="col">To open</th>}
            <th scope="col">Collected</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ item, distance, bearing, compass }, i) => {
            const dz = item.z - base.z;
            const tier = driveTier(item);
            return (
              <tr key={item.id} className="border-line border-t">
                <td className="num text-ink-faint py-1.5 pr-3">{i + 1}</td>
                <td className="num pr-3">{formatDistance(distance)}</td>
                <td className="num pr-3">
                  {compass} <span className="text-ink-faint">{Math.round(bearing)}°</span>
                </td>
                <td className="num pr-3">{dz >= 0 ? `+${Math.round(dz)}` : Math.round(dz)} m</td>
                <td className="num text-ink-muted pr-3 text-xs">
                  {Math.round(item.x)}, {Math.round(item.y)}
                </td>
                {type === 'hardDrive' && (
                  <td className="pr-3">
                    {item.unlockCost?.length ? (
                      <span className="flex flex-wrap items-center gap-1">
                        <ItemAmounts items={item.unlockCost} />
                        <TierBadge tier={tier} />
                        {tier <= currentTier && <Badge tone="ok">Openable</Badge>}
                      </span>
                    ) : (
                      <span className="text-ink-faint text-xs">No item cost (may need power)</span>
                    )}
                  </td>
                )}
                <td className="pr-3">
                  <input
                    type="checkbox"
                    aria-label={`Collected ${COLLECTIBLE_META[type].label} ${i + 1}`}
                    checked={!!collected[item.id]}
                    onChange={() => onToggle(item.id)}
                    className="accent-accent size-6"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onLocate(item.id, item.x, item.y)}
                    className="text-accent-strong min-h-6 py-0.5 text-sm hover:underline"
                  >
                    Locate
                    <span className="sr-only">{` ${COLLECTIBLE_META[type].label} ${i + 1}`}</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SelectedDetails({
  id,
  base,
  collected,
  onToggle,
}: {
  id: string;
  base: { x: number; y: number; z: number };
  collected: boolean;
  onToggle: () => void;
}) {
  const purityOverrides = useSettings((s) => s.purityOverrides);
  const c = COLLECTIBLE_BY_ID.get(id);
  const n = NODE_BY_ID.get(id);
  const point = c ?? n;
  if (!point) return null;
  const where = locate(point, base);
  return (
    <div className="space-y-2 text-sm">
      <p className="font-semibold">
        {c ? COLLECTIBLE_META[c.type].label : n ? `${itemName(n.resource)} node` : ''}{' '}
        {n && <PurityBadge purity={effectivePurity(n, purityOverrides)} />}
      </p>
      <p className="text-ink-muted num">
        {formatDistance(where.distance)} {where.compass} ({Math.round(where.bearing)}°) · height{' '}
        {Math.round(point.z)} m
      </p>
      <p className="text-ink-faint num text-xs">
        x {Math.round(point.x)}, y {Math.round(point.y)}
      </p>
      {c?.unlockCost?.length ? (
        <div>
          <p className="text-ink-faint text-xs">To open:</p>
          <ItemAmounts items={c.unlockCost} />
        </div>
      ) : null}
      {c && <Checkbox checked={collected} onChange={onToggle} label="Collected" />}
    </div>
  );
}
