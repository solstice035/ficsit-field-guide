import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Switch } from '../../components/Switch.tsx';
import { cx } from '../../components/cx.ts';
import { TIERS } from '../../content/index.ts';
import { nextInTier } from '../../lib/progress/progress.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { StepFigures } from './StepFigures.tsx';
import { useProgressFlags } from './progress.ts';
import { stepAnchor, stepLayout } from './stepMeta.ts';

/** Wait before a fresh line can be marked seen, so the tick itself doesn't clear it. */
const SEEN_DELAY_MS = 1200;

/**
 * Holds `true` from when `key` changes until the player next moves, types or
 * touches, so a line that just changed stays lit until it has been seen.
 */
function useFreshUntilSeen(key: string): boolean {
  const [seenKey, setSeenKey] = useState(key);
  const fresh = seenKey !== key;
  useEffect(() => {
    if (!fresh) return;
    const markSeen = () => setSeenKey(key);
    const events = ['pointermove', 'keydown', 'touchstart'] as const;
    const timer = window.setTimeout(() => {
      for (const e of events) window.addEventListener(e, markSeen, { once: true, passive: true });
    }, SEEN_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, markSeen);
    };
  }, [fresh, key]);
  return fresh;
}

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
  const currentTier = useSettings((s) => s.currentTier);
  const setCurrentTier = useSettings((s) => s.setCurrentTier);
  const flags = useProgressFlags();
  const toggleTask = useProgress((s) => s.toggleTask);
  const toggleSkipped = useProgress((s) => s.toggleSkipped);
  const [figuresOpen, setFiguresOpen] = useState(false);
  const tier = TIERS[currentTier] ?? TIERS[0]!;
  const next = nextInTier(tier, flags);
  const fresh = useFreshUntilSeen(next?.task.id ?? `complete-${tier.tier}`);
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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5">
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
              onChange={() => toggleTask(next.task.id)}
              label={<span className="font-semibold sm:text-lg">{next.task.label}</span>}
              className="min-w-0 flex-1 sm:flex-none"
            />
            <Link
              to={{ pathname: `/tier/${tier.tier}`, hash: stepAnchor(next.step.id) }}
              className="text-ink-muted hidden text-sm no-underline hover:underline md:inline"
            >
              Step {String(next.index + 1).padStart(2, '0')} · {next.step.title}
            </Link>
            {next.step.optional && (
              <button
                type="button"
                onClick={() => toggleSkipped(next.step.id)}
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
                    'ml-auto text-sm',
                    figuresOpen ? 'w-full pb-2' : 'hidden',
                    'sm:flex sm:w-auto sm:pb-0',
                  )}
                />
              </>
            )}
          </>
        ) : (
          <TierComplete tier={tier.tier} onAdvance={() => setCurrentTier(tier.tier + 1)} />
        )}
      </div>
    </section>
  );
}

function TierComplete({ tier, onAdvance }: { tier: number; onAdvance: () => void }) {
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
