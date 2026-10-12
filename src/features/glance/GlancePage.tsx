import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Switch } from '../../components/Switch.tsx';
import { cx } from '../../components/cx.ts';
import { TierComplete } from '../guide/NextStrip.tsx';
import { StepFigures } from '../guide/StepFigures.tsx';
import { stepLayout } from '../guide/stepMeta.ts';
import { useNextTask } from '../guide/useNextTask.ts';
import { useWakeLock } from './useWakeLock.ts';

const WAKE_NOTE = {
  unsupported: "This browser can't keep the screen awake; change its sleep setting instead.",
  failed: 'The browser refused to keep the screen awake (low battery or power saving).',
} as const;

/**
 * `/glance`: the NEXT task alone, in large type, for a second monitor in a dim
 * room. Opened in its own window; ticks sync with the main window.
 */
export function GlancePage() {
  const { tier, next, after, fresh, tick, skip, advanceTier } = useNextTask();
  const [keepAwake, setKeepAwake] = useState(false);
  const wake = useWakeLock(keepAwake);
  const layout = next ? stepLayout(next.step) : undefined;

  useEffect(() => {
    const previous = document.title;
    document.title = 'Glance · FICSIT Field Guide';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-line flex flex-wrap items-center gap-x-6 gap-y-1 border-b px-6 py-2 text-sm">
        <span className="text-ink-muted">
          FICSIT Field Guide · <span className="text-ink">Tier {tier.tier}</span> · {tier.title}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-x-6">
          {wake === 'unsupported' ? (
            <span className="text-ink-faint">{WAKE_NOTE.unsupported}</span>
          ) : (
            <Switch checked={keepAwake} onChange={setKeepAwake} label="Keep screen awake" />
          )}
          {wake === 'failed' && <span className="text-warn">{WAKE_NOTE.failed}</span>}
          <Link to={`/tier/${tier.tier}`} className="inline-flex min-h-11 items-center">
            Open the guide
          </Link>
        </span>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-10"
      >
        <section
          aria-label="Next task"
          className={cx('rounded-xl p-6 sm:p-10', fresh ? 'next-fresh' : 'bg-panel')}
        >
          <span className="bg-accent text-accent-ink rounded px-3 py-1 text-sm font-bold">
            NEXT
          </span>
          {next ? (
            <>
              <h1 className="mt-5 flex flex-wrap items-baseline gap-x-4 text-3xl leading-tight sm:text-5xl">
                <span className="num text-accent-strong">
                  {String(next.index + 1).padStart(2, '0')}
                </span>
                <span>{next.step.title}</span>
              </h1>
              <Switch
                checked={false}
                onChange={tick}
                size="xl"
                label={
                  <span className="text-2xl leading-snug font-semibold sm:text-4xl">
                    {next.task.label}
                  </span>
                }
                className="mt-8"
              />
              {after && (
                <p className="text-ink-muted mt-6 text-xl sm:text-2xl">
                  <span className="text-ink-faint">After that: </span>
                  {after.task.label}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                {layout && <StepFigures layout={layout} emphasis className="text-xl" />}
                {next.step.optional && (
                  <button
                    type="button"
                    onClick={skip}
                    className="border-line-strong text-ink-muted hover:text-ink min-h-14 rounded border px-5 text-lg"
                  >
                    Skip step
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="mt-6 text-2xl sm:text-3xl">
              <h1 className="sr-only">Nothing left in Tier {tier.tier}</h1>
              <TierComplete tier={tier.tier} onAdvance={advanceTier} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
