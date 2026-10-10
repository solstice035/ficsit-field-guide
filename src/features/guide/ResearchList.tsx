import { Badge } from '../../components/Badge.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import { ItemAmounts } from '../../components/ItemAmounts.tsx';
import { SCHEMATIC_BY_ID } from '../../data/gameData.ts';
import { unlockSummary } from '../../data/unlocks.ts';
import { useProgress } from '../../state/progress.ts';

/** MAM research nodes with cost and a "researched" checkbox. */
export function ResearchList({ ids }: { ids: readonly string[] }) {
  const research = useProgress((s) => s.research);
  const toggle = useProgress((s) => s.toggleResearch);
  return (
    <ul className="space-y-2">
      {ids.map((id) => {
        const s = SCHEMATIC_BY_ID.get(id);
        if (!s) return null;
        const unlocks = unlockSummary(s);
        return (
          <li key={id} className="border-line bg-panel-2 rounded-md border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Checkbox
                checked={!!research[id]}
                onChange={() => toggle(id)}
                label={<span className="font-medium">{s.name}</span>}
                description={
                  [...unlocks.recipes, ...unlocks.scanner.map((x) => `scan: ${x}`)].join(' · ') ||
                  undefined
                }
              />
              <Badge tone="info">MAM · {s.mamTree ?? 'Research'}</Badge>
            </div>
            <ItemAmounts items={s.cost} className="mt-2" />
          </li>
        );
      })}
    </ul>
  );
}
