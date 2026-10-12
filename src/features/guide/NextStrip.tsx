import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Switch } from '../../components/Switch.tsx';
import { cx } from '../../components/cx.ts';
import { TIERS } from '../../content/index.ts';
import { GlanceLink } from './GlanceLink.tsx';
import { StepFigures } from './StepFigures.tsx';
import { TickReceipt } from './TickReceipt.tsx';
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
  const { tier, next, fresh, lastTicked, tick, undo, skip, advanceTier } = useNextTask();
  const [figuresOpen, setFiguresOpen] = useState(false);
  const elsewhere = viewingTier !== undefined && viewingTier !== tier.tier;
  const layout = next ? stepLayout(next.step) : undefined;
  const strip = useRef<HTMLElement>(null);

  // Expose the strip's height so phone pages can clear the bottom bar.
  useEffect(() => {
    const el = strip.current;
    const root = document.documentElement;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() =>
      root.style.setProperty('--next-h', `${el.offsetHeight}px`),
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--next-h');
    };
  }, []);

  return (
    <section
      ref={strip}
      aria-label="Next task"
      className={cx(
        // Phones: a bottom thumb bar. From sm it sits in the sticky header.
        'fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] sm:static sm:pb-0',
        'border-t border-[color-mix(in_srgb,var(--color-accent)_50%,var(--color-line))] transition-colors duration-500',
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
              label={
                <span className="line-clamp-2 font-semibold sm:line-clamp-none sm:text-lg">
                  {next.task.label}
                </span>
              }
              className="min-w-0 flex-1 basis-48"
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
          <TierComplete
            tier={tier.tier}
            onAdvance={advanceTier}
            // On its own tier page the complete moment below makes the offer.
            offer={viewingTier !== tier.tier}
          />
        )}
        <GlanceLink className="hidden shrink-0 lg:inline-flex" />
      </div>
      <TickReceipt
        lastTicked={lastTicked}
        nextLabel={next?.task.label}
        visible={fresh}
        onUndo={undo}
        className="mx-auto max-w-7xl px-4 pb-1.5"
      />
    </section>
  );
}

/** The end-of-tier offer: never advances by itself. */
export function TierComplete({
  tier,
  onAdvance,
  offer = true,
}: {
  tier: number;
  onAdvance: () => void;
  /** False when another surface on screen already offers the move. */
  offer?: boolean;
}) {
  if (tier >= TIERS.length - 1)
    return (
      <p className="min-h-11 py-2 font-semibold">Run complete. Project Assembly is launched.</p>
    );
  return (
    <p className="flex min-h-11 flex-wrap items-center gap-3">
      <span className="font-semibold">Tier {tier} complete.</span>
      {offer && (
        <button
          type="button"
          onClick={onAdvance}
          className="border-accent text-accent-strong hover:bg-panel-3 min-h-11 rounded border px-3 text-sm font-semibold"
        >
          Move to Tier {tier + 1}
        </button>
      )}
    </p>
  );
}
