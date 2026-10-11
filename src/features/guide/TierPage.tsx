import { Navigate, useParams } from 'react-router';
import { Badge } from '../../components/Badge.tsx';
import { Panel } from '../../components/Panel.tsx';
import { ProgressBar } from '../../components/ProgressBar.tsx';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import { MILESTONES_BY_TIER } from '../../data/gameData.ts';
import { isStepOpen } from '../../lib/progress/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { MilestoneCard } from './MilestoneCard.tsx';
import { PhaseCard } from './PhaseCard.tsx';
import { StepCard } from './StepCard.tsx';
import { TierTabs } from './TierTabs.tsx';
import { TIER_PANEL_ID, tierTabId } from './tierTabIds.ts';
import { useProgressFlags, useTierProgress } from './progress.ts';

export function TierPage() {
  const { tier: param } = useParams();
  const tierNumber = Number(param);
  const tier = TIER_BY_NUMBER.get(tierNumber);
  const currentTier = useSettings((s) => s.currentTier);
  const setCurrentTier = useSettings((s) => s.setCurrentTier);
  const flags = useProgressFlags();
  const progress = useTierProgress(tier ?? TIER_BY_NUMBER.get(0)!);

  if (!tier) return <Navigate to="/tier/0" replace />;

  const milestones = MILESTONES_BY_TIER.get(tier.tier) ?? [];
  const firstOpen = tier.steps.findIndex((s) => isStepOpen(s, flags));

  return (
    <div className="space-y-6">
      <TierTabs activeTier={tier.tier} />

      <div
        role="tabpanel"
        id={TIER_PANEL_ID}
        aria-labelledby={tierTabId(tier.tier)}
        className="space-y-10"
      >
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-accent-strong text-sm font-semibold tracking-wide uppercase">
              Tier {tier.tier}
            </p>
            <h1 className="text-2xl sm:text-3xl">{tier.title}</h1>
            <p className="text-ink-muted mt-1">{tier.tagline}</p>
            <p className="text-ink-faint mt-1 text-sm">Unlocked by: {tier.unlockedBy}</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <ProgressBar
              value={progress.done}
              max={progress.total}
              label={`Tier ${tier.tier} progress`}
            />
            {currentTier === tier.tier ? (
              <Badge tone="accent">Your current tier</Badge>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTier(tier.tier)}
                className="border-line-strong hover:border-accent rounded border px-3 py-1 text-sm"
              >
                Set as my current tier
              </button>
            )}
          </div>
        </header>

        <Panel variant="hero">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section aria-labelledby="briefing-heading">
              <h2 id="briefing-heading" className="eyebrow mb-2">
                Briefing
              </h2>
              <div className="space-y-3">
                {tier.briefing.map((p) => (
                  <p key={p} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </section>
            <section aria-labelledby="goals-heading" className="border-line lg:border-l lg:pl-8">
              <h2 id="goals-heading" className="eyebrow mb-2">
                Goals
              </h2>
              <ul className="text-ink-muted list-disc space-y-1.5 pl-5">
                {tier.goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          </div>
        </Panel>

        {tier.spaceElevatorPhase !== undefined && <PhaseCard phase={tier.spaceElevatorPhase} />}

        <Panel
          title={tier.tier === 0 ? 'HUB Upgrades' : 'Milestones'}
          description="Costs and unlocks come straight from the game data. Tick them off as you submit."
        >
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {milestones.map((m) => (
              <MilestoneCard key={m.id} schematicId={m.id} />
            ))}
          </div>
        </Panel>

        <Panel title="Step by step">
          <ol className="space-y-3">
            {tier.steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                defaultOpen={index === (firstOpen === -1 ? -2 : firstOpen)}
              />
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
