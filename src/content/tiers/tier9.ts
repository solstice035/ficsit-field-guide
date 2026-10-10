import type { TierGuide } from '../types.ts';

export const TIER_9: TierGuide = {
  tier: 9,
  title: 'Endgame: Matter Conversion & Quantum Encoding',
  tagline: 'SAM at scale, Ficsite, Time Crystals, Dark Matter and Project Assembly.',
  unlockedBy: 'Space Elevator Phase 4',
  spaceElevatorPhase: 5,
  briefing: [
    'Tier 9 runs on SAM. Converters turn Reanimated SAM into Ficsite and Dark Matter Residue; Quantum Encoders combine Excited Photonic Matter with everything else.',
    'Near the Rocky Desert, SAM comes from the Quartz Cave (normal) plus impure nodes on the uplands and east of the Coal Plateau. Use Miner Mk.3 and overclock.',
    'Phase 5 (1,000 Nuclear Pasta, 1,000 Biochemical Sculptors, 256 AI Expansion Servers, 200 Ballistic Warp Drives) ends the game.',
  ],
  goals: [
    'Complete all five Tier 9 milestones',
    'Run Ficsite, Time Crystals and the Quantum Encoder chain',
    'Deliver Phase 5 and launch Project Assembly',
  ],
  steps: [
    {
      id: 't9-matter',
      title: 'Matter Conversion: Converters, Ficsite and Time Crystals',
      kind: 'milestone',
      summary:
        'Converters (100–400 MW) for Ficsite Ingots, Diamonds, Time Crystals and Reanimated SAM at scale.',
      tasks: [
        { id: 't9-mc-submit', label: 'Submit Matter Conversion' },
        { id: 't9-mc-sam', label: 'SAM Fluctuator line running' },
        { id: 't9-mc-ficsite', label: 'Ficsite Trigon line running' },
        { id: 't9-mc-time', label: 'Time Crystal line running' },
      ],
      milestoneIds: ['Schematic_9-1_C'],
      layoutIds: ['t9-sam-fluctuators', 't9-ficsite', 't9-time-crystals'],
      siteIds: ['quartz-cave', 'coal-plateau'],
    },
    {
      id: 't9-quantum',
      title: 'Quantum Encoding',
      kind: 'milestone',
      summary:
        'Excited Photonic Matter, Dark Matter, Superposition Oscillators, Neural-Quantum Processors and AI Expansion Servers.',
      body: [
        'Quantum Encoders output Dark Matter Residue as a byproduct. Loop it back into Dark Matter Crystals rather than sinking it.',
        'Quantum Encoders can spike to 2,000 MW. Keep big Power Storage reserves.',
      ],
      tasks: [
        { id: 't9-qe-submit', label: 'Submit Quantum Encoding' },
        { id: 't9-qe-servers', label: 'AI Expansion Server line running' },
      ],
      milestoneIds: ['Schematic_9-2_C'],
      layoutIds: ['t9-ai-expansion-servers'],
    },
    {
      id: 't9-spatial',
      title: 'Spatial Energy Regulation: Portals and Warp Drives',
      kind: 'milestone',
      summary:
        'Main and Satellite Portals, Singularity Cells and Ballistic Warp Drives. Costs 1,000 SAM Fluctuators.',
      tasks: [
        { id: 't9-ser-submit', label: 'Submit Spatial Energy Regulation' },
        { id: 't9-ser-bwd', label: 'Ballistic Warp Drive line running' },
        { id: 't9-ser-portal', label: 'Portal between the HUB and your furthest site' },
      ],
      milestoneIds: ['Schematic_9-4_C'],
      layoutIds: ['t9-ballistic-warp-drives'],
    },
    {
      id: 't9-sculptors',
      title: 'Biochemical Sculptors',
      kind: 'build',
      summary: 'ADS + Ficsite Trigons + Water. Phase 5 needs 1,000.',
      tasks: [{ id: 't9-bs-build', label: 'Biochemical Sculptor line running' }],
      layoutIds: ['t9-biochemical-sculptors'],
    },
    {
      id: 't9-peak',
      title: 'Peak Efficiency and Blueprints Mk.3',
      kind: 'milestone',
      summary:
        'Mk.6 belts (1,200/min) and Ficsonium, which finally lets you dispose of Plutonium Waste.',
      tasks: [
        { id: 't9-pe-submit', label: 'Submit Peak Efficiency' },
        { id: 't9-bp3-submit', label: 'Submit FICSIT Blueprints Mk.3' },
      ],
      milestoneIds: ['Schematic_9-5_C', 'Schematic_9-3_C'],
    },
    {
      id: 't9-phase-5',
      title: 'Space Elevator Phase 5: Project Assembly',
      kind: 'space-elevator',
      summary:
        'Deliver the final parts, complete the tasks on the Space Elevator display and pull the lever to launch Project Assembly.',
      tasks: [
        { id: 't9-p5-pasta', label: '1,000 Nuclear Pasta' },
        { id: 't9-p5-sculptors', label: '1,000 Biochemical Sculptors' },
        { id: 't9-p5-servers', label: '256 AI Expansion Servers' },
        { id: 't9-p5-bwd', label: '200 Ballistic Warp Drives' },
        { id: 't9-p5-launch', label: 'Launch Project Assembly' },
      ],
      layoutIds: ['t8-nuclear-pasta'],
    },
    {
      id: 't9-explore',
      title: 'Finish the alien collection',
      kind: 'explore',
      summary:
        'All Mercer Sphere research (97 spheres) maxes the Dimensional Depot. The Alien Power Matrix fuels Alien Power Augmenters.',
      tasks: [
        { id: 't9-explore-depot', label: 'Max Depot upload speed and capacity' },
        { id: 't9-explore-matrix', label: 'Research Alien Power Matrix' },
      ],
      researchIds: [
        'Research_Alien_CentralUploadBoost_04_C',
        'Research_Alien_CentralStackExpansion_04_C',
        'Research_Alien_BoosterFuel_C',
      ],
      explore: [
        { kind: 'mercerSphere', count: 20, note: 'Remaining Mercer Spheres' },
        { kind: 'resource', resource: 'Desc_SAM_C', count: 6, note: 'SAM nodes near the base' },
      ],
    },
  ],
};
