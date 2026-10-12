import type { TierGuide } from '../types.ts';

export const TIER_0: TierGuide = {
  tier: 0,
  title: 'Onboarding',
  tagline: 'Land, build the HUB and automate your first iron, copper and concrete.',
  unlockedBy: 'Game start',
  briefing: [
    'The Rocky Desert is one of the friendliest starts in the game. The terrain is flat, and three pure Iron nodes and a pure Copper node sit within 300 m of the drop site.',
    'Tier 0 is six HUB Upgrades that must be completed in order. Finishing HUB Upgrade 6 unlocks Tiers 1 and 2 and the Space Elevator.',
    'Hand-craft only until HUB Upgrade 5 gives you Miners, then automate everything. Every hour of hand-crafting is an hour not spent building.',
  ],
  goals: [
    'Complete HUB Upgrades 1–6',
    'Automate Iron Plates, Iron Rods, Screws, Wire, Cable and Concrete',
    'Build the Space Elevator',
  ],
  steps: [
    {
      id: 't0-land',
      title: 'Land and build the HUB',
      kind: 'build',
      summary:
        'Dismantle the drop pod for its 20 Iron Ore and place the HUB in the HUB Basin, between the pure Iron nodes.',
      body: [
        'The HUB costs exactly the 20 Iron Ore the drop pod returns. It starts with only a Craft Bench and the HUB Terminal.',
        'Place it on flat ground near (−1,640, −330). Two pure Iron nodes are ~70–80 m west, the third pure Iron and the pure Copper are ~150 m east, and normal Limestone is ~180 m east.',
        'Leave a clear area of at least 6 × 6 foundations next to the HUB for the Space Elevator later.',
      ],
      tasks: [
        { id: 't0-land-pod', label: 'Dismantle the drop pod (20 Iron Ore)' },
        { id: 't0-land-hub', label: 'Place the HUB in the HUB Basin' },
        {
          id: 't0-land-scout',
          label: 'Walk the basin and mark the 3 pure Iron, 1 pure Copper and Limestone nodes',
        },
      ],
      siteIds: ['hub'],
    },
    {
      id: 't0-hub1',
      title: 'HUB Upgrade 1: first hand-crafted rods',
      kind: 'milestone',
      summary: 'Mine Iron Ore by hand, smelt and craft 10 Iron Rods at the Craft Bench.',
      tasks: [
        { id: 't0-hub1-mine', label: 'Hand-mine ~40 Iron Ore from a pure node' },
        { id: 't0-hub1-craft', label: 'Craft Iron Ingots, then 10 Iron Rods' },
        {
          id: 't0-hub1-submit',
          label: 'Submit HUB Upgrade 1',
          milestoneId: 'Schematic_Tutorial1_C',
        },
      ],
      milestoneIds: ['Schematic_Tutorial1_C'],
      tips: ['Hold the craft button: crafting speeds up the longer you hold it.'],
    },
    {
      id: 't0-portable',
      title: 'Drop Portable Miners on pure iron',
      kind: 'build',
      summary:
        'Build the Equipment Workshop, craft two Portable Miners and drop them on pure Iron. Free, slow ore while you work.',
      body: [
        'Portable Miners need no power. Empty them whenever you pass the HUB.',
        'You will also need one Portable Miner per Miner Mk.1 at HUB Upgrade 5, so keep the Workshop.',
      ],
      tasks: [
        { id: 't0-portable-workshop', label: 'Build the Equipment Workshop' },
        { id: 't0-portable-craft', label: 'Craft 2 Portable Miners' },
        { id: 't0-portable-place', label: 'Place them on the two western pure Iron nodes' },
      ],
      siteIds: ['hub'],
    },
    {
      id: 't0-hub2',
      title: 'HUB Upgrade 2: smelting and the first burner',
      kind: 'milestone',
      summary:
        'Unlocks the Smelter, Power Lines, Copper Ingots, Wire, Cable and the HUB’s first Biomass Burner (20 MW).',
      body: [
        'Gather Leaves and Wood as you explore. A HUB burner runs on them; standalone Biomass Burners (30 MW) arrive with HUB Upgrade 6.',
        'Place a Smelter beside the iron nodes and connect it to the HUB with a Power Line. Hand-feed it ore for now.',
      ],
      tasks: [
        {
          id: 't0-hub2-submit',
          label: 'Submit HUB Upgrade 2 (20 Iron Rod, 10 Iron Plate)',
          milestoneId: 'Schematic_Tutorial1_5_C',
        },
        { id: 't0-hub2-fuel', label: 'Collect 100+ Leaves and some Wood for the burner' },
        { id: 't0-hub2-smelter', label: 'Build and power a Smelter on Iron' },
        { id: 't0-hub2-copper', label: 'Hand-mine copper and craft Wire and Cable' },
      ],
      milestoneIds: ['Schematic_Tutorial1_5_C'],
    },
    {
      id: 't0-hub3',
      title: 'HUB Upgrade 3: Constructors',
      kind: 'milestone',
      summary: 'Unlocks Constructors, Power Poles, Concrete, Screws and Reinforced Iron Plates.',
      body: [
        'Place a Constructor next to each Smelter: Iron Plates first, then Iron Rods. Hand-feed ingots until belts arrive.',
        'Start one Constructor on Concrete from the normal Limestone east of the HUB.',
      ],
      tasks: [
        {
          id: 't0-hub3-submit',
          label: 'Submit HUB Upgrade 3 (20 Plate, 20 Rod, 20 Wire)',
          milestoneId: 'Schematic_Tutorial2_C',
        },
        { id: 't0-hub3-plates', label: 'Build Constructors for Plates and Rods' },
        { id: 't0-hub3-concrete', label: 'Build a Concrete Constructor' },
      ],
      milestoneIds: ['Schematic_Tutorial2_C'],
    },
    {
      id: 't0-hub4',
      title: 'HUB Upgrade 4: Conveyor Belts',
      kind: 'milestone',
      summary:
        'Belts at 60 items/min. Connect smelters to constructors and constructors to storage.',
      tasks: [
        {
          id: 't0-hub4-submit',
          label: 'Submit HUB Upgrade 4 (75 Plate, 20 Cable, 10 Concrete)',
          milestoneId: 'Schematic_Tutorial3_C',
        },
        { id: 't0-hub4-belts', label: 'Belt Smelters → Constructors → storage' },
      ],
      milestoneIds: ['Schematic_Tutorial3_C'],
      layoutIds: ['t0-starter-iron'],
    },
    {
      id: 't0-hub5',
      title: 'HUB Upgrade 5: Miners',
      kind: 'milestone',
      summary:
        'Miner Mk.1 and Storage Containers, plus the HUB’s second Biomass Burner. Automate iron, copper and concrete.',
      body: [
        'Each Miner Mk.1 costs a Portable Miner, 10 Iron Plates and 10 Concrete.',
        'A Miner Mk.1 on a pure node makes 120 ore/min, but a Mk.1 belt only carries 60. Run starter lines at 60/min until Logistics Mk.2.',
      ],
      tasks: [
        {
          id: 't0-hub5-submit',
          label: 'Submit HUB Upgrade 5 (75 Rod, 50 Cable, 20 Concrete)',
          milestoneId: 'Schematic_Tutorial4_C',
        },
        { id: 't0-hub5-iron', label: 'Miners on two pure Iron nodes' },
        { id: 't0-hub5-copper', label: 'Miner on the pure Copper node' },
        { id: 't0-hub5-lime', label: 'Miner on a Limestone node' },
      ],
      milestoneIds: ['Schematic_Tutorial4_C'],
      layoutIds: ['t0-starter-iron', 't0-starter-copper', 't0-starter-concrete'],
      siteIds: ['hub'],
    },
    {
      id: 't0-hub6',
      title: 'HUB Upgrade 6: the Space Elevator',
      kind: 'milestone',
      summary:
        'Unlocks the Space Elevator, standalone Biomass Burners (30 MW) and Biomass recipes. Completing it opens Tiers 1 and 2.',
      tasks: [
        {
          id: 't0-hub6-submit',
          label: 'Submit HUB Upgrade 6 (100 Rod, 100 Plate, 100 Wire, 50 Concrete)',
          milestoneId: 'Schematic_Tutorial5_C',
        },
        { id: 't0-hub6-elevator', label: 'Build the Space Elevator beside the HUB' },
        { id: 't0-hub6-burners', label: 'Build 2–3 standalone Biomass Burners' },
        {
          id: 't0-hub6-biomass',
          label: 'Set a Constructor to Biomass (Leaves) and keep it stocked',
        },
      ],
      milestoneIds: ['Schematic_Tutorial5_C'],
    },
    {
      id: 't0-explore',
      title: 'Early exploration around the basin',
      kind: 'explore',
      summary:
        'Pick up Power Slugs, Mercer Spheres and Somersloops as you go. You will research them once the MAM is unlocked in Tier 1.',
      body: [
        'Blue Power Slugs become Power Shards (overclocking) later. Grab every one you see.',
        'Mercer Spheres unlock the Dimensional Depot, the best quality-of-life upgrade in the game. Somersloops double machine output much later.',
        'Note any crash sites (Hard Drives). Most need parts you cannot make yet, and the Explore page shows the tier each one opens at.',
      ],
      tasks: [
        { id: 't0-explore-slugs', label: 'Collect 5 Blue Power Slugs' },
        { id: 't0-explore-sphere', label: 'Collect your first Mercer Sphere' },
        { id: 't0-explore-sloop', label: 'Collect your first Somersloop' },
      ],
      explore: [
        { kind: 'slugBlue', count: 5, note: 'Nearest Blue Power Slugs to your base' },
        { kind: 'mercerSphere', count: 3, note: 'Nearest Mercer Spheres' },
        { kind: 'somersloop', count: 2, note: 'Nearest Somersloops' },
      ],
    },
  ],
};
