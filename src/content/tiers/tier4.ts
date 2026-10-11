import type { TierGuide } from '../types.ts';

export const TIER_4: TierGuide = {
  tier: 4,
  title: 'Advanced Steel',
  tagline: 'Miner Mk.2, Mk.3 belts and Space Elevator Phase 2.',
  unlockedBy: 'Space Elevator Phase 1',
  spaceElevatorPhase: 2,
  briefing: [
    'Advanced Steel Production brings Miner Mk.2 (twice the output) and the Motor, Stator, Encased Industrial Beam and Automated Wiring recipes.',
    'Pair Miner Mk.2 with Logistics Mk.3 (270/min): a pure node now gives 240 ore/min on one belt.',
    'Phase 2 is the first big delivery: 1,000 Smart Plating, 1,000 Versatile Framework and 100 Automated Wiring. It unlocks Tiers 5 and 6.',
  ],
  goals: [
    'Retrofit pure nodes with Miner Mk.2 and Mk.3 belts',
    'Open the North-West Iron Field (4 pure Iron)',
    'Deliver Space Elevator Phase 2',
  ],
  steps: [
    {
      id: 't4-adv-steel',
      title: 'Advanced Steel Production + Logistics Mk.3',
      kind: 'milestone',
      summary: 'Miner Mk.2 and Mk.3 belts. Retrofit every pure node to 240 ore/min.',
      body: [
        'Each Miner Mk.2 costs 2 Portable Miners plus Encased Industrial Beams, Steel Pipe and Modular Frames. Upgrade in place with the Build Gun.',
        'Upgrade manifolds downstream too, or the extra ore just backs up.',
      ],
      tasks: [
        { id: 't4-as-submit', label: 'Submit Advanced Steel Production' },
        { id: 't4-l3-submit', label: 'Submit Logistics Mk.3' },
        { id: 't4-as-retrofit', label: 'Retrofit HUB Basin pure nodes with Miner Mk.2' },
      ],
      milestoneIds: ['Schematic_4-1_C', 'Schematic_5-3_C'],
      layoutIds: ['t4-encased-beams'],
    },
    {
      id: 't4-nw-iron',
      title: 'Expand to the North-West Iron Field',
      kind: 'build',
      summary:
        '4 pure Iron + 2 pure Limestone ~1.1 km north-west. On Miner Mk.2 that is 960 iron ore/min: the backbone for Phases 2 and 3.',
      tasks: [
        { id: 't4-nw-miners', label: 'Miner Mk.2 on all 4 pure Iron nodes' },
        { id: 't4-nw-motors', label: 'Build the Motor line' },
      ],
      layoutIds: ['t4-motors'],
      siteIds: ['nw-iron-field', 'north-terrace'],
    },
    {
      id: 't4-phase-2',
      title: 'Space Elevator Phase 2',
      kind: 'space-elevator',
      summary:
        'Build the Phase 2 Mall (or scale the separate lines) and deliver 1,000 / 1,000 / 100.',
      tasks: [
        { id: 't4-p2-aw', label: 'Automated Wiring line running' },
        { id: 't4-p2-mall', label: 'Phase 2 Mall (or equivalent) running' },
        { id: 't4-p2-deliver', label: 'Deliver Phase 2 (unlocks Tiers 5 & 6)' },
      ],
      layoutIds: ['t4-automated-wiring', 't4-phase-2-mall'],
    },
    {
      id: 't4-power',
      title: 'Expanded Power Infrastructure',
      kind: 'power',
      summary:
        'Power Storage smooths spikes, and Power Towers carry the grid across the cliffs. Scale coal to all three pure plateau nodes (1.8 GW).',
      tasks: [
        { id: 't4-epi-submit', label: 'Submit Expanded Power Infrastructure' },
        { id: 't4-epi-storage', label: 'Add 2–4 Power Storage on the main grid' },
        { id: 't4-epi-scale', label: 'Scale coal power to 16–24 generators' },
      ],
      milestoneIds: ['Schematic_4-3_C'],
      layoutIds: ['t3-coal-power'],
    },
    {
      id: 't4-hypertubes',
      title: 'Hypertubes',
      kind: 'logistics',
      summary:
        'Fast travel between the HUB, the Steelworks and the NW Iron Field. Update 1.1 added Hypertube Junctions and Branches.',
      tasks: [
        { id: 't4-ht-submit', label: 'Submit Hypertubes' },
        { id: 't4-ht-line', label: 'Run a Hypertube from the HUB to the NE Steelworks' },
      ],
      milestoneIds: ['Schematic_4-4_C'],
    },
    {
      id: 't4-blueprints',
      title: 'FICSIT Blueprints',
      kind: 'milestone',
      summary:
        'Blueprint your manifold modules (e.g. 4 Smelters + 4 Constructors) and stamp them out.',
      tasks: [
        { id: 't4-bp-submit', label: 'Submit FICSIT Blueprints' },
        { id: 't4-bp-module', label: 'Save a smelter/constructor manifold blueprint' },
      ],
      milestoneIds: ['Schematic_4-5_C'],
    },
    {
      id: 't4-explore',
      title: 'Hard Drives and Depot upgrades',
      kind: 'explore',
      summary:
        'Many crash sites need Rotors, Modular Frames, Steel or Motors, so they open around now. Spend Mercer Spheres on Depot upload speed.',
      tasks: [
        { id: 't4-explore-drives', label: 'Open the crash sites that are now affordable' },
        { id: 't4-explore-upload', label: 'Research Depot Upload Upgrade: 30/min and 60/min' },
      ],
      researchIds: [
        'Research_Alien_CentralUploadBoost_02_C',
        'Research_Alien_CentralStackExpansion_02_C',
      ],
      explore: [
        { kind: 'hardDrive', count: 8, note: 'Crash sites by distance' },
        { kind: 'mercerSphere', count: 10, note: 'Mercer Spheres' },
      ],
    },
  ],
};
