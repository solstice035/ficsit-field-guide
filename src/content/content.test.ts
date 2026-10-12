import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { itemTier, recipeTier } from '../data/availability.ts';
import {
  BUILDING_BY_ID,
  COLLECTIBLES,
  ITEM_BY_ID,
  MILESTONES_BY_TIER,
  NODE_BY_ID,
  RECIPE_BY_ID,
  SCHEMATICS,
  SCHEMATIC_BY_ID,
  itemName,
} from '../data/gameData.ts';
import { buildFactoryPlan } from '../lib/plan/factoryPlan.ts';
import { resolveLayoutConfig } from '../lib/plan/layoutConfig.ts';
import { LAYOUTS, LAYOUT_BY_ID, SITES, SITE_BY_ID, SPACE_ELEVATOR_PHASES, TIERS } from './index.ts';

const allSteps = TIERS.flatMap((t) => t.steps.map((s) => ({ tier: t.tier, step: s })));

describe('tier guides', () => {
  it('covers tiers 0–9 in order', () => {
    expect(TIERS.map((t) => t.tier)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('uses unique step and task IDs', () => {
    const stepIds = allSteps.map(({ step }) => step.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    const taskIds = allSteps.flatMap(({ step }) => step.tasks.map((t) => t.id));
    expect(new Set(taskIds).size).toBe(taskIds.length);
  });

  it('references real milestones in the right tier', () => {
    for (const { tier, step } of allSteps) {
      for (const id of step.milestoneIds ?? []) {
        const s = SCHEMATIC_BY_ID.get(id);
        expect(s, `${step.id} → ${id}`).toBeDefined();
        expect(s?.type === 'tutorial' ? 0 : s?.tier, `${step.id} → ${id}`).toBe(tier);
      }
    }
  });

  it('covers every milestone of every tier', () => {
    for (const tier of TIERS) {
      const referenced = new Set(tier.steps.flatMap((s) => s.milestoneIds ?? []));
      const expected = (MILESTONES_BY_TIER.get(tier.tier) ?? []).map((m) => m.id);
      expect(
        expected.filter((id) => !referenced.has(id)),
        `tier ${tier.tier}`,
      ).toEqual([]);
    }
  });

  it('references real MAM research', () => {
    for (const { step } of allSteps) {
      for (const id of step.researchIds ?? []) {
        expect(SCHEMATIC_BY_ID.get(id)?.type, `${step.id} → ${id}`).toBe('mam');
      }
    }
  });

  it('references layouts from the same or an earlier tier', () => {
    for (const { tier, step } of allSteps) {
      for (const id of step.layoutIds ?? []) {
        const layout = LAYOUT_BY_ID.get(id);
        expect(layout, `${step.id} → ${id}`).toBeDefined();
        expect(layout!.tier, `${step.id} → ${id}`).toBeLessThanOrEqual(tier);
      }
    }
  });

  it('references real sites and resources', () => {
    for (const { step } of allSteps) {
      for (const id of step.siteIds ?? [])
        expect(SITE_BY_ID.has(id), `${step.id} → ${id}`).toBe(true);
      for (const target of step.explore ?? []) {
        if (target.kind === 'resource') {
          expect(ITEM_BY_ID.get(target.resource ?? '')?.isResource, `${step.id}`).toBe(true);
        }
      }
    }
  });

  it('maps Space Elevator phases to the tier that delivers them', () => {
    for (const tier of TIERS) {
      if (tier.spaceElevatorPhase === undefined) continue;
      const phase = SPACE_ELEVATOR_PHASES.find((p) => p.phase === tier.spaceElevatorPhase);
      expect(phase?.deliverInTier).toBe(tier.tier);
    }
  });
});

describe('sites', () => {
  it('reference real nodes', () => {
    for (const site of SITES) {
      expect(site.nodeIds.length, site.id).toBeGreaterThan(0);
      for (const id of site.nodeIds) expect(NODE_BY_ID.has(id), `${site.id} → ${id}`).toBe(true);
    }
  });
});

describe('layouts', () => {
  it('have unique IDs and valid references', () => {
    expect(new Set(LAYOUTS.map((l) => l.id)).size).toBe(LAYOUTS.length);
    for (const layout of LAYOUTS) {
      for (const t of layout.targets)
        expect(ITEM_BY_ID.has(t.item), `${layout.id} → ${t.item}`).toBe(true);
      for (const item of layout.imports ?? [])
        expect(ITEM_BY_ID.has(item), `${layout.id}`).toBe(true);
      for (const id of [layout.siteId, ...(layout.supplySiteIds ?? [])]) {
        if (id) expect(SITE_BY_ID.has(id), `${layout.id} → ${id}`).toBe(true);
      }
      if (layout.generators) {
        expect(
          BUILDING_BY_ID.get(layout.generators.buildingId)?.generator,
          layout.id,
        ).toBeDefined();
      }
      expect(layout.targets.length > 0 || !!layout.generators, layout.id).toBe(true);
    }
  });

  it.each(LAYOUTS.map((l) => [l.id, l] as const))('%s solves within its tier', (_id, layout) => {
    const plan = buildFactoryPlan(resolveLayoutConfig(layout));
    expect(plan.error).toBeUndefined();
    // Generator waste always warns (it needs storage); nothing else may.
    const waste = plan.generators?.byproduct ? itemName(plan.generators.byproduct.item) : undefined;
    expect(
      plan.warnings
        .filter((w) => w.level === 'warn' && !(waste && w.message.startsWith(waste)))
        .map((w) => w.message),
    ).toEqual([]);
    // Only the layout's declared imports may be imported.
    const allowed = new Set(layout.imports ?? []);
    expect(plan.imports.filter((i) => !allowed.has(i.item)).map((i) => i.item)).toEqual([]);
    // No recipe or target above the layout's tier.
    for (const g of plan.groups) {
      expect(recipeTier(g.recipe.id), `${g.recipe.name}`).toBeLessThanOrEqual(layout.tier);
    }
    for (const t of layout.targets) expect(itemTier(t.item)).toBeLessThanOrEqual(layout.tier);
    expect(plan.groups.length + plan.extraction.length).toBeGreaterThan(0);
  });

  it('shows 10 Uranium Waste/min for one reactor and warns about it', () => {
    const plan = buildFactoryPlan(resolveLayoutConfig(LAYOUT_BY_ID.get('t8-nuclear-power')!));
    expect(plan.surplus.find((s) => s.item === 'Desc_NuclearWaste_C')?.rate).toBeCloseTo(10);
    expect(
      plan.warnings.some((w) => w.level === 'warn' && w.message.startsWith('Uranium Waste 10/min')),
    ).toBe(true);
  });

  it('builds everything from ore when full chain is on', () => {
    for (const layout of LAYOUTS.filter((l) => l.imports?.length)) {
      const plan = buildFactoryPlan(resolveLayoutConfig(layout, { fullChain: true }));
      expect(plan.imports, layout.id).toEqual([]);
    }
  });
});

describe('space elevator', () => {
  it('pins the 1× phase costs (wiki, 2026-10)', () => {
    const summary = SPACE_ELEVATOR_PHASES.map((p) => p.parts.map((x) => x.rate).join('/'));
    expect(summary).toEqual([
      '50',
      '1000/1000/100',
      '2500/500/100',
      '500/500/250/100',
      '1000/1000/256/200',
    ]);
    for (const p of SPACE_ELEVATOR_PHASES) {
      for (const part of p.parts) expect(ITEM_BY_ID.has(part.item)).toBe(true);
    }
  });
});

describe('facts quoted in guide text', () => {
  const recipe = (id: string) => RECIPE_BY_ID.get(id)!;
  const sumMam = (item: string) =>
    SCHEMATICS.filter((s) => s.type === 'mam').reduce(
      (n, s) => n + s.cost.filter((c) => c.item === item).reduce((a, c) => a + c.amount, 0),
      0,
    );

  it('Smart Plating cannot be hand-crafted; SAM Fluctuators can', () => {
    expect(recipe('Recipe_SpaceElevatorPart_1_C').handcraft).toBe(false);
    expect(recipe('Recipe_SAMFluctuator_C').handcraft).toBe(true);
    expect(itemTier('Desc_SAMFluctuator_C')).toBe(3);
  });

  it('Biomass 180 MJ, Solid Biofuel 450 MJ, burners 30 MW, coal 75 MW, fuel 250 MW', () => {
    expect(ITEM_BY_ID.get('Desc_GenericBiomass_C')?.energyMJ).toBe(180);
    expect(ITEM_BY_ID.get('Desc_Biofuel_C')?.energyMJ).toBe(450);
    expect(BUILDING_BY_ID.get('Build_GeneratorBiomass_Automated_C')?.generator?.powerMW).toBe(30);
    expect(BUILDING_BY_ID.get('Build_GeneratorCoal_C')?.generator?.powerMW).toBe(75);
    expect(BUILDING_BY_ID.get('Build_GeneratorFuel_C')?.generator?.powerMW).toBe(250);
    expect(BUILDING_BY_ID.get('Build_GeneratorNuclear_C')?.generator?.powerMW).toBe(2500);
  });

  it('Mercer Sphere and Somersloop research totals', () => {
    expect(sumMam('Desc_WAT2_C')).toBe(97);
    expect(sumMam('Desc_WAT1_C')).toBe(3);
    const upgrades = SCHEMATICS.filter((s) =>
      /CentralUploadBoost|CentralStackExpansion/.test(s.id),
    );
    expect(
      upgrades.reduce((n, s) => n + (s.cost.find((c) => c.item === 'Desc_WAT2_C')?.amount ?? 0), 0),
    ).toBe(92);
  });

  it('Dimensional Depot Uploader and Miner Mk.2 costs', () => {
    const depot = recipe('Recipe_CentralStorage_C').ingredients.map((i) => `${i.amount} ${i.item}`);
    expect(depot).toEqual([
      '1 Desc_WAT2_C',
      '10 Desc_SAMFluctuator_C',
      '10 Desc_ModularFrame_C',
      '100 Desc_Wire_C',
    ]);
    expect(recipe('Recipe_MinerMk2_C').ingredients[0]).toEqual({
      item: 'BP_ItemDescriptorPortableMiner_C',
      amount: 2,
    });
    expect(recipe('Recipe_AlienPowerBuilding_C').ingredients[0]).toEqual({
      item: 'Desc_WAT1_C',
      amount: 10,
    });
  });

  it('world collectible totals', () => {
    const count = (type: string) => COLLECTIBLES.filter((c) => c.type === type).length;
    expect(count('mercerSphere')).toBe(298);
    expect(count('somersloop')).toBe(106);
    expect(count('hardDrive')).toBe(118);
  });
});

describe('milestone links', () => {
  const linked = allSteps.flatMap(({ tier, step }) =>
    step.tasks.flatMap((task) => (task.milestoneId ? [{ tier, step, task }] : [])),
  );

  it('links every milestone to exactly one step task in its tier', () => {
    for (const [tier, milestones] of MILESTONES_BY_TIER) {
      for (const m of milestones) {
        const owners = linked.filter((l) => l.task.milestoneId === m.id);
        expect(
          owners.map((o) => o.task.id),
          `${m.name} (${m.id})`,
        ).toHaveLength(1);
        expect(owners[0]?.tier, `${m.name} owner tier`).toBe(tier);
      }
    }
  });

  it('only links milestones the step also shows', () => {
    for (const { step, task } of linked) {
      expect(step.milestoneIds ?? [], `${task.id}`).toContain(task.milestoneId);
    }
  });
});

describe('Space Elevator links', () => {
  it("links each tier's phase to exactly one task in its Space Elevator step", () => {
    for (const t of TIERS) {
      const owners = t.steps.flatMap((s) =>
        s.tasks.filter((task) => task.phase !== undefined).map((task) => ({ s, task })),
      );
      if (t.spaceElevatorPhase === undefined) {
        expect(owners, `tier ${t.tier}`).toEqual([]);
        continue;
      }
      expect(owners, `tier ${t.tier}`).toHaveLength(1);
      expect(owners[0]?.task.phase).toBe(t.spaceElevatorPhase);
      expect(owners[0]?.s.kind).toBe('space-elevator');
    }
  });
});

describe('game icons', () => {
  // jsdom rewrites import.meta.url, so resolve from the repo root vitest runs in.
  const iconDir = resolve('public/icons');

  it('has a local icon for every item and building', () => {
    const missing = [...ITEM_BY_ID.keys(), ...BUILDING_BY_ID.keys()].filter(
      (id) => !existsSync(resolve(iconDir, `${id}.webp`)),
    );
    expect(missing, 'run npm run data:fetch-icons && npm run data:build-icons').toEqual([]);
  });
});
