import { Link } from 'react-router';
import { KindGlyph } from '../../components/KindGlyph.tsx';
import { Switch } from '../../components/Switch.tsx';
import { cx } from '../../components/cx.ts';
import { GlanceLink } from '../guide/GlanceLink.tsx';
import { TickReceipt } from '../guide/TickReceipt.tsx';
import { TierCompleteMoment } from '../guide/TierCompleteMoment.tsx';
import { StepFigures } from '../guide/StepFigures.tsx';
import { KIND_LABEL, stepAnchor, stepLayout } from '../guide/stepMeta.ts';
import { useNextTask } from '../guide/useNextTask.ts';

/** The dashboard's enlarged NEXT: the step, its next task as a big switch, then what follows. */
export function NextHero() {
  const { tier, next, after, then, fresh, lastTicked, tick, undo, skip, advanceTier } =
    useNextTask();
  const layout = next ? stepLayout(next.step) : undefined;

  return (
    <section
      aria-label="Next task"
      className={cx('panel-hero p-5 transition-colors duration-500 sm:p-7', fresh && 'next-fresh')}
    >
      <TickReceipt
        lastTicked={lastTicked}
        nextLabel={next?.task.label}
        onUndo={undo}
        className="mb-3"
      />
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="bg-accent text-accent-ink rounded px-2 py-0.5 text-xs font-bold">
          NEXT
        </span>
        <span className="text-ink-muted text-sm">
          Tier {tier.tier} · {tier.title}
        </span>
      </p>
      {next ? (
        <>
          <h2 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-xl sm:text-2xl">
            <span className="num text-accent-strong">
              {String(next.index + 1).padStart(2, '0')}
            </span>
            <Link
              to={{ pathname: `/tier/${tier.tier}`, hash: stepAnchor(next.step.id) }}
              className="text-ink no-underline hover:underline"
            >
              {next.step.title}
            </Link>
          </h2>
          <Switch
            checked={false}
            onChange={tick}
            keyShortcut="n"
            size="lg"
            label={<span className="text-lg font-semibold sm:text-xl">{next.task.label}</span>}
            className="mt-4"
          />
          {after && (
            <p className="text-ink-muted mt-2 text-sm sm:pl-[4.5rem]">
              <span className="text-ink-faint">After that: </span>
              {after.task.label}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {layout && <StepFigures layout={layout} emphasis />}
            {next.step.optional && (
              <button
                type="button"
                onClick={skip}
                className="border-line-strong text-ink-muted hover:text-ink min-h-11 rounded border px-3 text-sm"
              >
                Skip step
              </button>
            )}
            <Link
              to={`/tier/${tier.tier}`}
              className="border-line-strong text-ink hover:border-ink-faint inline-flex min-h-11 items-center rounded border px-3 text-sm no-underline hover:no-underline"
            >
              Open Tier {tier.tier}
            </Link>
            <GlanceLink />
          </div>
          {then.length > 0 && (
            <div className="border-line mt-6 border-t pt-4">
              <h3 className="text-ink-faint mb-2 text-sm font-semibold">Then</h3>
              <ol className="space-y-1.5 text-sm">
                {then.map((s) => (
                  <li key={s.id} className="text-ink-muted flex items-center gap-2">
                    <KindGlyph kind={s.kind} className="text-ink-faint" />
                    <span className="sr-only">{KIND_LABEL[s.kind]}: </span>
                    <Link
                      to={{ pathname: `/tier/${tier.tier}`, hash: stepAnchor(s.id) }}
                      className="text-ink-muted hover:text-ink no-underline hover:underline"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      ) : (
        <TierCompleteMoment tier={tier} onAdvance={advanceTier} fresh={fresh} className="mt-4" />
      )}
    </section>
  );
}
