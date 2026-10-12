import type { TierGuide } from '../types.ts';

export const TIER_6: TierGuide = {
  tier: 6,
  title: 'Industrial Manufacturing',
  tagline: 'Manufacturers, trains and Space Elevator Phase 3.',
  unlockedBy: 'Space Elevator Phase 2',
  spaceElevatorPhase: 3,
  briefing: [
    'Manufacturers unlock Computers, Heavy Modular Frames, Modular Engines and Adaptive Control Units: the Phase 3 parts.',
    'Your sites are now 1–1.5 km apart, so trains are the backbone. Link the HUB, the NE Steelworks, the NW Iron Field and the coast.',
    'Phase 3 (2,500 VF, 500 Modular Engines, 100 ACUs) is a big jump. Lean on Hard Drive alternates and Somersloops.',
  ],
  goals: [
    'Complete Industrial Manufacturing and Monorail Train Technology',
    'Run Computers and Heavy Modular Frames',
    'Deliver Space Elevator Phase 3',
  ],
  steps: [
    {
      id: 't6-manufacturing',
      title: 'Industrial Manufacturing',
      kind: 'milestone',
      summary: 'The Manufacturer (55 MW, 4 inputs). Computers and Heavy Modular Frames first.',
      tasks: [
        {
          id: 't6-im-submit',
          label: 'Submit Industrial Manufacturing',
          milestoneId: 'Schematic_5-2_C',
        },
        { id: 't6-im-computers', label: 'Computer line running' },
        { id: 't6-im-hmf', label: 'Heavy Modular Frame line running' },
      ],
      milestoneIds: ['Schematic_5-2_C'],
      layoutIds: ['t6-computers', 't6-heavy-modular-frames'],
    },
    {
      id: 't6-rail',
      title: 'Monorail Train Technology + Railway Signalling',
      kind: 'logistics',
      summary:
        'A rail loop: HUB ↔ NE Steelworks ↔ NW Iron Field ↔ Coastal Oil. Signals let several trains share it.',
      body: [
        'Update 1.1: trains now derail at the end of a line when driven manually. Place Buffer Stops at every terminus.',
        'Freight Platforms load 2 belts each way. Fluid Freight Platforms carry Plastic feedstock, Fuel or Water.',
      ],
      tasks: [
        {
          id: 't6-rail-submit',
          label: 'Submit Monorail Train Technology',
          milestoneId: 'Schematic_6-3_C',
        },
        {
          id: 't6-rail-signal',
          label: 'Submit Railway Signalling',
          milestoneId: 'Schematic_6-7_C',
        },
        { id: 't6-rail-loop', label: 'Build the main rail loop with stations at each site' },
      ],
      milestoneIds: ['Schematic_6-3_C', 'Schematic_6-7_C'],
    },
    {
      id: 't6-pipes-mk2',
      title: 'Pipeline Engineering Mk.2',
      kind: 'milestone',
      summary:
        '600 m³/min pipes and Pump Mk.2 (50 m head lift). Re-pipe the oil field and the Coal Plateau riser.',
      tasks: [
        {
          id: 't6-pe2-submit',
          label: 'Submit Pipeline Engineering Mk.2',
          milestoneId: 'Schematic_6-5_C',
        },
      ],
      milestoneIds: ['Schematic_6-5_C'],
    },
    {
      id: 't6-phase-3-parts',
      title: 'Modular Engines and Adaptive Control Units',
      kind: 'build',
      summary: 'The two new Phase 3 parts. Both feed on Rubber and Computers from the coast.',
      tasks: [
        { id: 't6-me-build', label: 'Modular Engine line running' },
        { id: 't6-acu-build', label: 'Adaptive Control Unit line running' },
      ],
      layoutIds: ['t6-modular-engines', 't6-adaptive-control-units'],
    },
    {
      id: 't6-phase-3',
      title: 'Space Elevator Phase 3',
      kind: 'space-elevator',
      summary:
        'Deliver 2,500 Versatile Framework, 500 Modular Engines and 100 ACUs. Unlocks Tiers 7 & 8.',
      tasks: [
        { id: 't6-p3-mall', label: 'Phase 3 Mall (or equivalent) running' },
        { id: 't6-p3-deliver', label: 'Deliver Phase 3', phase: 3 },
      ],
      layoutIds: ['t6-phase-3-mall'],
    },
    {
      id: 't6-blueprints-mk2',
      title: 'FICSIT Blueprints Mk.2',
      kind: 'milestone',
      summary: 'Larger blueprint designer: blueprint a full Manufacturer cell.',
      tasks: [
        {
          id: 't6-bp2-submit',
          label: 'Submit FICSIT Blueprints Mk.2',
          milestoneId: 'Schematic_6-6_C',
        },
      ],
      milestoneIds: ['Schematic_6-6_C'],
    },
    {
      id: 't6-somersloops',
      title: 'Somersloops: Production Amplifier',
      kind: 'research',
      summary:
        'Production Amplifier lets you slot Somersloops into machines: up to double output for the same input, at up to 4× power.',
      body: [
        'Best targets are expensive final assemblers with many slots (Manufacturers take 4 sloops for +100%).',
        'The Alien Power Augmenter (Power Augmenter research) costs 10 Somersloops each. Decide where your sloops earn most.',
      ],
      tasks: [
        { id: 't6-sl-research', label: 'Research Somersloop Analysis → Production Amplifier' },
        { id: 't6-sl-collect', label: 'Collect 8+ Somersloops' },
      ],
      researchIds: ['Research_Alien_ProductionBooster_C', 'Research_Alien_PowerBooster_C'],
      explore: [{ kind: 'somersloop', count: 8, note: 'Nearest Somersloops' }],
    },
  ],
};
