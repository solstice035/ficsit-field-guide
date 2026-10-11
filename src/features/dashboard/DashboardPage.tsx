import { Link } from 'react-router';
import { Badge } from '../../components/Badge.tsx';
import { cx } from '../../components/cx.ts';
import { Panel } from '../../components/Panel.tsx';
import { ProgressBar } from '../../components/ProgressBar.tsx';
import { SPACE_ELEVATOR_PHASES, TIERS } from '../../content/index.ts';
import { COLLECTIBLES } from '../../data/gameData.ts';
import { useExplore } from '../../state/explore.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { COLLECTIBLE_META } from '../explore/nearby.ts';
import { useAllTierProgress } from '../guide/progress.ts';

export function DashboardPage() {
  const currentTier = useSettings((s) => s.currentTier);
  const tasks = useProgress((s) => s.tasks);
  const phases = useProgress((s) => s.phases);
  const collected = useExplore((s) => s.collected);
  const progress = useAllTierProgress();

  const tier = TIERS[currentTier] ?? TIERS[0]!;
  const openSteps = tier.steps.filter((s) => s.tasks.some((t) => !tasks[t.id]));
  const nextStep = openSteps[0];
  const laterSteps = openSteps.slice(1, 4);
  const totals = progress.reduce(
    (acc, p) => ({ done: acc.done + p.done, total: acc.total + p.total }),
    { done: 0, total: 0 },
  );

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-accent-strong text-sm font-semibold tracking-wide uppercase">
          Rocky Desert · Update 1.2
        </p>
        <h1 className="text-3xl sm:text-4xl">From drop pod to Project Assembly</h1>
        <p className="text-ink-muted max-w-3xl">
          A tier-by-tier plan for a Rocky Desert start. It covers what to build, where to build it,
          how big to make it, and what to collect on the way.
        </p>
      </header>

      <Panel variant="hero">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <p className="text-accent-strong text-xs font-semibold tracking-wide uppercase">
              You are on Tier {tier.tier} · {tier.title}
            </p>
            <ProgressBar
              value={progress[tier.tier]?.done ?? 0}
              max={progress[tier.tier]?.total ?? 0}
              label={`Tier ${tier.tier} progress`}
              className="mt-2 max-w-md"
            />
            {nextStep ? (
              <>
                <p className="eyebrow mt-5">Next step</p>
                <h2 className="mt-1 text-2xl">{nextStep.title}</h2>
                <p className="text-ink-muted mt-2">{nextStep.summary}</p>
                <Link
                  to={`/tier/${tier.tier}`}
                  className="bg-accent text-accent-ink mt-4 inline-block rounded-md px-4 py-2 font-semibold no-underline hover:no-underline"
                >
                  Continue Tier {tier.tier}
                </Link>
                {laterSteps.length > 0 && (
                  <>
                    <p className="eyebrow mt-6">Then</p>
                    <ol className="mt-2 space-y-1.5 text-sm">
                      {laterSteps.map((s) => (
                        <li key={s.id} className="flex gap-2">
                          <span aria-hidden="true" className="text-ink-faint">
                            →
                          </span>
                          <span className="text-ink-muted">{s.title}</span>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </>
            ) : (
              <>
                <h2 className="mt-5 text-2xl">Tier {tier.tier} is complete</h2>
                <p className="text-ok mt-2">
                  Every step in this tier is ticked off.{' '}
                  {tier.tier < 9 && (
                    <Link to={`/tier/${tier.tier + 1}`}>On to Tier {tier.tier + 1}</Link>
                  )}
                </p>
              </>
            )}
          </div>

          <div className="border-line lg:border-l lg:pl-8">
            <h2 className="eyebrow">Overall</h2>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="num text-3xl font-bold">
                {totals.total ? Math.round((totals.done / totals.total) * 100) : 0}%
              </span>
              <span className="text-ink-faint num text-sm">
                {totals.done} of {totals.total} tasks and milestones
              </span>
            </p>
            <ProgressBar
              value={totals.done}
              max={totals.total}
              label="Overall progress"
              showText={false}
              className="mt-2"
            />
            <h3 className="eyebrow mt-6 mb-2">Space Elevator</h3>
            <ul className="space-y-1.5 text-sm">
              {SPACE_ELEVATOR_PHASES.map((p) => (
                <li key={p.phase} className="flex items-center justify-between gap-2">
                  <span className="text-ink-muted">
                    Phase {p.phase}: {p.name}
                  </span>
                  <Badge tone={phases[String(p.phase)] ? 'ok' : 'neutral'}>
                    {phases[String(p.phase)] ? 'Delivered' : `Tier ${p.deliverInTier}`}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Tiers">
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          {TIERS.map((t, i) => {
            const isCurrent = t.tier === tier.tier;
            return (
              <li key={t.tier}>
                <Link
                  to={`/tier/${t.tier}`}
                  className={cx(
                    'tile hover:bg-panel-2 flex h-full flex-col p-3 no-underline hover:no-underline',
                    isCurrent && 'bg-panel-3 shadow-[inset_3px_0_0_var(--color-accent)]',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-accent-strong text-sm font-bold">Tier {t.tier}</span>
                    {isCurrent && <Badge tone="accent">Current</Badge>}
                  </span>
                  <span className="text-ink mb-2 block text-sm">{t.title}</span>
                  <ProgressBar
                    value={progress[i]?.done ?? 0}
                    max={progress[i]?.total ?? 0}
                    label={`Tier ${t.tier} progress`}
                    className="mt-auto"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Alien artefacts" actions={<Link to="/explore">Open Explore →</Link>}>
        <ul className="grid gap-6 sm:grid-cols-3">
          {(['mercerSphere', 'somersloop', 'hardDrive'] as const).map((type) => {
            const all = COLLECTIBLES.filter((c) => c.type === type);
            const got = all.filter((c) => collected[c.id]).length;
            return (
              <li key={type}>
                <p className="text-ink-muted font-medium">{COLLECTIBLE_META[type].plural}</p>
                <p className="num text-3xl font-bold">
                  {got}
                  <span className="text-ink-faint text-base font-normal"> / {all.length}</span>
                </p>
                <p className="text-ink-faint mt-1 text-xs">{COLLECTIBLE_META[type].blurb}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
