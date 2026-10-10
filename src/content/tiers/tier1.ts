import type { TierGuide } from '../types.ts';

export const TIER_1: TierGuide = {
  tier: 1,
  title: 'Field Research',
  tagline: 'Foundations, logistics and the MAM. Turn the basin into a real factory.',
  unlockedBy: 'HUB Upgrade 6',
  briefing: [
    'Tier 1 gives you foundations, splitters and mergers, and the MAM research station. Tiers 1 and 2 unlock together, so you can interleave them.',
    'This is the moment to rebuild the starter lines properly on a foundation grid, sized for all three pure Iron nodes.',
    'The MAM is your exploration engine: Caterium, Quartz, Power Slugs and the alien artefacts (Mercer Spheres, Somersloops, SAM) all start here.',
  ],
  goals: [
    'Complete Base Building, Logistics and Field Research',
    'Run Iron Works Mk.1, Copper Works and the Concrete Plant',
    'Research Caterium, Quartz, Power Slugs and the alien artefact analyses in the MAM',
  ],
  steps: [
    {
      id: 't1-power',
      title: 'Stabilise power with Biomass Burners',
      kind: 'power',
      summary:
        'Early factories run on 30 MW Biomass Burners. Keep a stockpile of Biomass and expand to 4–6 burners.',
      body: [
        'Biomass Burners must be fed by hand until coal power in Tier 3. Each burns Biomass (180 MJ) at 30 MW, so roughly 10 Biomass/min each.',
        'Solid Biofuel (Tier 2, Obstacle Clearing) holds 450 MJ per item and lasts 2.5× longer per slot. Switch as soon as you can.',
        'Put the burners and a Biomass Constructor together so refuelling is one stop.',
      ],
      tasks: [
        { id: 't1-power-burners', label: 'Run 4+ Biomass Burners' },
        { id: 't1-power-stock', label: 'Stockpile 400+ Biomass' },
      ],
    },
    {
      id: 't1-base-building',
      title: 'Base Building: get on a grid',
      kind: 'milestone',
      summary:
        'Foundations, walls and ramps. Rebuild the starter factory on an 8 m foundation grid.',
      body: [
        'Use the HUB Basin floor. A 10 × 6 foundation pad between the pure Iron nodes fits a full iron manifold.',
        'Concrete is the limiter: every foundation costs Concrete, so build the Concrete Plant first.',
      ],
      tasks: [
        { id: 't1-bb-submit', label: 'Submit Base Building' },
        { id: 't1-bb-pad', label: 'Lay a foundation pad for the Iron Works' },
      ],
      milestoneIds: ['Schematic_1-1_C'],
      layoutIds: ['t1-concrete-plant'],
    },
    {
      id: 't1-logistics',
      title: 'Logistics: splitters, mergers, lifts',
      kind: 'milestone',
      summary: 'Manifolds become possible. One belt feeds a row of machines through splitters.',
      body: [
        'Manifold rule of thumb: feed the full rate in and let it back up. The machines fill over a few minutes and then run at 100%.',
      ],
      tasks: [
        { id: 't1-log-submit', label: 'Submit Logistics' },
        { id: 't1-log-manifold', label: 'Convert the smelter row to a splitter manifold' },
      ],
      milestoneIds: ['Schematic_1-2_C'],
    },
    {
      id: 't1-iron-works',
      title: 'Build Iron Works Mk.1',
      kind: 'build',
      summary:
        'All three pure Iron nodes (belt-capped at 60/min each) into plates, rods and screws. This is the backbone of Tiers 1–2.',
      tasks: [
        { id: 't1-iron-miners', label: 'Miners on all three pure Iron nodes' },
        { id: 't1-iron-build', label: 'Build the smelter and constructor manifolds' },
        { id: 't1-iron-storage', label: 'Outputs into labelled storage near the HUB' },
      ],
      layoutIds: ['t1-iron-works'],
      siteIds: ['hub'],
    },
    {
      id: 't1-copper',
      title: 'Copper Works and Concrete',
      kind: 'build',
      summary: 'Wire, Cable and Concrete at full Mk.1 belt rates.',
      tasks: [
        { id: 't1-copper-build', label: 'Build Copper Works' },
        { id: 't1-concrete-build', label: 'Build the Concrete Plant (2 Limestone nodes)' },
      ],
      layoutIds: ['t1-copper-works', 't1-concrete-plant'],
      siteIds: ['hub'],
    },
    {
      id: 't1-field-research',
      title: 'Field Research: the MAM',
      kind: 'milestone',
      summary:
        'Unlocks the MAM, Object Scanner and Personal Storage Box. Research is where exploration pays off.',
      tasks: [
        { id: 't1-fr-submit', label: 'Submit Field Research' },
        { id: 't1-fr-mam', label: 'Build the MAM next to the HUB' },
        { id: 't1-fr-scanner', label: 'Craft the Object Scanner' },
      ],
      milestoneIds: ['Schematic_1-3_C'],
    },
    {
      id: 't1-mam',
      title: 'First MAM research',
      kind: 'research',
      summary:
        'Start with what unblocks you: Caterium and Quartz for later tiers, Power Slugs for overclocking, and the alien analyses so you can scan for spheres, Somersloops and SAM.',
      body: [
        'Caterium research adds Caterium to the resource scanner and leads to Quickwire. That unlocks the Zipline, Power Poles Mk.2 and AI Limiters.',
        'Mercer Sphere Analysis, Somersloop Analysis and SAM Analysis each cost a single sample (10 for SAM) and let the Object Scanner find more.',
        'Blue Power Slugs → Power Shards → Overclock Production lets machines run up to 250%.',
      ],
      tasks: [
        { id: 't1-mam-caterium', label: 'Caterium → Caterium Ingots' },
        { id: 't1-mam-quartz', label: 'Quartz → Quartz Crystals and Silica' },
        { id: 't1-mam-slugs', label: 'Blue Power Slugs and Slug Scanning' },
        { id: 't1-mam-alien', label: 'Mercer Sphere, Somersloop and SAM Analysis' },
      ],
      researchIds: [
        'Research_Caterium_0_C',
        'Research_Caterium_1_C',
        'Research_Quartz_0_C',
        'Research_Quartz_1_1_C',
        'Research_PowerSlugs_1_C',
        'Research_PowerSlugs_3_C',
        'Research_Alien_MercerSphere_C',
        'Research_Alien_Somersloop_C',
        'Research_Alien_SAM_C',
      ],
    },
    {
      id: 't1-explore',
      title: 'Scout Caterium, Quartz and SAM',
      kind: 'explore',
      summary:
        'Pure Caterium is ~490 m north on Caterium Ridge. The Quartz Cave (2 pure + 1 normal Quartz and a normal SAM node) is ~1.1 km north.',
      body: [
        'Take ammo and healing into the Quartz Cave: expect Stingers and Flying Crabs.',
        'Collect 10 SAM for SAM Analysis while you are there. SAM ore can be hand-mined.',
      ],
      tasks: [
        { id: 't1-explore-caterium', label: 'Visit Caterium Ridge and mine 50 Caterium Ore' },
        { id: 't1-explore-quartz', label: 'Visit the Quartz Cave and mine 20+ Raw Quartz' },
        { id: 't1-explore-sam', label: 'Collect 10 SAM' },
      ],
      siteIds: ['caterium-ridge', 'quartz-cave'],
      explore: [
        { kind: 'resource', resource: 'Desc_SAM_C', count: 3, note: 'Nearest SAM nodes' },
        { kind: 'mercerSphere', count: 5, note: 'Mercer Spheres for the Dimensional Depot' },
        { kind: 'slugBlue', count: 10, note: 'Blue Power Slugs for Power Shards' },
      ],
    },
  ],
};
