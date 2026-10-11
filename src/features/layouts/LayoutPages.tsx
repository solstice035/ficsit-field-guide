import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { Segmented } from '../../components/Fields.tsx';
import { LAYOUTS, LAYOUT_BY_ID, TIERS } from '../../content/index.ts';
import { LayoutConfigurator } from './LayoutConfigurator.tsx';
import { LayoutSummaryCard } from './LayoutSummaryCard.tsx';

export function LayoutsIndexPage() {
  const [tier, setTier] = useState<number | 'all'>('all');
  const shown = LAYOUTS.filter((l) => tier === 'all' || l.tier === tier);
  const tiers = [...new Set(shown.map((l) => l.tier))];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl">Factory layouts</h1>
        <p className="text-ink-muted max-w-3xl">
          {LAYOUTS.length} configurable layouts for a Rocky Desert run. Open one to change rates,
          recipes, miners, belts, purity, clocks and Somersloops. Every view recalculates instantly.
        </p>
        <Segmented<number | 'all'>
          legend="Tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: 'all', label: 'All' },
            ...TIERS.map((t) => ({ value: t.tier, label: `T${t.tier}` })),
          ]}
        />
      </header>
      {tiers.map((t) => (
        <section key={t} aria-labelledby={`layouts-tier-${t}`}>
          <h2 id={`layouts-tier-${t}`} className="mb-3 text-lg">
            Tier {t} · {TIERS[t]?.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown
              .filter((l) => l.tier === t)
              .map((l) => (
                <LayoutSummaryCard key={l.id} layout={l} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LayoutPage() {
  const { layoutId = '' } = useParams();
  const layout = LAYOUT_BY_ID.get(layoutId);
  if (!layout) return <Navigate to="/layouts" replace />;
  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link to="/layouts">Layouts</Link> <span className="text-ink-faint">/</span>{' '}
        <Link to={`/tier/${layout.tier}`}>Tier {layout.tier}</Link>{' '}
        <span className="text-ink-faint">/</span> <span aria-current="page">{layout.name}</span>
      </nav>
      <LayoutConfigurator key={layout.id} layout={layout} />
    </div>
  );
}
