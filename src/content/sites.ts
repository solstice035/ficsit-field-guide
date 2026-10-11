import type { Site } from './types.ts';

/**
 * Rocky Desert site atlas, derived from 1.0+ node coordinates.
 * Coordinates are metres (x east, y south; north is −y). Elevations come from
 * the node data; terrain access (cliffs, water) should be checked in game.
 */
export const DEFAULT_BASE = { x: -1640, y: -330, z: 0 } as const;

export const SITES: readonly Site[] = [
  {
    id: 'hub',
    name: 'HUB Basin',
    role: 'Tiers 0–2 core: 3 pure iron, pure copper and limestone within 300 m',
    centre: { x: -1620, y: -340 },
    nodeIds: [
      'BP_ResourceNode114',
      'BP_ResourceNode115',
      'BP_ResourceNode116',
      'BP_ResourceNode117',
      'BP_ResourceNode119',
      'BP_ResourceNode118_4340',
      'BP_ResourceNode158',
      'BP_ResourceNode145_1749',
    ],
    notes: [
      'Two pure Iron nodes sit 40 m apart at the west end; the third pure Iron and the pure Copper are ~150 m east.',
      'Limestone here is all normal purity; pure Limestone is ~1 km north (North-West Iron Field).',
      'Build the HUB on flat ground between the iron nodes so early belts stay short.',
    ],
  },
  {
    id: 'coal-plateau',
    name: 'Coal Plateau',
    role: 'Tier 3 coal power: three pure Coal nodes ~150 m above the HUB',
    centre: { x: -1115, y: -490 },
    nodeIds: ['BP_ResourceNode_700', 'BP_ResourceNode129', 'BP_ResourceNode130'],
    notes: [
      'At ~162 m elevation. Coal Generators need water, so either pump water uphill (each Pipeline Pump Mk.1 adds 20 m of head lift) or belt the coal down to generators near water.',
      'An impure SAM node sits ~350 m east of the plateau (−809, −324).',
      'Three pure nodes on Miner Mk.1 = 360 coal/min = 24 Coal Generators (1.8 GW) once you have the water.',
    ],
  },
  {
    id: 'ne-steelworks',
    name: 'North-East Steelworks',
    role: 'Tier 3–4 steel: pure Iron + four Coal + Copper + Limestone at sea level',
    centre: { x: -1030, y: -1400 },
    nodeIds: [
      'BP_ResourceNode123_5084',
      'BP_ResourceNode122',
      'BP_ResourceNode7_380',
      'BP_ResourceNode5_381',
      'BP_ResourceNode6_379',
      'BP_ResourceNode125_5930',
      'BP_ResourceNode124_5785',
    ],
    notes: [
      'Iron and coal on one site makes Steel Ingots trivial: one Foundry takes 45 iron + 45 coal per minute.',
      'Nodes are at about −15 m, close to sea level. Check water access for a second coal plant here.',
    ],
  },
  {
    id: 'caterium-ridge',
    name: 'Caterium Ridge',
    role: 'Pure Caterium ~490 m north of the HUB',
    centre: { x: -1785, y: -798 },
    nodeIds: ['BP_ResourceNode121_4877'],
    notes: [
      'One pure node on a Miner Mk.1 gives 120 ore/min = 40 Caterium Ingots/min = 200 Quickwire/min.',
    ],
  },
  {
    id: 'quartz-cave',
    name: 'Quartz Cave',
    role: 'Raw Quartz (2 pure + 1 normal) and normal SAM, underground ~1.1 km north',
    centre: { x: -1790, y: -1430 },
    nodeIds: [
      'BP_ResourceNode588',
      'BP_ResourceNode588_UAID_40B076DF2F79CEDF01_1910960903',
      'BP_ResourceNode552',
      'BP_ResourceNode135',
    ],
    notes: [
      'The cave has several entrances. Expect Stingers and Flying Crabs; bring a weapon and healing.',
      'Pure Limestone and normal Copper sit just outside the cave to the south-east.',
    ],
  },
  {
    id: 'north-terrace',
    name: 'North Iron Terrace',
    role: 'Three normal Iron nodes clustered within 40 m',
    centre: { x: -1890, y: -1170 },
    nodeIds: ['BP_ResourceNode128_5242', 'BP_ResourceNode167', 'BP_ResourceNode168'],
    notes: ['Good overflow iron for a Tier 2–4 mall before Miner Mk.2.'],
  },
  {
    id: 'nw-iron-field',
    name: 'North-West Iron Field',
    role: 'Scale-up: 4 pure Iron + 2 pure Limestone ~1.1 km north-west',
    centre: { x: -2380, y: -1210 },
    nodeIds: [
      'BP_ResourceNode160',
      'BP_ResourceNode161',
      'BP_ResourceNode174',
      'BP_ResourceNode175',
      'BP_ResourceNode163',
      'BP_ResourceNode164',
    ],
    notes: [
      'With Miner Mk.2 this field gives 960 iron ore/min (4 × 240). That is the backbone of Phase 2 and Phase 3.',
    ],
  },
  {
    id: 'west-coast',
    name: 'West Coast',
    role: '6 normal Iron, 2 normal Copper, 3 normal Limestone by the sea',
    centre: { x: -2650, y: -420 },
    nodeIds: [
      'BP_ResourceNode105_2463',
      'BP_ResourceNode106',
      'BP_ResourceNode107',
      'BP_ResourceNode108',
      'BP_ResourceNode109',
      'BP_ResourceNode153',
      'BP_ResourceNode111_3367',
      'BP_ResourceNode112',
      'BP_ResourceNode102_2068',
      'BP_ResourceNode103',
      'BP_ResourceNode104',
    ],
    notes: [
      'Your second copper source: the HUB has only one pure Copper node.',
      'Sea-level and flat: an easy site for water extractors.',
    ],
  },
  {
    id: 'coastal-oil',
    name: 'Coastal Oil Field',
    role: 'Tier 5 oil: 2 pure + 2 normal Crude Oil nodes ~1.3 km south-west',
    centre: { x: -2400, y: 750 },
    nodeIds: [
      'BP_ResourceNode89',
      'BP_ResourceNode87',
      'BP_ResourceNode88',
      'BP_ResourceNode86',
      'BP_FrackingCore6_UAID_40B076DF2F79D3DF01_1961476789',
    ],
    notes: [
      'Mk.1 Oil Extractors: 2 × 240 + 2 × 120 = 720 m³/min crude (one pipe Mk.2 carries 600).',
      'A crude-oil resource well (6 satellites) sits ~200 m west for Tier 8 expansion.',
      'Flat coast: build refineries on foundations over the water if you need space.',
    ],
  },
  {
    id: 'bauxite-uplands',
    name: 'Bauxite Uplands',
    role: 'Tier 7 aluminium: 2 pure + 1 normal Bauxite with coal and geysers nearby',
    centre: { x: -1800, y: 200 },
    nodeIds: [
      'BP_ResourceNode595',
      'BP_ResourceNode596',
      'BP_ResourceNode597',
      'BP_ResourceNode606',
      'BP_ResourceNode607',
    ],
    notes: [
      'Elevated (~180–240 m). Alumina needs a lot of water, so plan pumps or put the refineries lower down.',
      'Normal Coal and impure SAM are on the plateau; pure Coal is at (−1078, 319) and (−1484, 563).',
    ],
  },
  {
    id: 'south-east-quartz',
    name: 'South-East Quartz & Uranium',
    role: 'Tier 7–8: 2 pure Quartz, normal Uranium, pure Limestone and a 7-pure water well',
    centre: { x: -950, y: 560 },
    nodeIds: [
      'BP_ResourceNode520',
      'BP_ResourceNode522',
      'BP_ResourceNode598_0',
      'BP_ResourceNode521',
      'BP_FrackingCore18',
    ],
    notes: [
      'Silica for Aluminum Ingots is close to the bauxite.',
      'The Uranium node (z ≈ 191 m) is radioactive: wear the Hazmat Suit with Iodine-Infused Filters.',
    ],
  },
  {
    id: 'nitrogen-well',
    name: 'Southern Nitrogen Well',
    role: 'Tier 8: Nitrogen Gas well with 7 pure satellites ~1.6 km south',
    centre: { x: -1439, y: 1222 },
    nodeIds: [
      'BP_FrackingCore5',
      'BP_FrackingSatellite28',
      'BP_FrackingSatellite29',
      'BP_FrackingSatellite30',
      'BP_FrackingSatellite31',
      'BP_FrackingSatellite32',
      'BP_FrackingSatellite33',
      'BP_FrackingSatellite34',
    ],
    notes: [
      '7 pure satellites × 120 m³/min = 840 m³/min of Nitrogen at 100% (one Pressurizer, 150 MW).',
      'An alternative Nitrogen well with 6 pure + 1 normal sits ~1.8 km north at (−2514, −1871).',
    ],
  },
  {
    id: 'sulfur',
    name: 'Sulfur Sources',
    role: 'Nearest Sulfur: normal ~1.4 km SE (−1014, 916) and ~1.5 km N (−2130, −1700)',
    centre: { x: -1014, y: 916 },
    nodeIds: [
      'BP_ResourceNode71_736',
      'BP_ResourceNode71_UAID_40B076DF2F79B9DB01_1490254983',
      'BP_ResourceNode170_363',
      'BP_ResourceNode510',
    ],
    notes: [
      'Sulfur is scarce near the Rocky Desert. Two impure nodes also sit ~1.3 km east at (−411, −726) and (−399, −936).',
      'You only need small amounts early (Black Powder for Nobelisks); plan bigger Sulfur use for Tier 7–8.',
    ],
  },
  {
    id: 'geysers',
    name: 'Geysers',
    role: 'Pure + normal geyser ~350 m north-east of the HUB',
    centre: { x: -1405, y: -597 },
    nodeIds: ['BP_ResourceNodeGeyser15', 'BP_ResourceNodeGeyser18'],
    notes: [
      'Geothermal Generators (MAM Caterium research) average 400 MW on pure and 200 MW on normal geysers, with no fuel.',
    ],
  },
];

export const SITE_BY_ID: ReadonlyMap<string, Site> = new Map(SITES.map((s) => [s.id, s]));
