import { Link } from 'react-router';
import { Badge } from '../../components/Badge.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import { ItemAmounts } from '../../components/ItemAmounts.tsx';
import { LAYOUTS, PHASE_BY_NUMBER } from '../../content/index.ts';
import { useProgress } from '../../state/progress.ts';

/** Space Elevator phase: parts, what it unlocks, and layouts that make each part. */
export function PhaseCard({ phase }: { phase: number }) {
  const data = PHASE_BY_NUMBER.get(phase);
  const delivered = useProgress((s) => !!s.phases[String(phase)]);
  const toggle = useProgress((s) => s.togglePhase);
  if (!data) return null;

  const layoutsFor = (item: string) =>
    LAYOUTS.filter((l) => l.targets.some((t) => t.item === item));

  return (
    <section
      aria-labelledby={`phase-${phase}`}
      className="border-danger/40 from-danger/10 rounded-lg border bg-gradient-to-br to-transparent p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`phase-${phase}`} className="text-lg">
            Space Elevator Phase {phase}: {data.name}
          </h2>
          <p className="text-ink-muted text-sm">Unlocks {data.unlocks}</p>
        </div>
        <Badge tone={delivered ? 'ok' : 'danger'}>{delivered ? 'Delivered' : 'To deliver'}</Badge>
      </div>
      <ItemAmounts
        items={data.parts.map((p) => ({ item: p.item, amount: p.rate }))}
        className="mt-3"
      />
      <ul className="text-ink-muted mt-3 space-y-1 text-sm">
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
      <Checkbox
        className="mt-3"
        checked={delivered}
        onChange={() => toggle(phase)}
        label={`Phase ${phase} delivered`}
      />
    </section>
  );
}
