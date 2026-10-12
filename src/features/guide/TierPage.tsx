import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { Badge } from '../../components/Badge.tsx';
import { Disclosure } from '../../components/Disclosure.tsx';
import { ProgressBar } from '../../components/ProgressBar.tsx';
import { Switch } from '../../components/Switch.tsx';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import { stepStates } from '../../lib/progress/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { StepRow } from './StepRow.tsx';
import { TierCompleteMoment } from './TierCompleteMoment.tsx';
import { TierTabs } from './TierTabs.tsx';
import { TIER_PANEL_ID, tierTabId } from './tierTabIds.ts';
import { useProgressFlags, useTierProgress } from './progress.ts';
import { useFreshUntilSeen } from './useNextTask.ts';
import { stepAnchor } from './stepMeta.ts';

export function TierPage() {
  const { tier: param } = useParams();
  const { hash } = useLocation();
  const tier = TIER_BY_NUMBER.get(Number(param));
  const currentTier = useSettings((s) => s.currentTier);
  const setCurrentTier = useSettings((s) => s.setCurrentTier);
  const hideCompleted = useSettings((s) => s.hideCompleted);
  const setHideCompleted = useSettings((s) => s.setHideCompleted);
  const flags = useProgressFlags();
  const progress = useTierProgress(tier ?? TIER_BY_NUMBER.get(0)!);
  // Same rule as the NEXT line: complete once no step is left open (skipped counts).
  const complete = !!tier && stepStates(tier, flags).every((s) => s === 'done' || s === 'skipped');
  const momentFresh = useFreshUntilSeen(complete ? `complete-${param}` : `open-${param}`);

  // Router links to `#step-…` don't scroll by themselves.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: 'start' });
  }, [hash, param]);

  if (!tier) return <Navigate to="/tier/0" replace />;

  const states = stepStates(tier, flags);
  const currentIndex = states.indexOf('current');
  const finished = states.filter((s) => s === 'done' || s === 'skipped').length;
  const visible = tier.steps
    .map((step, index) => ({ step, index, state: states[index]! }))
    .filter((s) => !hideCompleted || (s.state !== 'done' && s.state !== 'skipped'));

  return (
    <div className="space-y-6">
      <TierTabs activeTier={tier.tier} />

      <div
        role="tabpanel"
        id={TIER_PANEL_ID}
        aria-labelledby={tierTabId(tier.tier)}
        className="space-y-4"
      >
        <header className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl">{tier.title}</h1>
              <p className="text-ink-muted mt-1">{tier.tagline}</p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <p className="num text-sm">
                <b>{progress.done}</b>{' '}
                <span className="text-ink-muted">of {progress.total} done</span>
              </p>
              <ProgressBar
                value={progress.done}
                max={progress.total}
                label={`Tier ${tier.tier} progress`}
                showText={false}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {currentIndex >= 0 && (
              <Link
                to={{ hash: stepAnchor(tier.steps[currentIndex]!.id) }}
                className="text-ink-muted hover:text-ink inline-flex min-h-11 items-center text-sm"
              >
                Go to step {String(currentIndex + 1).padStart(2, '0')}
              </Link>
            )}
            <Switch
              checked={hideCompleted}
              onChange={setHideCompleted}
              label={<span className="text-sm">Hide completed</span>}
            />
            {currentTier === tier.tier ? (
              <Badge>Your current tier</Badge>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTier(tier.tier)}
                className="border-line-strong hover:border-ink-faint min-h-11 rounded border px-3 text-sm"
              >
                Set as my current tier
              </button>
            )}
          </div>
          <Disclosure
            summary={<span className="text-sm font-semibold">Why this tier</span>}
            buttonClassName="min-h-11 items-center"
          >
            <div className="text-ink-muted grid gap-6 pt-2 pb-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="max-w-prose space-y-3">
                <p className="text-ink-faint text-sm">Unlocked by: {tier.unlockedBy}</p>
                {tier.briefing.map((p) => (
                  <p key={p} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              <div>
                <h2 className="text-ink mb-2 text-sm">Goals</h2>
                <ul className="list-disc space-y-1.5 pl-5">
                  {tier.goals.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Disclosure>
        </header>

        {complete && currentTier === tier.tier && (
          <TierCompleteMoment
            tier={tier}
            onAdvance={() => setCurrentTier(tier.tier + 1)}
            fresh={momentFresh}
            region
            className="panel-hero p-5 sm:p-7"
          />
        )}

        <section aria-labelledby="queue-heading">
          <h2 id="queue-heading" className="sr-only">
            Steps
          </h2>
          {hideCompleted && finished > 0 && (
            <p className="text-ink-faint mb-2 text-sm">
              {finished} finished {finished === 1 ? 'step' : 'steps'} hidden.
            </p>
          )}
          <ol className="space-y-1.5">
            {visible.map(({ step, index, state }) => (
              <StepRow
                key={step.id}
                step={step}
                index={index}
                state={state}
                phase={tier.spaceElevatorPhase}
              />
            ))}
          </ol>
          {visible.length === 0 && (
            <p className="text-ink-muted">Every step in this tier is finished.</p>
          )}
        </section>
      </div>
    </div>
  );
}
