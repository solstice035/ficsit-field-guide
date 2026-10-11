/**
 * Domain types for generated game data. Shared by the data pipeline
 * (`scripts/data`) and the app. Units: rates per minute, fluids in m³,
 * power in MW, world coordinates in metres (x east, y south; north is −y).
 */

export type ItemForm = 'solid' | 'liquid' | 'gas';

export type Purity = 'impure' | 'normal' | 'pure';

export const PURITIES: readonly Purity[] = ['impure', 'normal', 'pure'];

export interface ItemAmount {
  item: string;
  amount: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  form: ItemForm;
  /** AWESOME Sink points per item (0 if unsinkable). */
  sinkPoints: number;
  /** Energy in MJ per item, or per m³ for fluids (0 if not a fuel). */
  energyMJ: number;
  radioactive: boolean;
  /** True for raw resources that are extracted from the world. */
  isResource: boolean;
}

export interface VariablePower {
  minMW: number;
  maxMW: number;
}

export interface Recipe {
  id: string;
  name: string;
  alternate: boolean;
  durationS: number;
  ingredients: ItemAmount[];
  products: ItemAmount[];
  /** Factory building IDs (`Build_*_C`) that can run this recipe. */
  producedIn: string[];
  /** Craftable at the Craft Bench. */
  handcraft: boolean;
  /** Built with the Build Gun (buildings, foundations, etc.). */
  buildGun: boolean;
  /** Crafted at the Equipment Workshop. */
  workshop: boolean;
  /** Recipe-specific power range for variable-power buildings. */
  variablePower?: VariablePower;
}

export type BuildingCategory = 'production' | 'extractor' | 'generator' | 'logistics';

export interface Footprint {
  /** Width (m), along the manifold. */
  w: number;
  /** Length (m), perpendicular to the manifold. */
  l: number;
  /** Height (m). */
  h: number;
}

export interface GeneratorFuel {
  item: string;
  supplemental?: string;
  byproduct?: ItemAmount;
}

export interface GeneratorSpec {
  powerMW: number;
  fuels: GeneratorFuel[];
  /** Supplemental (water) m³/min consumed per MW produced. */
  supplementalPerMW: number;
}

export interface ExtractorSpec {
  /** Items (or m³) per minute at 100% on a normal node. */
  baseRatePerMin: number;
  /** Allowed resource IDs; empty means any solid resource. */
  resources: string[];
}

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  /** Base power draw (MW) at 100%; 0 for generators and logistics. */
  powerMW: number;
  /** Overclock power exponent (1.321929 for most production buildings). */
  powerExponent: number;
  /** Somersloop (production amplifier) slots. */
  sloopSlots: number;
  footprint?: Footprint;
  buildCost: ItemAmount[];
  extractor?: ExtractorSpec;
  generator?: GeneratorSpec;
  /** Belt or lift throughput (items/min). */
  beltRate?: number;
  /** Pipeline throughput (m³/min). */
  pipeRate?: number;
  /** Variable-power buildings expose a nominal range; recipes override it. */
  variablePower?: VariablePower;
}

export type SchematicType =
  | 'tutorial'
  | 'milestone'
  | 'mam'
  | 'alternate'
  | 'hard-drive'
  | 'resource-sink'
  | 'custom'
  | 'customization';

export interface SchematicUnlocks {
  recipes: string[];
  schematics: string[];
  scannerResources: string[];
  scannerObjects: string[];
  inventorySlots: number;
  armSlots: number;
}

export interface Schematic {
  id: string;
  name: string;
  type: SchematicType;
  /** Tech tier (0 for HUB upgrades/tutorial). */
  tier: number;
  cost: ItemAmount[];
  timeS: number;
  unlocks: SchematicUnlocks;
  dependsOn: string[];
  /** MAM research tree, for `type === 'mam'`. */
  mamTree?: string;
}

export type NodeType = 'node' | 'well-core' | 'well-satellite' | 'geyser';

export interface ResourceNode {
  id: string;
  /** Item ID of the resource, or `geothermal` for geysers. */
  resource: string;
  purity: Purity;
  type: NodeType;
  x: number;
  y: number;
  z: number;
}

export type CollectibleType =
  'mercerSphere' | 'somersloop' | 'hardDrive' | 'slugBlue' | 'slugYellow' | 'slugPurple';

export interface Collectible {
  id: string;
  type: CollectibleType;
  x: number;
  y: number;
  z: number;
  /** Item cost to open a crash site (Hard Drives only). */
  unlockCost?: ItemAmount[];
}

export interface DataMeta {
  generatedAt: string;
  gameVersion: string;
  sources: { name: string; url: string; licence: string }[];
  counts: Record<string, number>;
}
