import { Link } from 'react-router';
import { Badge } from '../../components/Badge.tsx';
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
  const nextStep = tier.steps.find((s) => s.tasks.some((t) => !tasks[t.id]));
  const totals = progress.reduce(
    (acc, p) => ({ done: acc.done + p.done, total: acc.total + p.total }),
    { done: 0, total: 0 },
  );

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title={`You are on Tier ${tier.tier}: ${tier.title}`} className="lg:col-span-2">
          <ProgressBar
            value={progress[tier.tier]?.done ?? 0}
            max={progress[tier.tier]?.total ?? 0}
            label={`Tier ${tier.tier} progress`}
          />
          {nextStep ? (
            <div className="mt-4">
              <p className="text-ink-faint text-xs font-semibold tracking-wide uppercase">
                Next step
              </p>
              <p className="mt-1 text-lg font-semibold">{nextStep.title}</p>
              <p className="text-ink-muted mt-1">{nextStep.summary}</p>
              <Link
                to={`/tier/${tier.tier}`}
                className="bg-accent text-accent-ink mt-3 inline-block rounded px-4 py-2 font-semibold no-underline hover:no-underline"
              >
                Continue Tier {tier.tier}
              </Link>
            </div>
          ) : (
            <p className="text-ok mt-4">
              Every step in this tier is ticked off.{' '}
              {tier.tier < 9 && (
                <Link to={`/tier/${tier.tier + 1}`}>On to Tier {tier.tier + 1}</Link>
              )}
            </p>
          )}
        </Panel>

        <Panel title="Overall">
          <ProgressBar value={totals.done} max={totals.total} label="Overall progress" />
          <p className="text-ink-muted num mt-2 text-sm">
            {totals.done} of {totals.total} tasks and milestones
          </p>
          <h3 className="mt-4 mb-2 text-sm">Space Elevator</h3>
          <ul className="space-y-1 text-sm">
            {SPACE_ELEVATOR_PHASES.map((p) => (
              <li key={p.phase} className="flex items-center justify-between gap-2">
                <span>
                  Phase {p.phase}: {p.name}
                </span>
                <Badge tone={phases[String(p.phase)] ? 'ok' : 'neutral'}>
                  {phases[String(p.phase)] ? 'Delivered' : `Tier ${p.deliverInTier}`}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Tiers">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t, i) => (
            <li key={t.tier}>
              <Link
                to={`/tier/${t.tier}`}
                className="border-line hover:border-accent bg-panel-2 block rounded-md border p-3 no-underline hover:no-underline"
              >
                <span className="text-accent-strong text-sm font-bold">Tier {t.tier}</span>
                <span className="text-ink block truncate text-sm">{t.title}</span>
                <ProgressBar
                  value={progress[i]?.done ?? 0}
                  max={progress[i]?.total ?? 0}
                  label={`Tier ${t.tier} progress`}
                  className="mt-2"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Alien artefacts" actions={<Link to="/explore">Open Explore</Link>}>
        <ul className="grid gap-3 sm:grid-cols-3">
          {(['mercerSphere', 'somersloop', 'hardDrive'] as const).map((type) => {
            const all = COLLECTIBLES.filter((c) => c.type === type);
            const got = all.filter((c) => collected[c.id]).length;
            return (
              <li key={type} className="border-line bg-panel-2 rounded-md border p-3">
                <p className="font-semibold">{COLLECTIBLE_META[type].plural}</p>
                <p className="num text-2xl font-bold">
                  {got}
                  <span className="text-ink-faint text-base font-normal"> / {all.length}</span>
                </p>
                <p className="text-ink-faint text-xs">{COLLECTIBLE_META[type].blurb}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
