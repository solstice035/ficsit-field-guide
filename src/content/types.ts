/**
 * Hand-authored guide content. Every ID referenced here must resolve against
 * generated game data; `content.test.ts` enforces it.
 */
import type { CollectibleType } from '../data/types.ts';
import type { MinerMk } from '../lib/plan/factoryPlan.ts';

export interface Site {
  id: string;
  name: string;
  /** One-line role, e.g. "Tier 3 steel: iron and coal on one site". */
  role: string;
  /** Approximate centre (metres). */
  centre: { x: number; y: number };
  /** Resource node IDs from `nodes.json`. */
  nodeIds: string[];
  notes: string[];
}

export interface LayoutTarget {
  item: string;
  rate: number;
}

export interface GeneratorSpecContent {
  buildingId: string;
  fuelId: string;
  count: number;
}

export interface FactoryLayout {
  id: string;
  name: string;
  tier: number;
  summary: string;
  /** Where to build it. */
  siteId?: string;
  /** Other sites that supply raw inputs (purity defaults are taken from all of them). */
  supplySiteIds?: string[];
  /**
   * Intermediates normally made by their own layout and shipped in. The user
   * can switch to "full chain" to build everything from ore instead.
   */
  imports?: string[];
  /** Item targets per minute. Power layouts derive theirs from `generators`. */
  targets: LayoutTarget[];
  /** Power plant: generators to feed (fuel and water become targets). */
  generators?: GeneratorSpecContent;
  /** `itemId → recipeId`; `''` imports the item instead of producing it here. */
  recipeOverrides?: Record<string, string>;
  /** Defaults for this layout (otherwise derived from its tier). */
  minerMk?: MinerMk;
  maxBeltMk?: number;
  maxPipeMk?: number;
  tips: string[];
}

export type StepKind =
  | 'handcraft'
  | 'build'
  | 'power'
  | 'milestone'
  | 'research'
  | 'explore'
  | 'logistics'
  | 'space-elevator';

export interface GuideTask {
  id: string;
  label: string;
  /**
   * The HUB milestone this task submits. Ticking the task and ticking the
   * milestone are one event, stored once as the milestone's flag.
   */
  milestoneId?: string;
}

export interface ExploreTarget {
  kind: CollectibleType | 'resource';
  /** Resource item ID when `kind === 'resource'`. */
  resource?: string;
  /** How many to aim for during this step. */
  count?: number;
  note: string;
}

export interface GuideStep {
  id: string;
  title: string;
  kind: StepKind;
  /** The player may skip this step; skipped steps drop out of tier progress. */
  optional?: boolean;
  summary: string;
  body?: string[];
  tasks: GuideTask[];
  layoutIds?: string[];
  milestoneIds?: string[];
  researchIds?: string[];
  siteIds?: string[];
  explore?: ExploreTarget[];
  tips?: string[];
}

export interface TierGuide {
  tier: number;
  title: string;
  tagline: string;
  /** What unlocks this tier. */
  unlockedBy: string;
  briefing: string[];
  goals: string[];
  steps: GuideStep[];
  /** Space Elevator phase to deliver during this tier. */
  spaceElevatorPhase?: number;
}

export interface SpaceElevatorPhase {
  phase: number;
  name: string;
  parts: LayoutTarget[];
  unlocks: string;
  /** Tier in which you should deliver this phase. */
  deliverInTier: number;
}
