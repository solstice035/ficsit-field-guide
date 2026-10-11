import type { TierGuide } from '../types.ts';

export const TIER_5: TierGuide = {
  tier: 5,
  title: 'Oil Processing',
  tagline: 'Plastic, Rubber, Fuel Power and Mk.4 logistics from the coastal oil field.',
  unlockedBy: 'Space Elevator Phase 2',
  briefing: [
    'The Rocky Desert has a compact oil field on the south-west coast: 2 pure + 2 normal Crude Oil nodes, ~1.3 km from the HUB.',
    'Refineries make Plastic and Rubber with Heavy Oil Residue as a byproduct. Every refinery output must have somewhere to go or the machine stops.',
    'Fuel Generators (250 MW each) on refinery Fuel are your next power step.',
  ],
  goals: [
    'Complete Oil Processing, Petroleum Power and Logistics Mk.4',
    'Run Plastic, Rubber and Circuit Boards',
    'Add 1 GW of Fuel power',
  ],
  steps: [
    {
      id: 't5-oil',
      title: 'Oil Processing at the Coastal Oil Field',
      kind: 'milestone',
      summary:
        'Oil Extractors (Mk.1 output: 120/240 m³/min on normal/pure) and Refineries for Plastic and Rubber.',
      body: [
        'A Mk.1 pipe carries 300 m³/min; pure nodes at 100% produce 240, so one pipe per pure node is safe.',
        'Pipe the Heavy Oil Residue to a Residual Fuel refinery, or package it and sink it.',
      ],
      tasks: [
        { id: 't5-oil-submit', label: 'Submit Oil Processing' },
        { id: 't5-oil-extract', label: 'Oil Extractors on both pure nodes' },
        { id: 't5-oil-refine', label: 'Plastic and Rubber refineries running' },
      ],
      milestoneIds: ['Schematic_5-1_C'],
      layoutIds: ['t5-plastic-rubber'],
      siteIds: ['coastal-oil'],
    },
    {
      id: 't5-fuel-power',
      title: 'Petroleum Power: Fuel Generators',
      kind: 'power',
      summary: '4 Fuel Generators = 1 GW on 80 m³/min of Fuel from 120 m³/min Crude.',
      tasks: [
        { id: 't5-pp-submit', label: 'Submit Petroleum Power' },
        { id: 't5-pp-build', label: 'Build the Fuel power plant' },
      ],
      milestoneIds: ['Schematic_5-5_C'],
      layoutIds: ['t5-fuel-power'],
    },
    {
      id: 't5-circuits',
      title: 'Circuit Boards',
      kind: 'build',
      summary: 'Copper Sheets + Plastic. Needed for Computers (Tier 6) and High-Speed Connectors.',
      tasks: [{ id: 't5-cb-build', label: 'Build the Circuit Board line' }],
      layoutIds: ['t5-circuit-boards'],
    },
    {
      id: 't5-packaging',
      title: 'Fluid Packaging',
      kind: 'milestone',
      summary:
        'Packagers turn fluids into items for vehicles, the AWESOME Sink and long-distance transport.',
      tasks: [{ id: 't5-fp-submit', label: 'Submit Fluid Packaging' }],
      milestoneIds: ['Schematic_5-4_C'],
    },
    {
      id: 't5-logistics-mk4',
      title: 'Logistics Mk.4: 480/min belts, Trucks and (1.2) Fluid Trucks',
      kind: 'logistics',
      summary:
        'Mk.4 belts, the Truck and, since Update 1.2, the Fluid Truck Station and Fluid Truck (3,200 m³ capacity).',
      body: [
        'A Fluid Truck can ferry Fuel or Water to sites where pipes are impractical, like the Coal Plateau.',
      ],
      tasks: [
        { id: 't5-l4-submit', label: 'Submit Logistics Mk.4' },
        { id: 't5-l4-truck', label: 'Set up a truck route: coast → HUB (Plastic, Rubber)' },
      ],
      milestoneIds: ['Schematic_6-1_C'],
    },
    {
      id: 't5-jetpack',
      title: 'Jetpack',
      kind: 'milestone',
      summary: 'Vertical mobility for the Rocky Desert cliffs and the Coal Plateau.',
      tasks: [{ id: 't5-jp-submit', label: 'Submit Jetpack' }],
      milestoneIds: ['Schematic_6-2_C'],
    },
    {
      id: 't5-caterium',
      title: 'AI Limiters and High-Speed Connectors',
      kind: 'research',
      summary:
        'Caterium electronics for Supercomputers (Tier 7), Smart and Programmable Splitters and the Geothermal Generator.',
      tasks: [
        { id: 't5-cat-line', label: 'Build the AI Limiter line' },
        { id: 't5-cat-research', label: 'Research High-Speed Connector and Smart Splitter' },
      ],
      layoutIds: ['t5-caterium-electronics'],
      researchIds: [
        'Research_Caterium_5_C',
        'Research_Caterium_4_1_1_C',
        'Research_Caterium_7_2_C',
      ],
      siteIds: ['caterium-ridge', 'geysers'],
    },
    {
      id: 't5-explore',
      title: 'Oil alternates and Turbofuel',
      kind: 'explore',
      summary:
        'Hard Drives worth hunting now: Heavy Oil Residue, Diluted (Packaged) Fuel, Recycled Plastic and Rubber. MAM Turbofuel costs a Hard Drive.',
      tasks: [
        { id: 't5-explore-drives', label: 'Research 3+ Hard Drives' },
        { id: 't5-explore-turbo', label: 'Research Compacted Coal → Turbofuel' },
      ],
      researchIds: ['Research_Sulfur_CompactedCoal_C', 'Research_Sulfur_TurboFuel_C'],
      explore: [{ kind: 'hardDrive', count: 8, note: 'Crash sites by distance' }],
    },
  ],
};
