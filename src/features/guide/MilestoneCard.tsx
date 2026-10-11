import { Badge } from '../../components/Badge.tsx';
import { ItemAmounts } from '../../components/ItemAmounts.tsx';
import { SCHEMATIC_BY_ID } from '../../data/gameData.ts';
import { unlockSummary } from '../../data/unlocks.ts';
import { useProgress } from '../../state/progress.ts';

/** How many unlocks to name before "+N more". */
const KEY_UNLOCKS = 5;

export interface MilestoneCardProps {
  schematicId: string;
}

/**
 * A HUB milestone's cost and key unlocks. Display only: its tick is the
 * step's linked "Submit" task, so there is one control per in-game event.
 */
export function MilestoneCard({ schematicId }: MilestoneCardProps) {
  const schematic = SCHEMATIC_BY_ID.get(schematicId);
  const done = useProgress((s) => !!s.milestones[schematicId]);
  if (!schematic) return null;
  const unlocks = unlockSummary(schematic);
  const key = unlocks.recipes.slice(0, KEY_UNLOCKS);
  const more = unlocks.recipes.length - key.length;

  return (
    <article className="tile p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-semibold">{schematic.name}</h4>
        {done ? <Badge tone="ok">Submitted</Badge> : <Badge>To submit</Badge>}
      </div>
      <div className="mt-2">
        <h5 className="text-ink-faint mb-1 text-xs font-medium">Cost</h5>
        <ItemAmounts items={schematic.cost} />
      </div>
      {(key.length > 0 || unlocks.scanner.length > 0) && (
        <div className="mt-2">
          <h5 className="text-ink-faint mb-1 text-xs font-medium">Unlocks</h5>
          <p className="text-ink-muted text-sm">
            {key.join(' · ')}
            {more > 0 && <span className="text-ink-faint"> +{more} more</span>}
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
