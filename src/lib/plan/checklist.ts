import { itemName } from '../../data/gameData.ts';
import type { Conveyance } from '../calc/conveyance.ts';
import type { FactoryPlan } from './factoryPlan.ts';
import { formatClock, formatRate } from './format.ts';

export interface ChecklistStep {
  id: string;
  title: string;
  details: string[];
}

export function describeConveyance(c: Conveyance): string {
  const name = c.kind === 'belt' ? 'Belt' : 'Pipe';
  return c.lines > 1 ? `${c.lines}× ${name} Mk.${c.mk}` : `${name} Mk.${c.mk}`;
}

/** Turns a plan into ordered, tickable build steps. Step IDs are stable per plan content. */
export function buildChecklist(plan: FactoryPlan): ChecklistStep[] {
  const steps: ChecklistStep[] = [];

  for (const e of plan.extraction) {
    const clock = formatClock(e.plan.clockAcrossNodes);
    const isWater = e.building.id === 'Build_WaterPump_C';
    steps.push({
      id: `extract:${e.item}`,
      title: isWater
        ? `Place ${e.plan.nodes}× ${e.building.name} on open water at ${clock}`
        : `Place ${e.plan.nodes}× ${e.building.name} on ${e.purity} ${itemName(e.item)} node${e.plan.nodes > 1 ? 's' : ''} at ${clock}`,
      details: [
        `Supplies ${formatRate(e.rate, e.item)} (${formatRate(e.plan.perNode, e.item)} per node at your preferred clock).`,
        `Run a ${describeConveyance(e.conveyance)} to the first manifold.`,
        ...(e.pressurizers
          ? ['Place a Resource Well Pressurizer on the well core first (150 MW).']
          : []),
      ],
    });
  }

  for (const imp of plan.imports) {
    steps.push({
      id: `import:${imp.item}`,
      title: `Bring in ${formatRate(imp.rate, imp.item)} ${itemName(imp.item)}`,
      details: [
        'No extractor or recipe in this plan. Feed it from storage, another factory or by hand.',
      ],
    });
  }

  for (const g of plan.groups) {
    const row = plan.floor.rows.find((r) => r.key === g.key);
    const clocks = g.split.groups.map((s) => `${s.count}× at ${formatClock(s.clock)}`).join(' + ');
    steps.push({
      id: `group:${g.key}`,
      title: `Build ${g.split.count}× ${g.building.name}: ${g.recipe.name}${g.recipe.alternate ? ' (alternate)' : ''}`,
      details: [
        `Clock: ${clocks}${g.shards ? ` (${g.shards} Power Shard${g.shards > 1 ? 's' : ''})` : ''}${g.sloopsPerMachine ? `, ${g.sloopsPerMachine} Somersloop(s) each` : ''}.`,
        `In: ${g.inputs.map((i) => `${formatRate(i.rate, i.item)} ${itemName(i.item)}`).join(', ')}.`,
        `Out: ${g.outputs.map((o) => `${formatRate(o.rate, o.item)} ${itemName(o.item)}`).join(', ')}.`,
        ...(row
          ? [
              `Manifold footprint ≈ ${row.foundationsLong} × ${row.foundationsDeep} foundations (${Math.round(row.lengthM)} × ${Math.round(row.depthM)} m).`,
            ]
          : []),
      ],
    });
  }

  steps.push({
    id: 'power',
    title: `Connect power: ${Math.round(plan.power.totalMW * 10) / 10} MW`,
    details: [
      `Machines ${Math.round(plan.power.productionMW * 10) / 10} MW, extraction ${Math.round(plan.power.extractionMW * 10) / 10} MW.`,
      'Leave about 20% headroom on your grid for start-up and future expansion.',
    ],
  });

  for (const o of plan.outputs) {
    const edge = plan.edges.find((e) => e.to.kind === 'output' && e.item === o.item);
    steps.push({
      id: `output:${o.item}`,
      title: `Route ${formatRate(o.rate, o.item)} ${itemName(o.item)} to storage, the HUB or the next factory`,
      details: edge ? [`Use ${describeConveyance(edge.conveyance)}.`] : [],
    });
  }

  for (const s of plan.surplus) {
    steps.push({
      id: `surplus:${s.item}`,
      title: `Handle surplus ${itemName(s.item)}: ${formatRate(s.rate, s.item)}`,
      details: ['Store it, use it elsewhere, or sink it (fluids must be packaged first).'],
    });
  }

  return steps;
}
