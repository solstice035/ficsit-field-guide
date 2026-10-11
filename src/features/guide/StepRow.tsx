import { useId, useState } from 'react';
import { CheckGlyph, KindGlyph } from '../../components/KindGlyph.tsx';
import { Switch } from '../../components/Switch.tsx';
import { cx } from '../../components/cx.ts';
import { LAYOUT_BY_ID } from '../../content/index.ts';
import type { GuideStep } from '../../content/types.ts';
import { type StepState, isTaskDone, stepProgress } from '../../lib/progress/progress.ts';
import { useProgress } from '../../state/progress.ts';
import { LayoutSummaryCard } from '../layouts/LayoutSummaryCard.tsx';
import { ExploreTargets } from './ExploreTargets.tsx';
import { MilestoneCard } from './MilestoneCard.tsx';
import { PhaseDetails } from './PhaseDetails.tsx';
import { ResearchList } from './ResearchList.tsx';
import { SiteChips } from './SiteChips.tsx';
import { StepFigures } from './StepFigures.tsx';
import { useProgressFlags } from './progress.ts';
import { KIND_LABEL, stepAnchor, stepLayout, stepSiteName } from './stepMeta.ts';

function SubHeading({ children }: { children: string }) {
  return <h4 className="text-ink-faint mt-5 mb-2 text-xs font-semibold first:mt-0">{children}</h4>;
}

export interface StepRowProps {
  step: GuideStep;
  index: number;
  state: StepState;
  /** The tier's Space Elevator phase, shown in its Space Elevator step. */
  phase?: number;
}

/**
 * One work order in the tier queue (APG accordion: an h3 holding the button).
 * Rows keep one column rhythm: number, title, kind, site, progress. The
 * current step opens by default; done and later steps start closed.
 */
