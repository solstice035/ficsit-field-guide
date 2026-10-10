/**
 * Builds a complete, display-ready factory plan from a configuration:
 * solver → machine splits → extraction → flow edges → power → floor plan → BOM.
 */
import { BUILDING_BY_ID, ITEM_BY_ID, RECIPE_BY_ID, itemName } from '../../data/gameData.ts';
import { isRawResource, makeRecipeChooser } from '../../data/recipeDefaults.ts';
import type { Building, ItemAmount, ItemForm, Purity, Recipe } from '../../data/types.ts';
import { billOfMaterials, type BomEntry } from '../calc/bom.ts';
import { BELT_TIERS, type Conveyance, PIPE_TIERS, conveyanceFor } from '../calc/conveyance.ts';
import { type ExtractionPlan, planExtraction } from '../calc/extraction.ts';
import { type FloorPlan, type FloorRowInput, planFloor } from '../calc/floorplan.ts';
import {
  type ClockStrategy,
  type MachineSplit,
  machinePowerMW,
  powerShardsFor,
  sloopOutputFactor,
  splitMachines,
} from '../calc/power.ts';
import { type ItemRate, solve } from '../calc/solver.ts';

export type MinerMk = 1 | 2 | 3;

export interface ResourceSetting {
  purity: Purity;
  /** Use a specific extractor (e.g. `Build_FrackingExtractor_C` for oil wells). */
  extractorId?: string;
  /** Limit to a fixed number of nodes; extractor clocks rise to suit. */
  nodes?: number;
}

export interface PlanConfig {
  targets: ItemRate[];
  /** `itemId → recipeId`; `''` forces the item to be imported. */
  recipeOverrides: Record<string, string>;
  minerMk: MinerMk;
  /** Preferred extractor clock (1 = 100%, max 2.5). */
  extractorClock: number;
  resources: Record<string, ResourceSetting>;
  maxBeltMk: number;
  maxPipeMk: number;
  clockStrategy: ClockStrategy;
  /** Machine clock ceiling (1 = no shards, 2.5 = three shards). */
  maxClock: number;
  /** Somersloops per machine, by recipe ID. */
  sloops: Record<string, number>;
  /** Power plant fed by this plan (fuel and water are its targets). */
  generators?: { buildingId: string; count: number };
}

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
  targets: [],
  recipeOverrides: {},
  minerMk: 1,
  extractorClock: 1,
  resources: {},
  maxBeltMk: 1,
  maxPipeMk: 1,
  clockStrategy: 'even',
  maxClock: 1,
  sloops: {},
};

export interface PlanGroup {
  key: string;
  recipe: Recipe;
  building: Building;
  machines: number;
  split: MachineSplit;
  sloopsPerMachine: number;
  outputMultiplier: number;
  powerMW: number;
  shards: number;
  inputs: ItemRate[];
  outputs: ItemRate[];
  /** Production depth (1 = fed only by raw inputs). */
  stage: number;
}

export interface PlanExtraction {
  key: string;
  item: string;
  rate: number;
  building: Building;
  purity: Purity;
  plan: ExtractionPlan;
  conveyance: Conveyance;
  pressurizers: number;
}

export type FlowNodeKind = 'group' | 'extract' | 'import' | 'output' | 'surplus';

export interface FlowNodeRef {
  kind: FlowNodeKind;
  key: string;
}

export interface PlanEdge {
  id: string;
  from: FlowNodeRef;
  to: FlowNodeRef;
  item: string;
  rate: number;
  conveyance: Conveyance;
}

export interface PlanWarning {
  level: 'info' | 'warn';
  message: string;
}

export interface PlanGenerators {
  building: Building;
  count: number;
  powerMW: number;
}

export interface FactoryPlan {
  config: PlanConfig;
  generators?: PlanGenerators;
  groups: PlanGroup[];
  extraction: PlanExtraction[];
  /** Inputs with no extractor or recipe (bring in from elsewhere). */
  imports: ItemRate[];
  outputs: ItemRate[];
  surplus: ItemRate[];
  edges: PlanEdge[];
  /** Consumption (production + extraction) and generation, in MW. */
  power: { productionMW: number; extractionMW: number; totalMW: number; generatedMW: number };
  machineCount: number;
  shardCount: number;
  sloopCount: number;
  bom: ItemAmount[];
  floor: FloorPlan;
  warnings: PlanWarning[];
  error?: string;
}

const PRESSURIZER_ID = 'Build_FrackingSmasher_C';
const WELL_EXTRACTOR_ID = 'Build_FrackingExtractor_C';

