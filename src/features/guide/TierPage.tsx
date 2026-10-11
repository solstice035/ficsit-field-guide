import { Navigate, useParams } from 'react-router';
import { Badge } from '../../components/Badge.tsx';
import { Panel } from '../../components/Panel.tsx';
import { ProgressBar } from '../../components/ProgressBar.tsx';
import { TIER_BY_NUMBER } from '../../content/index.ts';
import { MILESTONES_BY_TIER } from '../../data/gameData.ts';
import { useProgress } from '../../state/progress.ts';
import { useSettings } from '../../state/settings.ts';
import { MilestoneCard } from './MilestoneCard.tsx';
import { PhaseCard } from './PhaseCard.tsx';
import { StepCard } from './StepCard.tsx';
import { TierTabs } from './TierTabs.tsx';
import { TIER_PANEL_ID, tierTabId } from './tierTabIds.ts';
import { useTierProgress } from './progress.ts';

export function TierPage() {
  const { tier: param } = useParams();
  const tierNumber = Number(param);
  const tier = TIER_BY_NUMBER.get(tierNumber);
  const currentTier = useSettings((s) => s.currentTier);
  const setCurrentTier = useSettings((s) => s.setCurrentTier);
  const tasks = useProgress((s) => s.tasks);
  const progress = useTierProgress(tier ?? TIER_BY_NUMBER.get(0)!);

  if (!tier) return <Navigate to="/tier/0" replace />;

  const milestones = MILESTONES_BY_TIER.get(tier.tier) ?? [];
  const firstOpen = tier.steps.findIndex((s) => s.tasks.some((t) => !tasks[t.id]));

  return (
    <div className="space-y-6">
      <TierTabs activeTier={tier.tier} />

      <div
        role="tabpanel"
        id={TIER_PANEL_ID}
        aria-labelledby={tierTabId(tier.tier)}
        className="space-y-6"
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

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Briefing" className="lg:col-span-2">
            <div className="space-y-2">
              {tier.briefing.map((p) => (
                <p key={p} className="text-ink-muted leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Panel>
          <Panel title="Goals">
            <ul className="text-ink-muted list-disc space-y-1 pl-5">
              {tier.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </Panel>
        </div>

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

        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="mb-3 text-lg">
            Step by step
          </h2>
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
        </section>
      </div>
    </div>
  );
}
