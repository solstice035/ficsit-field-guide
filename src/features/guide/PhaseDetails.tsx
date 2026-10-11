import { Link } from 'react-router';
import { ItemAmounts } from '../../components/ItemAmounts.tsx';
import { LAYOUTS, PHASE_BY_NUMBER } from '../../content/index.ts';

/** A Space Elevator phase's parts, what it unlocks and which layouts make each part. */
export function PhaseDetails({ phase }: { phase: number }) {
  const data = PHASE_BY_NUMBER.get(phase);
  if (!data) return null;
  const layoutsFor = (item: string) =>
    LAYOUTS.filter((l) => l.targets.some((t) => t.item === item));

  return (
    <div className="space-y-2">
      <p className="text-elevator text-sm font-semibold">
        Phase {phase}: {data.name} · unlocks {data.unlocks}
      </p>
      <ItemAmounts items={data.parts.map((p) => ({ item: p.item, amount: p.rate }))} />
      <ul className="text-ink-muted space-y-1 text-sm">
        {data.parts.map((part) => {
          const layouts = layoutsFor(part.item);
          return layouts.length ? (
            <li key={part.item}>
              Make it with:{' '}
              {layouts.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && ', '}
                  <Link to={`/layouts/${l.id}`}>{l.name}</Link>
                </span>
              ))}
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}
