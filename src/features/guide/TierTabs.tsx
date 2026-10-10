import { useNavigate } from 'react-router';
import { cx } from '../../components/cx.ts';
import { useRovingTabs } from '../../components/useRovingTabs.ts';
import { TIERS } from '../../content/index.ts';
import { useAllTierProgress } from './progress.ts';
import { TIER_PANEL_ID, tierTabId } from './tierTabIds.ts';

/** One tab per tier (WAI-ARIA tabs; each tab is also a route). */
export function TierTabs({ activeTier }: { activeTier: number }) {
  const navigate = useNavigate();
  const progress = useAllTierProgress();
  const { refs, onKeyDown } = useRovingTabs(TIERS.length, (index) => navigate(`/tier/${index}`));

  return (
    <div role="tablist" aria-label="Tiers" className="grid grid-cols-5 gap-1.5 md:grid-cols-10">
      {TIERS.map((tier, index) => {
        const selected = tier.tier === activeTier;
        const p = progress[index];
        const pct = p && p.total ? Math.round((p.done / p.total) * 100) : 0;
        return (
          <button
            key={tier.tier}
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={tierTabId(tier.tier)}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={TIER_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            onClick={() => navigate(`/tier/${tier.tier}`)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              'group relative overflow-hidden rounded-md border px-2 py-2 text-left',
              selected
                ? 'border-accent bg-panel-3'
                : 'border-line bg-panel hover:border-line-strong',
            )}
          >
            <span
              className={cx(
                'block text-sm font-bold',
                selected ? 'text-accent-strong' : 'text-ink',
              )}
            >
              Tier {tier.tier}
            </span>
            <span className="text-ink-muted block truncate text-xs">{tier.title}</span>
            <span className="text-ink-faint num block text-[11px]">{pct}% done</span>
            <span
              aria-hidden="true"
              className={cx('absolute bottom-0 left-0 h-0.5', pct === 100 ? 'bg-ok' : 'bg-accent')}
              style={{ width: `${pct}%` }}
            />
          </button>
        );
      })}
    </div>
  );
}
