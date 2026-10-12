import { useId } from 'react';
import { CheckGlyph } from '../../components/KindGlyph.tsx';
import { cx } from '../../components/cx.ts';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import type { TierGuide } from '../../content/types.ts';
import { stepStates } from '../../lib/progress/progress.ts';
import { useProgressFlags } from './progress.ts';

export interface TierCompleteMomentProps {
  tier: TierGuide;
  onAdvance: () => void;
  /** True right after the last tick: plays the stamp once. */
  fresh?: boolean;
  /** Render as its own labelled region (tier page) rather than inside the NEXT hero. */
  region?: boolean;
  className?: string;
}

/**
 * The end of a tier, marked: what the player finished, what the next tier is
 * for, and the offer to move on. It never advances by itself.
 */
export function TierCompleteMoment({
  tier,
  onAdvance,
  fresh = false,
  region = false,
  className,
}: TierCompleteMomentProps) {
  const headingId = useId();
  const flags = useProgressFlags();
  const states = stepStates(tier, flags);
  const done = states.filter((s) => s === 'done').length;
  const skipped = states.filter((s) => s === 'skipped').length;
  const milestones = tier.steps.reduce((n, s) => n + (s.milestoneIds?.length ?? 0), 0);
  const nextTier = TIER_BY_NUMBER.get(tier.tier + 1);

  const facts = [
    `${done} ${done === 1 ? 'step' : 'steps'} done`,
    skipped > 0 && `${skipped} skipped`,
    milestones > 0 && `${milestones} ${milestones === 1 ? 'milestone' : 'milestones'}`,
    tier.spaceElevatorPhase !== undefined && `Phase ${tier.spaceElevatorPhase} delivered`,
  ].filter(Boolean);

  const Root = region ? 'section' : 'div';
  return (
    <Root
      aria-labelledby={region ? headingId : undefined}
      className={cx(fresh && 'tier-moment-fresh', className)}
    >
      <h2 id={headingId} className="text-ok flex items-center gap-2 text-xl sm:text-2xl">
        <span className="tier-moment-stamp border-ok grid size-8 shrink-0 place-items-center rounded-full border-2">
          <CheckGlyph />
        </span>
        {nextTier ? `Tier ${tier.tier} complete` : 'Run complete'}
      </h2>
      <p className="text-ink mt-2 font-semibold">
        {nextTier ? tier.title : 'Project Assembly is launched.'}
      </p>
      <p className="text-ink-muted num mt-1 text-sm">{facts.join(' · ')}</p>
      <span aria-hidden="true" className="tier-moment-rule bg-ok mt-4 block h-0.5 rounded-full" />
      {nextTier && (
        <div className="mt-4 space-y-3">
          <p className="max-w-prose">
            <span className="text-ink-faint">Up next: </span>
            <span className="font-semibold">
              Tier {nextTier.tier} · {nextTier.title}
            </span>
            <span className="text-ink-muted block text-sm">{nextTier.tagline}</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={onAdvance}
              className="bg-accent text-accent-ink hover:bg-accent-strong min-h-11 rounded px-4 font-semibold"
            >
              Move to Tier {nextTier.tier}
            </button>
            <span className="text-ink-faint text-sm">Nothing moves until you choose.</span>
          </p>
        </div>
      )}
    </Root>
  );
}