export function StepRow({ step, index, state, phase }: StepRowProps) {
  const flags = useProgressFlags();
  const toggleTask = useProgress((s) => s.toggleTask);
  const toggleSkipped = useProgress((s) => s.toggleSkipped);
  const panelId = useId();
  // A manual open/close holds only while the step stays in the same state, so
  // ticking the last task collapses the step and opens the next one.
  const [manual, setManual] = useState<{ state: StepState; open: boolean } | null>(null);
  const open = manual?.state === state ? manual.open : state === 'current';
  const { done, total } = stepProgress(step, flags);
  const current = state === 'current';
  const site = stepSiteName(step);
  const layout = stepLayout(step);
  const elevator = step.kind === 'space-elevator';

  return (
    <li
      id={stepAnchor(step.id)}
      className={cx(
        'scroll-mt-[calc(var(--header-h,4rem)+1rem)] rounded-lg border',
        current ? 'step-current bg-panel' : 'border-transparent',
        state === 'later' && 'bg-panel border-line',
      )}
    >
      <h3 className="text-base font-normal tracking-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          data-step-toggle=""
          data-step-state={state}
          onClick={() => setManual({ state, open: !open })}
          className={cx(
            'hover:bg-panel-2 grid min-h-11 w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-lg px-3 py-2 text-left sm:px-4',
            'md:grid-cols-[2.25rem_minmax(0,1fr)_9rem_10rem_6.5rem]',
          )}
        >
          <span
            className={cx('num font-semibold', current ? 'text-accent-strong' : 'text-ink-faint')}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className={cx(
              'min-w-0 font-semibold',
              current
                ? 'text-ink text-lg'
                : state === 'later'
                  ? 'text-ink-muted'
                  : 'text-ink-faint',
            )}
          >
            {step.title}
          </span>
          {current ? (
            <span className="text-accent-ink bg-accent justify-self-end rounded px-2 py-0.5 text-xs font-bold md:order-last">
              NEXT
            </span>
          ) : (
            <StatusCell state={state} done={done} total={total} className="md:order-last" />
          )}
          <span className="text-ink-faint col-start-2 flex min-w-0 items-center gap-x-3 text-xs md:contents md:text-sm">
            <span
              className={cx(
                'flex items-center gap-1.5',
                elevator ? 'text-elevator' : 'text-ink-faint',
              )}
            >
              <KindGlyph kind={step.kind} />
              {KIND_LABEL[step.kind]}
            </span>
            <span className="truncate">{site ?? '—'}</span>
          </span>
        </button>
      </h3>

      <div id={panelId} hidden={!open} className="px-3 pb-5 sm:px-4 md:pl-[3.75rem]">
        <p className="text-ink-muted mb-3">{step.summary}</p>
        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <ul className="divide-line divide-y">
              {step.tasks.map((task) => (
                <li key={task.id}>
                  <Switch
                    checked={isTaskDone(task, flags)}
                    onChange={() => toggleTask(task.id)}
                    strikeWhenChecked
                    label={task.label}
                    className="w-full py-1"
                  />
                </li>
              ))}
            </ul>
            {step.optional && (
              <button
                type="button"
                aria-pressed={state === 'skipped'}
                onClick={() => toggleSkipped(step.id)}
                className="border-line-strong text-ink-muted hover:text-ink mt-3 min-h-11 rounded border px-3 text-sm"
              >
                {state === 'skipped' ? 'Unskip this step' : 'Skip this optional step'}
              </button>
            )}
            {step.body?.map((p) => (
              <p key={p} className="text-ink-muted mt-3 text-sm leading-relaxed">
                {p}
              </p>
            ))}
            {step.tips?.length ? (
              <>
                <SubHeading>Tips</SubHeading>
                <ul className="text-ink-muted list-disc space-y-1 pl-5 text-sm">
                  {step.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div>
            {layout && (
              <>
                <SubHeading>Figures</SubHeading>
                <StepFigures layout={layout} className="text-sm" />
              </>
            )}
            {elevator && phase !== undefined && (
              <>
                <SubHeading>Deliver</SubHeading>
                <PhaseDetails phase={phase} />
              </>
            )}
            {step.milestoneIds?.length ? (
              <>
                <SubHeading>{step.milestoneIds.length > 1 ? 'Milestones' : 'Milestone'}</SubHeading>
                <div className="space-y-2">
                  {step.milestoneIds.map((id) => (
                    <MilestoneCard key={id} schematicId={id} />
                  ))}
                </div>
              </>
            ) : null}
            {step.siteIds?.length ? (
              <>
                <SubHeading>Sites</SubHeading>
                <SiteChips ids={step.siteIds} />
              </>
            ) : null}
          </div>
        </div>

        {step.layoutIds?.length ? (
          <>
            <SubHeading>Factory layouts</SubHeading>
            <div className="grid gap-2 md:grid-cols-2">
              {step.layoutIds.map((id) => {
                const l = LAYOUT_BY_ID.get(id);
                return l ? <LayoutSummaryCard key={id} layout={l} /> : null;
              })}
            </div>
          </>
        ) : null}
        {step.researchIds?.length ? (
          <>
            <SubHeading>MAM research</SubHeading>
            <ResearchList ids={step.researchIds} />
          </>
        ) : null}
        {step.explore?.length ? (
          <>
            <SubHeading>Nearest to your base</SubHeading>
            <ExploreTargets targets={step.explore} />
          </>
        ) : null}
      </div>
    </li>
  );
}

function StatusCell({
  state,
  done,
  total,
  className,
}: {
  state: StepState;
  done: number;
  total: number;
  className?: string;
}) {
  if (state === 'done')
    return (
      <span
        className={cx(
          'text-ok flex items-center gap-1 justify-self-end text-sm font-semibold',
          className,
        )}
      >
        <CheckGlyph />
        Done
      </span>
    );
  if (state === 'skipped')
    return (
      <span className={cx('text-ink-faint justify-self-end text-sm', className)}>– Skipped</span>
    );
  return (
    <span className={cx('text-ink-muted num justify-self-end text-sm', className)}>
      {done} / {total}
    </span>
  );
}
