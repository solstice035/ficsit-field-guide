import { useState } from 'react';
import { Link } from 'react-router';
import { Switch } from '../../components/Switch.tsx';
import { cx } from '../../components/cx.ts';
import { TIERS } from '../../content/index.ts';
import { GlanceLink } from './GlanceLink.tsx';
import { StepFigures } from './StepFigures.tsx';
import { stepAnchor, stepLayout } from './stepMeta.ts';
import { useNextTask } from './useNextTask.ts';

export interface NextStripProps {
  /** The tier on screen, when it isn't necessarily the player's current tier. */
  viewingTier?: number;
}

/**
 * The pinned "what do I do now?" line. It always follows the player's
 * current tier: one switch ticks the next task, and the line that replaces it
 * holds amber until seen.
 */
export function NextStrip({ viewingTier }: NextStripProps) {
  const { tier, next, fresh, tick, skip, advanceTier } = useNextTask();
  const [figuresOpen, setFiguresOpen] = useState(false);
  const elsewhere = viewingTier !== undefined && viewingTier !== tier.tier;
  const layout = next ? stepLayout(next.step) : undefined;

  return (
    <section
      aria-label="Next task"
      className={cx(
        'border-t border-[color-mix(in_srgb,var(--color-accent)_50%,var(--color-line))]',
        fresh ? 'next-fresh' : 'bg-panel-2',
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 lg:flex-nowrap">
        <span className="bg-accent text-accent-ink rounded px-2 py-0.5 text-xs font-bold">
          NEXT
        </span>
        {elsewhere && (
          <span className="text-ink-muted text-sm">
            You&apos;re on <Link to={`/tier/${tier.tier}`}>Tier {tier.tier}</Link> ·
          </span>
        )}
        {next ? (
          <>
            <Switch
              checked={false}
              onChange={tick}
              keyShortcut="n"
              label={<span className="font-semibold sm:text-lg">{next.task.label}</span>}
              className="min-w-0 flex-1"
            />
            <Link
              to={{ pathname: `/tier/${tier.tier}`, hash: stepAnchor(next.step.id) }}
              className="text-ink-muted hidden max-w-[16rem] min-w-0 shrink truncate text-sm no-underline hover:underline xl:inline"
            >
              Step {String(next.index + 1).padStart(2, '0')} · {next.step.title}
            </Link>
            {next.step.optional && (
              <button
                type="button"
                onClick={skip}
                className="border-line-strong text-ink-muted hover:text-ink min-h-11 rounded border px-3 text-sm"
              >
                Skip step
              </button>
            )}
            {layout && (
              <>
                <button
                  type="button"
                  aria-expanded={figuresOpen}
                  onClick={() => setFiguresOpen((o) => !o)}
                  className="text-ink-muted hover:text-ink min-h-11 text-sm sm:hidden"
                >
                  Figures
                </button>
                <StepFigures
                  layout={layout}
                  emphasis
                  className={cx(
                    'shrink-0 text-sm',
                    figuresOpen ? 'w-full pb-2' : 'hidden',
                    'sm:flex sm:w-auto sm:pb-0',
                  )}
                />
              </>
            )}
          </>
        ) : (
          <TierComplete tier={tier.tier} onAdvance={advanceTier} />
        )}
        <GlanceLink className="hidden shrink-0 lg:inline-flex" />
      </div>
    </section>
  );
}

/** The end-of-tier offer: never advances by itself. */
export function TierComplete({ tier, onAdvance }: { tier: number; onAdvance: () => void }) {
  if (tier >= TIERS.length - 1)
    return (
      <p className="min-h-11 py-2 font-semibold">Run complete. Project Assembly is launched.</p>
    );
  return (
    <p className="flex min-h-11 flex-wrap items-center gap-3">
      <span className="font-semibold">Tier {tier} complete.</span>
      <button
        type="button"
        onClick={onAdvance}
        className="border-accent text-accent-strong hover:bg-panel-3 min-h-11 rounded border px-3 text-sm font-semibold"
      >
        Move to Tier {tier + 1}
      </button>
    </p>
  );
}
