import { Badge, PurityBadge, TierBadge } from '../../components/Badge.tsx';
import { Checkbox } from '../../components/Checkbox.tsx';
import { itemTier } from '../../data/availability.ts';
import { itemName } from '../../data/gameData.ts';
import { buildChecklist, describeConveyance } from '../../lib/plan/checklist.ts';
import type { FactoryPlan, FlowNodeRef } from '../../lib/plan/factoryPlan.ts';
import { formatClock, formatMW, formatNumber, formatRate } from '../../lib/plan/format.ts';
import { useProgress } from '../../state/progress.ts';

function nodeLabel(plan: FactoryPlan, ref: FlowNodeRef): string {
  switch (ref.kind) {
    case 'group':
      return plan.groups.find((g) => g.key === ref.key)?.recipe.name ?? ref.key;
    case 'extract':
      return `${itemName(ref.key)} extraction`;
    case 'import':
      return `Import ${itemName(ref.key)}`;
    case 'output':
      return plan.generators ? plan.generators.building.name : 'Output';
    case 'surplus':
      return 'Surplus';
  }
}

export function MachinesTable({ plan }: { plan: FactoryPlan }) {
  if (!plan.groups.length)
    return <p className="text-ink-muted text-sm">No machines in this plan.</p>;
  return (
    <div className="overflow-x-auto">
      <table>
        <caption className="sr-only">Machines by production stage</caption>
        <thead>
          <tr>
            <th scope="col">Recipe</th>
            <th scope="col">Building</th>
            <th scope="col" className="text-right">
              Count
            </th>
            <th scope="col">Clock</th>
            <th scope="col" className="text-right">
              Power
            </th>
            <th scope="col">Inputs /min</th>
            <th scope="col">Outputs /min</th>
          </tr>
        </thead>
        <tbody>
          {plan.groups.map((g) => (
            <tr key={g.key} className="border-line border-t align-top">
              <td className="py-2 pr-3">
                <span className="font-medium">{g.recipe.name}</span>{' '}
                {g.recipe.alternate && <Badge tone="info">Alt</Badge>}
                <div className="text-ink-faint text-xs">Stage {g.stage}</div>
              </td>
              <td className="pr-3">{g.building.name}</td>
              <td className="num pr-3 text-right">
                {g.split.count}
                <div className="text-ink-faint text-xs">{formatNumber(g.machines, 3)} exact</div>
              </td>
              <td className="num pr-3">
                {g.split.groups.map((s) => `${s.count}× ${formatClock(s.clock)}`).join(' + ')}
                {g.shards > 0 && <div className="text-ink-faint text-xs">{g.shards} shards</div>}
                {g.sloopsPerMachine > 0 && (
                  <div className="text-ink-faint text-xs">{g.sloopsPerMachine} sloops each</div>
                )}
              </td>
              <td className="num pr-3 text-right">{formatMW(g.powerMW)}</td>
              <td className="pr-3 text-xs">
                {g.inputs.map((i) => (
                  <div key={i.item}>
                    {formatRate(i.rate, i.item)} {itemName(i.item)}
                  </div>
                ))}
              </td>
              <td className="text-xs">
                {g.outputs.map((o) => (
                  <div key={o.item}>
                    {formatRate(o.rate, o.item)} {itemName(o.item)}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InputsTables({ plan }: { plan: FactoryPlan }) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <h3 className="mb-2 text-base">Extraction</h3>
        {plan.extraction.length === 0 ? (
          <p className="text-ink-muted text-sm">No raw resources extracted here.</p>
        ) : (
          <table>
            <caption className="sr-only">Raw resource extraction</caption>
            <thead>
              <tr>
                <th scope="col">Resource</th>
                <th scope="col" className="text-right">
                  Needed
                </th>
                <th scope="col">Extractor</th>
                <th scope="col">Purity</th>
                <th scope="col" className="text-right">
                  Nodes
                </th>
                <th scope="col">Clock</th>
                <th scope="col" className="text-right">
                  Power
                </th>
                <th scope="col">Carry with</th>
              </tr>
            </thead>
            <tbody>
              {plan.extraction.map((e) => (
                <tr key={e.key} className="border-line border-t">
                  <td className="py-2 pr-3 font-medium">{itemName(e.item)}</td>
                  <td className="num pr-3 text-right">{formatRate(e.rate, e.item)}</td>
                  <td className="pr-3">{e.building.name}</td>
                  <td className="pr-3">
                    {e.building.id === 'Build_WaterPump_C' ? (
                      <span className="text-ink-faint">n/a</span>
                    ) : (
                      <PurityBadge purity={e.purity} />
                    )}
                  </td>
                  <td className="num pr-3 text-right">
                    {e.plan.nodes}
                    <div className="text-ink-faint text-xs">
                      {formatNumber(e.plan.exactNodes, 2)} exact
                    </div>
                  </td>
                  <td className="num pr-3">{formatClock(e.plan.clockAcrossNodes)}</td>
                  <td className="num pr-3 text-right">
                    {formatMW(e.plan.powerMW + e.pressurizers * 150)}
                  </td>
                  <td>{describeConveyance(e.conveyance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {plan.imports.length > 0 && (
        <div>
          <h3 className="mb-2 text-base">Imported</h3>
          <ul className="space-y-1 text-sm">
            {plan.imports.map((i) => (
              <li key={i.item}>
                <span className="num font-semibold">{formatRate(i.rate, i.item)}</span>{' '}
                {itemName(i.item)} <TierBadge tier={itemTier(i.item)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <h3 className="mb-2 text-base">Belts and pipes</h3>
        <table>
          <caption className="sr-only">Connections between machine groups</caption>
          <thead>
            <tr>
              <th scope="col">From</th>
              <th scope="col">To</th>
              <th scope="col">Item</th>
              <th scope="col" className="text-right">
                Rate
              </th>
              <th scope="col">Belt / pipe</th>
            </tr>
          </thead>
          <tbody>
            {plan.edges.map((e) => (
              <tr key={e.id} className="border-line border-t">
                <td className="py-1.5 pr-3">{nodeLabel(plan, e.from)}</td>
                <td className="pr-3">{nodeLabel(plan, e.to)}</td>
                <td className="pr-3">{itemName(e.item)}</td>
                <td className="num pr-3 text-right">{formatRate(e.rate, e.item)}</td>
                <td>
                  {describeConveyance(e.conveyance)}{' '}
                  <span className="text-ink-faint text-xs">
                    {Math.round(e.conveyance.utilisation * 100)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BomTable({ plan, currentTier }: { plan: FactoryPlan; currentTier: number }) {
  return (
    <div className="overflow-x-auto">
      <p className="text-ink-muted mb-2 text-sm">
        Build cost of every machine, extractor and generator in this plan (belts, pipes and
        foundations not included).
      </p>
      <table>
        <caption className="sr-only">Bill of materials</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" className="text-right">
              Amount
            </th>
            <th scope="col">Available from</th>
          </tr>
        </thead>
        <tbody>
          {plan.bom.map((b) => {
            const tier = itemTier(b.item);
            return (
              <tr key={b.item} className="border-line border-t">
                <td className="py-1.5 pr-3">{itemName(b.item)}</td>
                <td className="num pr-3 text-right">{formatNumber(b.amount)}</td>
                <td>
                  <TierBadge tier={tier} />{' '}
                  {tier > currentTier && <span className="text-warn text-xs">above your tier</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Generated build steps, tickable and persisted per layout. */
export function ChecklistView({ plan, layoutId }: { plan: FactoryPlan; layoutId: string }) {
  const tasks = useProgress((s) => s.tasks);
  const toggle = useProgress((s) => s.toggleTask);
  const steps = buildChecklist(plan);
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => {
        const id = `layout:${layoutId}:${step.id}`;
        return (
          <li key={step.id} className="border-line bg-panel-2 rounded-md border p-3">
            <Checkbox
              checked={!!tasks[id]}
              onChange={() => toggle(id)}
              strikeWhenChecked
              label={
                <span className="font-medium">
                  <span className="text-ink-faint num mr-2">{i + 1}.</span>
                  {step.title}
                </span>
              }
            />
            {step.details.length > 0 && (
              <ul className="text-ink-muted mt-1 list-disc space-y-0.5 pl-11 text-sm">
                {step.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
