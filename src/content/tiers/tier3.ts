import type { TierGuide } from '../types.ts';

export const TIER_3: TierGuide = {
  tier: 3,
  title: 'Coal Power & Steel',
  tagline: 'Real power, steel and vehicles. Expand beyond the basin.',
  unlockedBy: 'Space Elevator Phase 1',
  briefing: [
    'Coal Power ends hand-fed burners: 75 MW per generator, and one pure Coal node feeds eight of them.',
    'Steel needs iron and coal together. The North-East Steelworks has a pure Iron node and four Coal nodes within 200 m, which makes it the ideal steel town.',
    'Tier 3 is also the earliest you can build the Dimensional Depot: SAM Fluctuators are hand-craftable once you have Steel Pipe.',
  ],
  goals: [
    'Complete Coal Power and Basic Steel Production',
    'Run 600+ MW of coal power',
    'Start Versatile Framework production for Phase 2',
    'Unlock and build the Dimensional Depot',
  ],
  steps: [
    {
      id: 't3-coal-power',
      title: 'Coal Power: 8 generators on the Coal Plateau',
      kind: 'power',
      summary:
        'Three pure Coal nodes sit ~530 m east on a plateau at ~162 m. One node + 3 Water Extractors feeds 8 Coal Generators (600 MW).',
      body: [
        'Option A (dense): build on the plateau and pump water up from the basin. Each Pipeline Pump Mk.1 adds 20 m of head lift, so ~150 m needs 8+ pumps on the riser.',
        'Option B (easy water): belt coal down and build the generators at sea level. The North-East Steelworks coal nodes are at about −15 m, so check for open water there.',
        'Scale later: all three pure nodes on Mk.1 give 360 coal/min = 24 generators = 1.8 GW.',
      ],
      tasks: [
        { id: 't3-cp-submit', label: 'Submit Coal Power', milestoneId: 'Schematic_3-1_C' },
        { id: 't3-cp-water', label: 'Place 3 Water Extractors and pipe the water' },
        { id: 't3-cp-gens', label: 'Build 8 Coal Generators and connect the grid' },
        { id: 't3-cp-burners', label: 'Retire the Biomass Burners' },
      ],
      milestoneIds: ['Schematic_3-1_C'],
      layoutIds: ['t3-coal-power'],
      siteIds: ['coal-plateau', 'ne-steelworks'],
    },
    {
      id: 't3-steel',
      title: 'Basic Steel Production at the North-East Steelworks',
      kind: 'milestone',
      summary: 'Foundries, Steel Ingots, Beams, Pipes and Versatile Framework.',
      tasks: [
        {
          id: 't3-steel-submit',
          label: 'Submit Basic Steel Production',
          milestoneId: 'Schematic_3-4_C',
        },
        { id: 't3-steel-build', label: 'Build the steel line at the NE Steelworks' },
      ],
      milestoneIds: ['Schematic_3-4_C'],
      layoutIds: ['t3-steel'],
      siteIds: ['ne-steelworks'],
    },
    {
      id: 't3-versatile',
      title: 'Start Versatile Framework early',
      kind: 'build',
      summary: 'Phase 2 needs 1,000 Versatile Framework. Start a line now and let it accumulate.',
      tasks: [{ id: 't3-vf-build', label: 'Build the Versatile Framework line' }],
      layoutIds: ['t3-versatile-framework'],
    },
    {
      id: 't3-vehicles',
      title: 'Vehicular Transport: automate a tractor route',
      kind: 'logistics',
      summary:
        'Tractors and Truck Stations move steel from the NE Steelworks to the HUB without a 1.2 km belt.',
      body: [
        'Update 1.2 reworked vehicle path recording. Record the route once and it replays reliably.',
      ],
      tasks: [
        {
          id: 't3-veh-submit',
          label: 'Submit Vehicular Transport',
          milestoneId: 'Schematic_3-3_C',
        },
        { id: 't3-veh-route', label: 'Truck Stations at the Steelworks and HUB; record a route' },
      ],
      milestoneIds: ['Schematic_3-3_C'],
    },
    {
      id: 't3-asset-security',
      title: 'Enhanced Asset Security',
      kind: 'milestone',
      summary:
        'The Xeno-Basher: a better melee weapon for cave clearing. Cheap and worth it before going deeper into the Quartz Cave.',
      tasks: [
        {
          id: 't3-eas-submit',
          label: 'Submit Enhanced Asset Security',
          milestoneId: 'Schematic_4-2_C',
        },
      ],
      milestoneIds: ['Schematic_4-2_C'],
    },
    {
      id: 't3-depot',
      title: 'Dimensional Depot: the best early upgrade',
      kind: 'research',
      summary:
        'SAM Analysis → SAM Reanimation → SAM Fluctuator → Dimensional Depot. Uploaded items can be used by the Build Gun from anywhere.',
      body: [
        'Reanimated SAM: 4 SAM → 1 in a Constructor (or by hand). SAM Fluctuator: hand-craftable from Reanimated SAM, Wire and Steel Pipe.',
        'Each Dimensional Depot Uploader costs 1 Mercer Sphere, 10 SAM Fluctuators, 10 Modular Frames and 100 Wire, and starts at 15 items/min.',
        'Upload speed and capacity upgrades cost 92 Mercer Spheres in total. Collect spheres on every trip.',
      ],
      tasks: [
        { id: 't3-depot-sam', label: 'Research SAM Reanimation and SAM Fluctuator' },
        { id: 't3-depot-research', label: 'Research Dimensional Depot' },
        { id: 't3-depot-build', label: 'Build Uploaders on your Iron Works and steel outputs' },
      ],
      researchIds: [
        'Research_Alien_ActiveSAM_C',
        'Research_Alien_SAMFluctuator_C',
        'Research_Alien_CentralStorage_C',
        'Research_Alien_CentralUploadBoost_01_C',
        'Research_Alien_CentralStackExpansion_01_C',
      ],
      siteIds: ['quartz-cave'],
      explore: [
        {
          kind: 'resource',
          resource: 'Desc_SAM_C',
          count: 4,
          note: 'SAM nodes for Reanimated SAM',
        },
        { kind: 'mercerSphere', count: 10, note: 'Mercer Spheres for Depot upgrades' },
      ],
    },
    {
      id: 't3-sulfur',
      title: 'Sulfur research and Nobelisks',
      kind: 'research',
      summary:
        'Black Powder and the Nobelisk Detonator clear the boulders that block some crash sites and cave entrances. Sulfur is ~1.4 km away, so bring a little back.',
      tasks: [
        { id: 't3-sulfur-mine', label: 'Mine 100 Sulfur at the nearest node' },
        { id: 't3-sulfur-research', label: 'Research Sulfur → Black Powder → Nobelisk Detonator' },
      ],
      researchIds: ['Research_Sulfur_0_C', 'Research_Sulfur_1_C', 'Research_Sulfur_3_1_C'],
      siteIds: ['sulfur'],
    },
  ],
};
