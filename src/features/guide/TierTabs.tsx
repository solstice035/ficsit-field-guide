import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { cx } from '../../components/cx.ts';
import { useRovingTabs } from '../../components/useRovingTabs.ts';
import { TIERS } from '../../content/index.ts';
import { useSettings } from '../../state/settings.ts';
import { useAllTierProgress } from './progress.ts';
import { TIER_PANEL_ID, tierTabId } from './tierTabIds.ts';

/** One tab per tier (WAI-ARIA tabs; each tab is also a route). */
export function TierTabs({ activeTier }: { activeTier: number }) {
  const navigate = useNavigate();
  const progress = useAllTierProgress();
  const currentTier = useSettings((s) => s.currentTier);
  const { refs, onKeyDown } = useRovingTabs(TIERS.length, (index) => navigate(`/tier/${index}`));

  // Keep the selected tab visible in the phone scroller (no-op when it already is).
  useEffect(() => {
    refs.current[activeTier]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeTier, refs]);

  return (
    // Phones: one swipeable row with readable titles; md+: all ten in a grid.
    <div
      role="tablist"
      aria-label="Tiers"
      className="scrollbar-none -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-10 md:overflow-visible md:px-0 md:pb-0"
    >
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
              'group relative w-32 shrink-0 snap-start overflow-hidden rounded-md border px-2 py-2 text-left md:w-auto',
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
            <span className="text-ink-muted line-clamp-2 min-h-8 text-xs md:line-clamp-1 md:min-h-0">
              {tier.title}
            </span>
            <span className="text-ink-faint num block text-xs">
              {tier.tier === currentTier && <span className="text-ink font-semibold">You · </span>}
              {pct}% done
            </span>
            <span
              aria-hidden="true"
              className={cx(
                'absolute bottom-0 left-0 h-0.5',
                pct === 100 ? 'bg-ok' : 'bg-ink-muted',
              )}
              style={{ width: `${pct}%` }}
            />
          </button>
        );
      })}
    </div>
  );
}
