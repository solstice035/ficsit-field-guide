import { Badge } from '../../components/Badge.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import { ItemAmounts } from '../../components/ItemAmounts.tsx';
import { SCHEMATIC_BY_ID } from '../../data/gameData.ts';
import { unlockSummary } from '../../data/unlocks.ts';
import { useProgress } from '../../state/progress.ts';

export interface MilestoneCardProps {
  schematicId: string;
  compact?: boolean;
}

/** A HUB milestone with live cost, unlocks and a "submitted" checkbox. */
export function MilestoneCard({ schematicId, compact }: MilestoneCardProps) {
  const schematic = SCHEMATIC_BY_ID.get(schematicId);
  const done = useProgress((s) => !!s.milestones[schematicId]);
  const toggle = useProgress((s) => s.toggleMilestone);
  if (!schematic) return null;
  const unlocks = unlockSummary(schematic);

  return (
    <article className="tile p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Checkbox
          checked={done}
          onChange={() => toggle(schematicId)}
          label={<span className="font-semibold">{schematic.name}</span>}
        />
        {done ? <Badge tone="ok">Submitted</Badge> : <Badge>Milestone</Badge>}
      </div>
      <div className="mt-2">
        <h4 className="text-ink-faint mb-1 text-xs font-medium tracking-wide uppercase">Cost</h4>
        <ItemAmounts items={schematic.cost} />
      </div>
      {!compact && (unlocks.recipes.length > 0 || unlocks.scanner.length > 0) && (
        <div className="mt-2">
          <h4 className="text-ink-faint mb-1 text-xs font-medium tracking-wide uppercase">
            Unlocks
          </h4>
          <p className="text-ink-muted text-sm">
            {unlocks.recipes.join(' · ')}
            {unlocks.scanner.length > 0 && (
              <span className="text-info"> · Scanner: {unlocks.scanner.join(', ')}</span>
            )}
            {unlocks.inventorySlots > 0 && (
              <span> · +{unlocks.inventorySlots} inventory slots</span>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
