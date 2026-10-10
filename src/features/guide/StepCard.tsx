import { Badge, type Tone } from '../../components/Badge.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import { cx } from '../../components/cx.ts';
import { Disclosure } from '../../components/Disclosure.tsx';
import { LAYOUT_BY_ID } from '../../content/index.ts';
import type { GuideStep, StepKind } from '../../content/types.ts';
import { useProgress } from '../../state/progress.ts';
import { LayoutSummaryCard } from '../layouts/LayoutSummaryCard.tsx';
import { ExploreTargets } from './ExploreTargets.tsx';
import { MilestoneCard } from './MilestoneCard.tsx';
import { ResearchList } from './ResearchList.tsx';
import { SiteChips } from './SiteChips.tsx';

const KIND: Record<StepKind, { label: string; tone: Tone }> = {
  handcraft: { label: 'Hand-craft', tone: 'neutral' },
  build: { label: 'Build', tone: 'accent' },
  power: { label: 'Power', tone: 'warn' },
  milestone: { label: 'Milestone', tone: 'accent' },
  research: { label: 'MAM', tone: 'info' },
  explore: { label: 'Explore', tone: 'ok' },
  logistics: { label: 'Logistics', tone: 'neutral' },
  'space-elevator': { label: 'Space Elevator', tone: 'danger' },
};

function SubHeading({ children }: { children: string }) {
  return (
    <h4 className="text-ink-faint mt-4 mb-2 text-xs font-semibold tracking-wide uppercase">
      {children}
    </h4>
  );
}

export interface StepCardProps {
  step: GuideStep;
  index: number;
  defaultOpen?: boolean;
}

/** One ordered guide step: summary, details, checklist and linked layouts, research and sites. */
export function StepCard({ step, index, defaultOpen }: StepCardProps) {
  const tasks = useProgress((s) => s.tasks);
  const toggleTask = useProgress((s) => s.toggleTask);
  const done = step.tasks.filter((t) => tasks[t.id]).length;
  const complete = done === step.tasks.length && step.tasks.length > 0;
  const kind = KIND[step.kind];

  return (
    <li className={cx('panel overflow-hidden', complete && 'opacity-80')}>
      <Disclosure
        defaultOpen={defaultOpen}
        buttonClassName="hover:bg-panel-2 p-4"
        summary={
          <span className="flex flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-ink-faint num text-sm font-semibold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={cx('font-semibold', complete && 'text-ink-muted')}>
                {step.title}
              </span>
              <Badge tone={kind.tone}>{kind.label}</Badge>
              <Badge tone={complete ? 'ok' : 'neutral'}>
                {done}/{step.tasks.length} tasks
              </Badge>
            </span>
            <span className="text-ink-muted text-sm">{step.summary}</span>
          </span>
        }
      >
        <div className="border-line border-t px-4 pt-2 pb-4">
          {step.body?.map((p) => (
            <p key={p} className="text-ink-muted mt-2 text-sm leading-relaxed">
              {p}
            </p>
          ))}

          <SubHeading>Checklist</SubHeading>
          <ul className="space-y-2">
            {step.tasks.map((task) => (
              <li key={task.id}>
                <Checkbox
                  checked={!!tasks[task.id]}
                  onChange={() => toggleTask(task.id)}
                  strikeWhenChecked
                  label={task.label}
                />
              </li>
            ))}
          </ul>

          {step.milestoneIds?.length ? (
            <>
              <SubHeading>Milestones</SubHeading>
              <div className="grid gap-2 md:grid-cols-2">
                {step.milestoneIds.map((id) => (
                  <MilestoneCard key={id} schematicId={id} />
                ))}
              </div>
            </>
          ) : null}

          {step.researchIds?.length ? (
            <>
              <SubHeading>MAM research</SubHeading>
              <ResearchList ids={step.researchIds} />
            </>
          ) : null}

          {step.layoutIds?.length ? (
            <>
              <SubHeading>Factory layouts</SubHeading>
              <div className="grid gap-2 md:grid-cols-2">
                {step.layoutIds.map((id) => {
                  const layout = LAYOUT_BY_ID.get(id);
                  return layout ? <LayoutSummaryCard key={id} layout={layout} /> : null;
                })}
              </div>
            </>
          ) : null}

          {step.siteIds?.length ? (
            <>
              <SubHeading>Sites</SubHeading>
              <SiteChips ids={step.siteIds} />
            </>
          ) : null}

          {step.explore?.length ? (
            <>
              <SubHeading>Nearest to your base</SubHeading>
              <ExploreTargets targets={step.explore} />
            </>
          ) : null}

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
      </Disclosure>
    </li>
  );
}
