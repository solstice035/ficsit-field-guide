/**
 * Pinned upstream data sources. Bump the SHAs deliberately, then run
 * `npm run data:fetch && npm run data:build && npm run data:verify`.
 */
import { fileURLToPath } from 'node:url';
import type { IconSource } from './lib/icons.ts';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const RAW_DIR = fileURLToPath(new URL('../../data/raw/', import.meta.url));
export const GENERATED_DIR = fileURLToPath(new URL('../../src/data/generated/', import.meta.url));

export const GAME_VERSION =
  'Update 1.1 Docs (valid for 1.2: no production recipe or milestone changes)';

const LOGISTICS_SHA = 'bbd951f26507432d3e50923fb02d0348829b0752';
const TOOLS_SHA = 'a1eb2fef1d5293baa5cd33ae88d08032600c6996';

const logistics = (path: string): string =>
  `https://raw.githubusercontent.com/rockfactory/satisfactory-logistics/${LOGISTICS_SHA}/${path}`;

export interface Source {
  /** Local file name inside `data/raw/`. */
  file: string;
  url: string;
  name: string;
  licence: string;
}

/** Raw icon downloads (git-ignored) and the committed 64 px WebP set served by the app. */
export const RAW_ICON_DIR = fileURLToPath(new URL('../../data/raw/icons/', import.meta.url));
export const ICON_DIR = fileURLToPath(new URL('../../public/icons/', import.meta.url));

export const WIKI_API = 'https://satisfactory.wiki.gg/api.php';
export const USER_AGENT =
  'FICSITFieldGuide/0.1 (+https://github.com/solstice035/ficsit-field-guide; icon pipeline)';
export const TOOLS_ICON_BASE = `https://raw.githubusercontent.com/greeny/SatisfactoryTools/${TOOLS_SHA}/www/assets/images/items/`;

/**
 * Icons the wiki's exact-name rule misses. The wiki redirects these three to
 * its "Unknown" placeholder or a screenshot (checked 2026-10-11), so they come
 * from SatisfactoryTools at the pinned commit instead. The ™ names (Factory
 * Cart™) need no entry: the wiki redirects them to the right icon.
 */
export const ICON_OVERRIDES = {
  Desc_SAMFluctuator_C: { kind: 'satisfactory-tools', path: 'desc-samfluctuator-c_256.png' },
  Build_Converter_C: { kind: 'satisfactory-tools', path: 'desc-converter-c_256.png' },
  Build_QuantumEncoder_C: { kind: 'satisfactory-tools', path: 'desc-quantumencoder-c_256.png' },
} as const satisfies Record<string, IconSource>;

export const SOURCES = {
  docs: {
    file: 'docs-en.json',
    url: logistics('data/docs-en.json'),
    name: 'Satisfactory Docs (en-US), via rockfactory/satisfactory-logistics',
    licence: 'Game data © Coffee Stain Studios; repository MIT',
  },
  nodes: {
    file: 'WorldResourceNodes.json',
    url: logistics('src/recipes/WorldResourceNodes.json'),
    name: 'World resource nodes (rockfactory/satisfactory-logistics ← Hirashi3630/satisfactory_node_heatmap)',
    licence: 'MIT',
  },
  collectibles: {
    file: 'WorldCollectibles.json',
    url: logistics('src/recipes/WorldCollectibles.json'),
    name: 'World collectibles (rockfactory/satisfactory-logistics)',
    licence: 'MIT',
  },
  footprints: {
    file: 'FactoryBuildings.json',
    url: logistics('src/recipes/FactoryBuildings.json'),
    name: 'Building clearance boxes (rockfactory/satisfactory-logistics)',
    licence: 'MIT',
  },
  crossCheck: {
    file: 'satisfactory-tools-data1.0.json',
    url: `https://raw.githubusercontent.com/greeny/SatisfactoryTools/${TOOLS_SHA}/data/data1.0.json`,
    name: 'greeny/SatisfactoryTools data1.0.json (cross-check only)',
    licence: 'MIT',
  },
} as const satisfies Record<string, Source>;