const formOf = (item: string): ItemForm => ITEM_BY_ID.get(item)?.form ?? 'solid';

/** Default extractor for a raw resource. */
export function extractorFor(
  item: string,
  minerMk: MinerMk,
  override?: string,
): Building | undefined {
  if (override) return BUILDING_BY_ID.get(override);
  switch (item) {
    case 'Desc_Water_C':
      return BUILDING_BY_ID.get('Build_WaterPump_C');
    case 'Desc_LiquidOil_C':
      return BUILDING_BY_ID.get('Build_OilPump_C');
    case 'Desc_NitrogenGas_C':
      return BUILDING_BY_ID.get(WELL_EXTRACTOR_ID);
    default:
      return formOf(item) === 'solid' ? BUILDING_BY_ID.get(`Build_MinerMk${minerMk}_C`) : undefined;
  }
}

function recipePowerMW(recipe: Recipe, building: Building): number {
  if (recipe.variablePower) return (recipe.variablePower.minMW + recipe.variablePower.maxMW) / 2;
  if (building.variablePower)
    return (building.variablePower.minMW + building.variablePower.maxMW) / 2;
  return building.powerMW;
}

/**
 * Longest-path production depth. Only primary products count as "upstream":
 * byproduct loops (water from Aluminum Scrap, Dark Matter Residue from Quantum
 * Encoders) would otherwise inflate every stage in the loop.
 */
function computeStages(groups: PlanGroup[]): void {
  const producersOf = new Map<string, PlanGroup[]>();
  for (const g of groups) {
    const primary = g.recipe.products[0]?.item;
    if (primary) producersOf.set(primary, [...(producersOf.get(primary) ?? []), g]);
  }
  for (const g of groups) g.stage = 1;
  for (let pass = 0; pass < groups.length; pass += 1) {
    let changed = false;
    for (const g of groups) {
      const upstream = g.inputs.flatMap((i) =>
        (producersOf.get(i.item) ?? []).filter((p) => p !== g),
      );
      const stage = 1 + upstream.reduce((m, p) => Math.max(m, p.stage), 0);
      if (stage !== g.stage && stage <= groups.length + 1) {
        g.stage = stage;
        changed = true;
      }
    }
    if (!changed) break;
  }
}

