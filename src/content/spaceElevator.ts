import type { SpaceElevatorPhase } from './types.ts';

/**
 * Space Elevator phases at default (1×) cost. Not exported in the game's Docs,
 * so taken from the Satisfactory Wiki (verified 2026-10) and pinned by test.
 */
export const SPACE_ELEVATOR_PHASES: readonly SpaceElevatorPhase[] = [
  {
    phase: 1,
    name: 'Distribution Platform',
    parts: [{ item: 'Desc_SpaceElevatorPart_1_C', rate: 50 }],
    unlocks: 'Tiers 3 & 4',
    deliverInTier: 2,
  },
  {
    phase: 2,
    name: 'Construction Dock',
    parts: [
      { item: 'Desc_SpaceElevatorPart_1_C', rate: 1000 },
      { item: 'Desc_SpaceElevatorPart_2_C', rate: 1000 },
      { item: 'Desc_SpaceElevatorPart_3_C', rate: 100 },
    ],
    unlocks: 'Tiers 5 & 6',
    deliverInTier: 4,
  },
  {
    phase: 3,
    name: 'Main Body',
    parts: [
      { item: 'Desc_SpaceElevatorPart_2_C', rate: 2500 },
      { item: 'Desc_SpaceElevatorPart_4_C', rate: 500 },
      { item: 'Desc_SpaceElevatorPart_5_C', rate: 100 },
    ],
    unlocks: 'Tiers 7 & 8',
    deliverInTier: 6,
  },
  {
    phase: 4,
    name: 'Propulsion',
    parts: [
      { item: 'Desc_SpaceElevatorPart_7_C', rate: 500 },
      { item: 'Desc_SpaceElevatorPart_6_C', rate: 500 },
      { item: 'Desc_SpaceElevatorPart_8_C', rate: 250 },
      { item: 'Desc_SpaceElevatorPart_9_C', rate: 100 },
    ],
    unlocks: 'Tier 9',
    deliverInTier: 8,
  },
  {
    phase: 5,
    name: 'Assembly',
    parts: [
      { item: 'Desc_SpaceElevatorPart_9_C', rate: 1000 },
      { item: 'Desc_SpaceElevatorPart_10_C', rate: 1000 },
      { item: 'Desc_SpaceElevatorPart_12_C', rate: 256 },
      { item: 'Desc_SpaceElevatorPart_11_C', rate: 200 },
    ],
    unlocks: 'Project Assembly launch (game complete)',
    deliverInTier: 9,
  },
];

export const PHASE_BY_NUMBER: ReadonlyMap<number, SpaceElevatorPhase> = new Map(
  SPACE_ELEVATOR_PHASES.map((p) => [p.phase, p]),
);
