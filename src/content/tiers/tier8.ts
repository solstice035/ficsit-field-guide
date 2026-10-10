import type { TierGuide } from '../types.ts';

export const TIER_8: TierGuide = {
  tier: 8,
  title: 'Nuclear & Particle Enrichment',
  tagline: 'Nuclear power, Nitrogen, Turbo Motors, Nuclear Pasta and Phase 4.',
  unlockedBy: 'Space Elevator Phase 3',
  spaceElevatorPhase: 4,
  briefing: [
    'Nuclear Power gives 2,500 MW per reactor but creates Uranium Waste you must store (or process into Plutonium). Plan the whole fuel cycle before building.',
    'Advanced Aluminum Production unlocks Resource Wells. The Southern Nitrogen Well has 7 pure satellites: 840 m³/min of Nitrogen from one Pressurizer.',
    'Phase 4 needs Assembly Director Systems, Magnetic Field Generators, Thermal Propulsion Rockets and Nuclear Pasta. It is the hardest delivery yet.',
  ],
  goals: [
    'Complete all five Tier 8 milestones',
    'Run at least one Nuclear Power Plant',
    'Deliver Space Elevator Phase 4',
  ],
  steps: [
    {
      id: 't8-nuclear',
      title: 'Nuclear Power',
      kind: 'power',
      summary: 'Uranium → Encased Uranium Cells → Uranium Fuel Rods → 2,500 MW per reactor.',
      body: [
        'One reactor burns 0.2 rods/min and 240 m³/min water, and makes 10 Uranium Waste/min.',
        'Waste cannot be sunk or destroyed until Ficsonium (Tier 9). Store it in a dedicated, isolated building.',
      ],
      tasks: [
        { id: 't8-nuc-submit', label: 'Submit Nuclear Power' },
        { id: 't8-nuc-fuel', label: 'Fuel rod line running' },
        { id: 't8-nuc-reactor', label: 'First reactor online with waste storage' },
      ],
      milestoneIds: ['Schematic_8-1_C'],
      layoutIds: ['t8-nuclear-power'],
      siteIds: ['south-east-quartz'],
    },
    {
      id: 't8-nitrogen',
      title: 'Advanced Aluminum Production: Resource Wells',
      kind: 'milestone',
      summary:
        'Pressurizer + Extractors on the Southern Nitrogen Well. Heat Sinks, Cooling Systems and Fused Modular Frames.',
      tasks: [
        { id: 't8-aap-submit', label: 'Submit Advanced Aluminum Production' },
        { id: 't8-aap-well', label: 'Pressurizer and satellites running' },
        { id: 't8-aap-cooling', label: 'Cooling System line running' },
        { id: 't8-aap-fmf', label: 'Fused Modular Frame line running' },
      ],
      milestoneIds: ['Schematic_8-2_C'],
      layoutIds: ['t8-cooling-systems', 't8-fused-frames'],
      siteIds: ['nitrogen-well'],
    },
    {
      id: 't8-leading-edge',
      title: 'Leading-Edge Production: Turbo Motors and Miner Mk.3',
      kind: 'milestone',
      summary:
        'Turbo Motors, Thermal Propulsion Rockets and Miner Mk.3 (480 ore/min on a pure node).',
      tasks: [
        { id: 't8-lep-submit', label: 'Submit Leading-Edge Production' },
        { id: 't8-lep-turbo', label: 'Turbo Motor line running' },
        { id: 't8-lep-mk3', label: 'Retrofit pure nodes with Miner Mk.3' },
      ],
      milestoneIds: ['Schematic_8-4_C'],
      layoutIds: ['t8-turbo-motors'],
    },
    {
      id: 't8-particle',
      title: 'Particle Enrichment: Nuclear Pasta',
      kind: 'milestone',
      summary:
        'Particle Accelerators, Copper Powder and Pressure Conversion Cubes. Nuclear Pasta is very copper-hungry.',
      tasks: [
        { id: 't8-pe-submit', label: 'Submit Particle Enrichment' },
        { id: 't8-pe-pasta', label: 'Nuclear Pasta line running' },
      ],
      milestoneIds: ['Schematic_8-5_C'],
      layoutIds: ['t8-nuclear-pasta'],
      siteIds: ['west-coast'],
    },
    {
      id: 't8-drones',
      title: 'Aeronautical Engineering: Drones',
      kind: 'logistics',
      summary:
        'Drones move low-volume, high-value parts (Supercomputers, Turbo Motors) between distant sites.',
      tasks: [{ id: 't8-ae-submit', label: 'Submit Aeronautical Engineering' }],
      milestoneIds: ['Schematic_7-4_C'],
    },
    {
      id: 't8-phase-4',
      title: 'Space Elevator Phase 4',
      kind: 'space-elevator',
      summary: 'Deliver 500 ADS, 500 MFG, 250 TPR and 100 Nuclear Pasta. Unlocks Tier 9.',
      tasks: [
        { id: 't8-p4-mfg', label: 'Magnetic Field Generator line running' },
        { id: 't8-p4-tpr', label: 'Thermal Propulsion Rocket line running' },
        { id: 't8-p4-deliver', label: 'Deliver Phase 4' },
      ],
      layoutIds: ['t8-magnetic-field-generators', 't8-thermal-rockets'],
    },
    {
      id: 't8-explore',
      title: 'Somersloops on your bottlenecks',
      kind: 'explore',
      summary:
        'Amplify the slowest Phase 4 machines (TPR Manufacturers, Nuclear Pasta accelerators). Each 4-slot machine doubles with 4 sloops.',
      tasks: [{ id: 't8-explore-sloops', label: 'Collect 16+ Somersloops' }],
      explore: [{ kind: 'somersloop', count: 16, note: 'Somersloops by distance' }],
    },
  ],
};