/** Builds the full plan. Pure apart from reading static game data. */
export function buildFactoryPlan(input: Partial<PlanConfig>): FactoryPlan {
  const config: PlanConfig = { ...DEFAULT_PLAN_CONFIG, ...input };
  const warnings: PlanWarning[] = [];
  const chooser = makeRecipeChooser(config.recipeOverrides);

  const sloopsFor = (recipe: Recipe): number => {
    const building = BUILDING_BY_ID.get(recipe.producedIn[0] ?? '');
    return Math.min(config.sloops[recipe.id] ?? 0, building?.sloopSlots ?? 0);
  };
  const multiplierFor = (recipe: Recipe): number => {
    const building = BUILDING_BY_ID.get(recipe.producedIn[0] ?? '');
    return sloopOutputFactor(sloopsFor(recipe), building?.sloopSlots ?? 0);
  };

  const result = solve(config.targets, chooser, {
    isRaw: (item) => isRawResource(item) && !config.recipeOverrides[item],
    outputMultiplier: (recipeId) => {
      const recipe = RECIPE_BY_ID.get(recipeId);
      return recipe ? multiplierFor(recipe) : 1;
    },
  });

  // --- Machine groups
  const groups: PlanGroup[] = result.recipes.flatMap(({ recipe, machines, outputMultiplier }) => {
    const building = BUILDING_BY_ID.get(recipe.producedIn[0] ?? '');
    if (!building) {
      warnings.push({ level: 'warn', message: `No building found for ${recipe.name}.` });
      return [];
    }
    const split = splitMachines(machines, {
      strategy: config.clockStrategy,
      maxClock: config.maxClock,
    });
    const sloopsPerMachine = sloopsFor(recipe);
    const baseMW = recipePowerMW(recipe, building);
    const powerMW = split.groups.reduce(
      (sum, g) =>
        sum +
        g.count *
          machinePowerMW({
            baseMW,
            clock: g.clock,
            exponent: building.powerExponent,
            sloops: sloopsPerMachine,
            slots: building.sloopSlots,
          }),
      0,
    );
    const perMin = (60 / recipe.durationS) * machines;
    return [
      {
        key: recipe.id,
        recipe,
        building,
        machines,
        split,
        sloopsPerMachine,
        outputMultiplier,
        powerMW,
        shards: split.groups.reduce((n, g) => n + g.count * powerShardsFor(g.clock), 0),
        inputs: recipe.ingredients.map((i) => ({ item: i.item, rate: i.amount * perMin })),
        outputs: recipe.products.map((p) => ({
          item: p.item,
          rate: p.amount * outputMultiplier * perMin,
        })),
        stage: 1,
      },
    ];
  });
  computeStages(groups);
  groups.sort((a, b) => a.stage - b.stage || a.recipe.name.localeCompare(b.recipe.name));

  // --- Extraction and imports
  const extraction: PlanExtraction[] = [];
  const imports: ItemRate[] = [];
  for (const { item, rate } of result.inputs) {
    const setting = config.resources[item];
    const building = isRawResource(item)
      ? extractorFor(item, config.minerMk, setting?.extractorId)
      : undefined;
    if (!building?.extractor) {
      imports.push({ item, rate });
      continue;
    }
    const isWater = item === 'Desc_Water_C' && building.id === 'Build_WaterPump_C';
    const purity: Purity = isWater ? 'normal' : (setting?.purity ?? 'normal');
    const form = formOf(item);
    const conveyanceCap = form === 'solid' ? beltCap(config.maxBeltMk) : pipeCap(config.maxPipeMk);
    const plan = planExtraction({
      rate,
      baseRatePerMin: building.extractor.baseRatePerMin,
      purity,
      clock: config.extractorClock,
      basePowerMW: building.powerMW,
      cap: conveyanceCap,
      ...(setting?.nodes ? { availableNodes: setting.nodes } : {}),
    });
    if (plan.shortfall > 1e-6) {
      warnings.push({
        level: 'warn',
        message: `${itemName(item)}: ${setting?.nodes ?? plan.nodes} node(s) cannot supply ${round(rate)}/min even at 250%. Short by ${round(plan.shortfall)}/min.`,
      });
    }
    extraction.push({
      key: item,
      item,
      rate,
      building,
      purity,
      plan,
      conveyance: conveyanceFor(rate, form, config.maxBeltMk, config.maxPipeMk),
      pressurizers: building.id === WELL_EXTRACTOR_ID ? 1 : 0,
    });
  }
  if (imports.length) {
    warnings.push({
      level: 'info',
      message: `Bring in from elsewhere (or pick a recipe): ${imports
        .map((imp) => `${itemName(imp.item)} ${round(imp.rate)}/min`)
        .join(', ')}.`,
    });
  }

  // --- Flow edges (proportional allocation of each item's supply to its demand)
  const edges: PlanEdge[] = [];
  const items = new Set<string>();
  for (const g of groups) [...g.inputs, ...g.outputs].forEach((x) => items.add(x.item));
  for (const x of [...extraction, ...imports, ...result.outputs, ...result.surplus])
    items.add(x.item);

  for (const item of items) {
    const supply: { ref: FlowNodeRef; rate: number }[] = [
      ...groups.flatMap((g) =>
        g.outputs
          .filter((o) => o.item === item)
          .map((o) => ({ ref: { kind: 'group' as const, key: g.key }, rate: o.rate })),
      ),
      ...extraction
        .filter((e) => e.item === item)
        .map((e) => ({ ref: { kind: 'extract' as const, key: e.key }, rate: e.rate })),
      ...imports
        .filter((i) => i.item === item)
        .map((i) => ({ ref: { kind: 'import' as const, key: i.item }, rate: i.rate })),
    ];
    const demand: { ref: FlowNodeRef; rate: number }[] = [
      ...groups.flatMap((g) =>
        g.inputs
          .filter((i) => i.item === item)
          .map((i) => ({ ref: { kind: 'group' as const, key: g.key }, rate: i.rate })),
      ),
      ...result.outputs
        .filter((o) => o.item === item)
        .map((o) => ({ ref: { kind: 'output' as const, key: o.item }, rate: o.rate })),
      ...result.surplus
        .filter((s) => s.item === item)
        .map((s) => ({ ref: { kind: 'surplus' as const, key: s.item }, rate: s.rate })),
    ];
    const totalDemand = demand.reduce((n, d) => n + d.rate, 0);
    if (totalDemand <= 0) continue;
    for (const s of supply) {
      for (const d of demand) {
        if (s.ref.kind === d.ref.kind && s.ref.key === d.ref.key) continue;
        const rate = (s.rate * d.rate) / totalDemand;
        if (rate < 1e-6) continue;
        edges.push({
          id: `${s.ref.kind}:${s.ref.key}→${d.ref.kind}:${d.ref.key}:${item}`,
          from: s.ref,
          to: d.ref,
          item,
          rate,
          conveyance: conveyanceFor(rate, formOf(item), config.maxBeltMk, config.maxPipeMk),
        });
      }
    }
  }
  for (const e of edges) {
    if (e.conveyance.lines > 1) {
      warnings.push({
        level: 'info',
        message: `${itemName(e.item)} ${round(e.rate)}/min needs ${e.conveyance.lines}× ${e.conveyance.kind === 'belt' ? 'Belt' : 'Pipe'} Mk.${e.conveyance.mk} lines (or a faster tier).`,
      });
    }
  }

  // --- Power
  const productionMW = groups.reduce((n, g) => n + g.powerMW, 0);
  const pressurizer = BUILDING_BY_ID.get(PRESSURIZER_ID);
  const extractionMW = extraction.reduce(
    (n, e) => n + e.plan.powerMW + e.pressurizers * (pressurizer?.powerMW ?? 150),
    0,
  );

  // --- Power plant
  const generatorBuilding = config.generators
    ? BUILDING_BY_ID.get(config.generators.buildingId)
    : undefined;
  const generators: PlanGenerators | undefined =
    generatorBuilding?.generator && config.generators && config.generators.count > 0
      ? {
          building: generatorBuilding,
          count: config.generators.count,
          powerMW: generatorBuilding.generator.powerMW * config.generators.count,
        }
      : undefined;

  // --- Bill of materials
  const machineCount = groups.reduce((n, g) => n + g.split.count, 0);
  const shardCount = groups.reduce((n, g) => n + g.shards, 0);
  const sloopCount = groups.reduce((n, g) => n + g.sloopsPerMachine * g.split.count, 0);
  const bomEntries: BomEntry[] = [
    ...groups.map((g) => ({ buildCost: g.building.buildCost, count: g.split.count })),
    ...extraction.map((e) => ({ buildCost: e.building.buildCost, count: e.plan.nodes })),
    ...extraction
      .filter((e) => e.pressurizers > 0 && pressurizer)
      .map((e) => ({ buildCost: pressurizer!.buildCost, count: e.pressurizers })),
  ];
  if (generators) {
    bomEntries.push({ buildCost: generators.building.buildCost, count: generators.count });
  }
  if (shardCount)
    bomEntries.push({ buildCost: [{ item: 'Desc_CrystalShard_C', amount: 1 }], count: shardCount });
  if (sloopCount)
    bomEntries.push({ buildCost: [{ item: 'Desc_WAT1_C', amount: 1 }], count: sloopCount });

  // --- Floor plan
  const floorRows: FloorRowInput[] = groups.map((g) => ({
    key: g.key,
    label: g.recipe.name,
    buildingId: g.building.id,
    count: g.split.count,
    ...(g.building.footprint ? { footprint: g.building.footprint } : {}),
    inputLanes: new Set(g.inputs.map((i) => i.item)).size,
    outputLanes: new Set(g.outputs.map((o) => o.item)).size,
  }));
  if (generators) {
    floorRows.push({
      key: 'generators',
      label: generators.building.name,
      buildingId: generators.building.id,
      count: generators.count,
      ...(generators.building.footprint ? { footprint: generators.building.footprint } : {}),
      inputLanes: config.targets.length,
      outputLanes: 1,
    });
  }
  const floor = planFloor(floorRows);

  if (result.error) warnings.push({ level: 'warn', message: result.error });

  return {
    config,
    ...(generators ? { generators } : {}),
    groups,
    extraction,
    imports,
    outputs: result.outputs,
    surplus: result.surplus,
    edges,
    power: {
      productionMW,
      extractionMW,
      totalMW: productionMW + extractionMW,
      generatedMW: generators?.powerMW ?? 0,
    },
    machineCount,
    shardCount,
    sloopCount,
    bom: billOfMaterials(bomEntries),
    floor,
    warnings,
    ...(result.error ? { error: result.error } : {}),
  };
}

/** Throughput of the fastest unlocked belt (caps a single extractor's output). */
function beltCap(maxMk: number): number {
  return BELT_TIERS.filter((t) => t.mk <= Math.max(1, maxMk)).at(-1)?.rate ?? 60;
}

function pipeCap(maxMk: number): number {
  return PIPE_TIERS.filter((t) => t.mk <= Math.max(1, maxMk)).at(-1)?.rate ?? 300;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
