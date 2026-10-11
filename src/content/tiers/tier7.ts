import type { TierGuide } from '../types.ts';

export const TIER_7: TierGuide = {
  tier: 7,
  title: 'Aluminium & Control Systems',
  tagline: 'Bauxite, Blenders, Supercomputers and Assembly Director Systems.',
  unlockedBy: 'Space Elevator Phase 3',
  briefing: [
    'Bauxite Refinement opens aluminium: Bauxite → Alumina Solution → Aluminum Scrap → Aluminum Ingots, with water recycled from the scrap step.',
    'The Bauxite Uplands (2 pure + 1 normal Bauxite) are ~550 m south of the HUB on high ground. Pure Quartz for Silica is ~1.1 km south-east.',
    'Control System Development brings the Blender, Batteries, Radio Control Units, Supercomputers and Assembly Director Systems (Phase 4).',
  ],
  goals: [
    'Complete Bauxite Refinement, Logistics Mk.5 and Control System Development',
    'Run Aluminium Ingots, Alclad Sheets and Casings',
    'Start Supercomputers and Assembly Director Systems for Phase 4',
  ],
  steps: [
    {
      id: 't7-bauxite',
      title: 'Bauxite Refinement at the Bauxite Uplands',
      kind: 'milestone',
      summary:
        'Aluminium chain with the water loop closed. Silica from the Alumina byproduct plus Raw Quartz.',
      body: [
        'The uplands sit at ~180–240 m, so place the Alumina refineries where water is easy (pumps or a Fluid Truck), then belt Aluminum Scrap up.',
      ],
      tasks: [
        { id: 't7-bx-submit', label: 'Submit Bauxite Refinement', milestoneId: 'Schematic_7-1_C' },
        { id: 't7-bx-ingots', label: 'Aluminium Ingot line running' },
        { id: 't7-bx-alclad', label: 'Alclad Sheets and Casings running' },
      ],
      milestoneIds: ['Schematic_7-1_C'],
      layoutIds: ['t7-aluminium-ingots', 't7-alclad-casings'],
      siteIds: ['bauxite-uplands', 'south-east-quartz'],
    },
    {
      id: 't7-logistics-mk5',
      title: 'Logistics Mk.5: 780/min',
      kind: 'logistics',
      summary: 'Mk.5 belts carry a pure node on Miner Mk.3 at 160% (780/min) on one belt.',
      tasks: [
        { id: 't7-l5-submit', label: 'Submit Logistics Mk.5', milestoneId: 'Schematic_7-2_C' },
      ],
      milestoneIds: ['Schematic_7-2_C'],
    },
    {
      id: 't7-control',
      title: 'Control System Development',
      kind: 'milestone',
      summary:
        'Blender, Sulfuric Acid, Batteries, Radio Control Units, Supercomputers and Assembly Director Systems.',
      tasks: [
        {
          id: 't7-csd-submit',
          label: 'Submit Control System Development',
          milestoneId: 'Schematic_7-5_C',
        },
        { id: 't7-csd-rcu', label: 'Radio Control Unit line running' },
        { id: 't7-csd-super', label: 'Supercomputer line running' },
      ],
      milestoneIds: ['Schematic_7-5_C'],
      layoutIds: ['t7-radio-control-units', 't7-supercomputers'],
    },
    {
      id: 't7-ads',
      title: 'Assembly Director Systems (Phase 4 prep)',
      kind: 'build',
      summary:
        'Phase 4 needs 500 ADS. At standard recipes that is many hours, so start early and scale.',
      tasks: [{ id: 't7-ads-build', label: 'ADS line running' }],
      layoutIds: ['t7-assembly-director'],
    },
    {
      id: 't7-batteries',
      title: 'Batteries and Sulfur',
      kind: 'build',
      summary:
        'Batteries need Sulfuric Acid. Sulfur is the Rocky Desert’s weak spot, so secure the nearest nodes now.',
      tasks: [
        { id: 't7-bat-sulfur', label: 'Miners on the nearest Sulfur nodes' },
        { id: 't7-bat-build', label: 'Battery line running' },
      ],
      layoutIds: ['t7-batteries'],
      siteIds: ['sulfur'],
    },
    {
      id: 't7-hazmat',
      title: 'Hazmat Suit (before Uranium)',
      kind: 'milestone',
      summary: 'Hazmat Suit and Iodine-Infused Filters. Needed to work near Uranium in Tier 8.',
      tasks: [{ id: 't7-hz-submit', label: 'Submit Hazmat Suit', milestoneId: 'Schematic_7-3_C' }],
      milestoneIds: ['Schematic_7-3_C'],
    },
    {
      id: 't7-hoverpack',
      title: 'Hoverpack',
      kind: 'milestone',
      summary: 'Flight along power lines: great for building tall factories on the uplands.',
      tasks: [{ id: 't7-hp-submit', label: 'Submit Hoverpack', milestoneId: 'Schematic_8-3_C' }],
      milestoneIds: ['Schematic_8-3_C'],
    },
    {
      id: 't7-explore',
      title: 'Scout Uranium and Nitrogen',
      kind: 'explore',
      summary:
        'Normal Uranium ~1.2 km south-east at (−759, 516). The Nitrogen well (7 pure satellites) ~1.6 km south.',
      tasks: [
        { id: 't7-explore-uranium', label: 'Visit the Uranium node (bring the Hazmat Suit)' },
        { id: 't7-explore-nitrogen', label: 'Visit the Southern Nitrogen Well' },
      ],
      siteIds: ['south-east-quartz', 'nitrogen-well'],
      explore: [
        { kind: 'resource', resource: 'Desc_OreUranium_C', count: 2, note: 'Uranium nodes' },
        { kind: 'resource', resource: 'Desc_NitrogenGas_C', count: 2, note: 'Nitrogen wells' },
      ],
    },
  ],
};
