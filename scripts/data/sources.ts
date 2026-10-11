/**
 * Pinned upstream data sources. Bump the SHAs deliberately, then run
 * `npm run data:fetch && npm run data:build && npm run data:verify`.
 */
import { fileURLToPath } from 'node:url';

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
