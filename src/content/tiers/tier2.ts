import type { TierGuide } from '../types.ts';

export const TIER_2: TierGuide = {
  tier: 2,
  title: 'Part Assembly',
  tagline: 'Assemblers, Mk.2 belts and Space Elevator Phase 1.',
  unlockedBy: 'HUB Upgrade 6',
  spaceElevatorPhase: 1,
  briefing: [
    'Assemblers bring two-input recipes: Reinforced Iron Plates, Rotors, Modular Frames and Smart Plating.',
    'Logistics Mk.2 doubles belt speed to 120/min, which instantly doubles every pure node you have belt-capped at 60.',
    'Phase 1 of the Space Elevator needs only 50 Smart Plating and unlocks Tiers 3 and 4. Get it done early.',
  ],
  goals: [
    'Complete Part Assembly and Logistics Mk.2 (the rest are optional but cheap)',
    'Deliver Space Elevator Phase 1 (50 Smart Plating)',
    'Start Quickwire and Copper Sheet production',
  ],
  steps: [
    {
      id: 't2-logistics-mk2',
      title: 'Logistics Mk.2: double your pure nodes',
      kind: 'milestone',
      summary:
        'Re-belt every pure-node miner with Mk.2 belts: 60 → 120 ore/min each, no new miners needed.',
      tasks: [
        { id: 't2-log2-submit', label: 'Submit Logistics Mk.2', milestoneId: 'Schematic_3-2_C' },
        { id: 't2-log2-upgrade', label: 'Upgrade miner output belts on pure nodes to Mk.2' },
      ],
      milestoneIds: ['Schematic_3-2_C'],
    },
    {
      id: 't2-part-assembly',
      title: 'Part Assembly: Assemblers',
      kind: 'milestone',
      summary:
        'Unlocks the Assembler plus Copper Sheet, Rotor, Modular Frame and Smart Plating recipes.',
      tasks: [
        { id: 't2-pa-submit', label: 'Submit Part Assembly', milestoneId: 'Schematic_2-1_C' },
        { id: 't2-pa-rip', label: 'Build the Reinforced Iron Plate line' },
        { id: 't2-pa-rotor', label: 'Build the Rotor line' },
      ],
      milestoneIds: ['Schematic_2-1_C'],
      layoutIds: ['t2-reinforced-plates', 't2-rotors'],
    },
    {
      id: 't2-phase-1',
      title: 'Space Elevator Phase 1: 50 Smart Plating',
      kind: 'space-elevator',
      summary:
        'A dedicated ore-to-Smart-Plating line finishes Phase 1 in about 25 minutes and unlocks Tiers 3 and 4.',
      tasks: [
        { id: 't2-p1-build', label: 'Build the Smart Plating line' },
        { id: 't2-p1-deliver', label: 'Deliver 50 Smart Plating to the Space Elevator' },
      ],
      layoutIds: ['t2-smart-plating'],
    },
    {
      id: 't2-modular-frames',
      title: 'Modular Frames',
      kind: 'build',
      summary: 'Tier 3 milestones need 75 Modular Frames. Start stockpiling now.',
      tasks: [{ id: 't2-mf-build', label: 'Build the Modular Frame line' }],
      layoutIds: ['t2-modular-frames'],
    },
    {
      id: 't2-obstacle-clearing',
      title: 'Obstacle Clearing: Chainsaw and Solid Biofuel',
      kind: 'milestone',
      summary:
        'The Chainsaw clears foliage for building and gathers Biomass fast; Solid Biofuel keeps burners running longer.',
      tasks: [
        { id: 't2-oc-submit', label: 'Submit Obstacle Clearing', milestoneId: 'Schematic_2-2_C' },
        { id: 't2-oc-biofuel', label: 'Switch Biomass Burners to Solid Biofuel' },
      ],
      milestoneIds: ['Schematic_2-2_C'],
    },
    {
      id: 't2-sink',
      title: 'Resource Sink Bonus Program',
      kind: 'milestone',
      summary:
        'The AWESOME Sink turns surplus into FICSIT Coupons for the AWESOME Shop (cosmetics, extra buildables, even Hard Drives late on).',
      tasks: [
        {
          id: 't2-sink-submit',
          label: 'Submit Resource Sink Bonus Program',
          milestoneId: 'Schematic_2-5_C',
        },
        { id: 't2-sink-build', label: 'Place an AWESOME Sink fed by overflow from your malls' },
      ],
      milestoneIds: ['Schematic_2-5_C'],
    },
    {
      id: 't2-jump-pads',
      title: 'Jump Pads (optional)',
      kind: 'milestone',
      optional: true,
      summary:
        'Handy for climbing the Rocky Desert cliffs before the Jetpack. Cheap, but skippable.',
      tasks: [
        {
          id: 't2-jp-submit',
          label: 'Submit Jump Pads (optional)',
          milestoneId: 'Schematic_2-3_C',
        },
      ],
      milestoneIds: ['Schematic_2-3_C'],
    },
    {
      id: 't2-caterium',
      title: 'Quickwire and Caterium research',
      kind: 'research',
      summary:
        'Automate Quickwire on Caterium Ridge, then use it to research Zipline, Power Poles Mk.2, AI Limiters and Smart Splitters.',
      tasks: [
        { id: 't2-cat-line', label: 'Build the Quickwire line' },
        { id: 't2-cat-research', label: 'Research Quickwire, Zipline and AI Limiter' },
      ],
      layoutIds: ['t2-quickwire'],
      researchIds: [
        'Research_Caterium_2_C',
        'Research_Caterium_2_1_C',
        'Research_Caterium_3_C',
        'Research_Caterium_4_1_C',
        'Research_Caterium_4_2_C',
      ],
      siteIds: ['caterium-ridge'],
    },
    {
      id: 't2-copper-sheets',
      title: 'Second copper source: West Coast',
      kind: 'build',
      summary:
        'Copper Sheets for Tier 3–4 (Water Extractors, pipes, Hypertubes) from the West Coast copper nodes.',
      tasks: [{ id: 't2-cs-build', label: 'Build Copper Sheets at the West Coast' }],
      layoutIds: ['t2-copper-sheets'],
      siteIds: ['west-coast'],
    },
    {
      id: 't2-explore',
      title: 'First Hard Drives',
      kind: 'explore',
      summary:
        'Several nearby crash sites open with Tier 0–2 parts. Each Hard Drive researched in the MAM gives a choice of two alternate recipes.',
      body: [
        'The Explore page lists crash sites by distance and marks the tier their unlock cost needs. Filter to "openable now".',
        'Good early alternates include Cast Screw, Iron Wire, Stitched Iron Plate and Bolted Frame.',
      ],
      tasks: [
        { id: 't2-explore-drives', label: 'Open 2–3 crash sites and research their Hard Drives' },
        { id: 't2-explore-spheres', label: 'Collect 5 more Mercer Spheres' },
      ],
      explore: [
        { kind: 'hardDrive', count: 5, note: 'Nearest crash sites' },
        { kind: 'mercerSphere', count: 5, note: 'Mercer Spheres' },
      ],
    },
  ],
};
