import { Link } from 'react-router';
import { CheckGlyph } from '../../components/KindGlyph.tsx';
import { Panel } from '../../components/Panel.tsx';
import { ProgressBar } from '../../components/ProgressBar.tsx';
import { cx } from '../../components/cx.ts';
import { SPACE_ELEVATOR_PHASES, TIERS } from '../../content/index.ts';
import { COLLECTIBLES } from '../../data/gameData.ts';
import { useExplore } from '../../state/explore.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { COLLECTIBLE_META } from '../explore/nearby.ts';
import { useAllTierProgress } from '../guide/progress.ts';
import { NextHero } from './NextHero.tsx';

export function DashboardPage() {
  const currentTier = useSettings((s) => s.currentTier);
  const phases = useProgress((s) => s.phases);
  const collected = useExplore((s) => s.collected);
  const progress = useAllTierProgress();
  const totals = progress.reduce(
    (acc, p) => ({ done: acc.done + p.done, total: acc.total + p.total }),
    { done: 0, total: 0 },
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl">From drop pod to Project Assembly</h1>

      <NextHero />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="run-heading">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="run-heading" className="text-lg">
              The run
            </h2>
            <p className="num text-ink-muted text-sm">
              <b className="text-ink">{totals.done}</b> of {totals.total} tasks done
            </p>
          </div>
          <ol className="space-y-1.5">
            {TIERS.map((t, i) => {
              const p = progress[i] ?? { done: 0, total: 0 };
              const current = t.tier === currentTier;
              const complete = p.total > 0 && p.done === p.total;
              return (
                <li key={t.tier}>
                  <Link
                    to={`/tier/${t.tier}`}
                    className={cx(
                      'hover:bg-panel-2 grid min-h-11 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg border px-3 py-2 no-underline hover:no-underline sm:px-4',
                      'md:grid-cols-[2.25rem_minmax(0,1fr)_10rem_6.5rem]',
                      current ? 'step-current bg-panel' : 'border-transparent',
                    )}
                  >
                    <span
                      className={cx(
                        'num col-start-1 row-start-1 font-semibold',
                        current ? 'text-accent-strong' : 'text-ink-faint',
                      )}
                    >
                      <span aria-hidden="true">T{t.tier}</span>
                      <span className="sr-only">Tier {t.tier}</span>
                    </span>
                    <span
                      className={cx(
                        'min-w-0 font-semibold',
                        current ? 'text-ink' : 'text-ink-muted',
                      )}
                    >
                      {t.title}
                    </span>
                    <ProgressBar
                      value={p.done}
                      max={p.total}
                      label={`Tier ${t.tier} progress`}
                      showText={false}
                      className="col-span-2 col-start-2 row-start-2 md:col-span-1 md:col-start-3 md:row-start-1"
                    />
                    <span className="col-start-3 row-start-1 justify-self-end text-sm md:col-start-4">
                      {current ? (
                        <span className="text-accent-strong font-semibold">Current</span>
                      ) : complete ? (
                        <span className="text-ok flex items-center gap-1 font-semibold">
                          <CheckGlyph />
                          Done
                        </span>
                      ) : (
                        <span className="num text-ink-faint">
                          {p.done} / {p.total}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="elevator-heading">
          <h2 id="elevator-heading" className="mb-3 text-lg">
            Space Elevator
          </h2>
          <ol className="space-y-2">
            {SPACE_ELEVATOR_PHASES.map((p) => {
              const delivered = !!phases[String(p.phase)];
              return (
                <li key={p.phase} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="text-elevator font-semibold">Phase {p.phase}</span>{' '}
                    <span className="text-ink-muted">{p.name}</span>
                  </span>
                  {delivered ? (
                    <span className="text-ok flex items-center gap-1 font-semibold">
                      <CheckGlyph />
                      Delivered
                    </span>
                  ) : (
                    <span className="text-ink-faint">Tier {p.deliverInTier}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

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
