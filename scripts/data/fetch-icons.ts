/**
 * Downloads one icon per item and building into `data/raw/icons/` and writes
 * `icons.lock.json` recording where each came from. Files already on disk from
 * the same URL are skipped, so a rerun only fetches what is new or moved.
 *
 * Source: the Satisfactory Wiki through the MediaWiki API, with a named user
 * agent and one request a second. `ICON_OVERRIDES` covers the few the wiki lacks.
 *
 * Kept apart from `data:fetch` so CI's data job never calls the wiki.
 *
 * Usage: npm run data:fetch-icons
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  chunk,
  iconSourceFor,
  isIconCategory,
  resolveWikiPages,
  type IconEntity,
  type WikiQueryResponse,
} from './lib/icons.ts';
import {
  GENERATED_DIR,
  ICON_OVERRIDES,
  RAW_ICON_DIR,
  TOOLS_ICON_BASE,
  USER_AGENT,
  WIKI_API,
} from './sources.ts';

export interface IconLockEntry {
  name: string;
  /** "Satisfactory Wiki" or "SatisfactoryTools". */
  source: string;
  /** Wiki file page, or the repository path. */
  page: string;
  url: string;
  sha256: string;
}

const PACE_MS = 1000;
const MIN_WIDTH = 64;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function get(url: string): Promise<Response> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText}): ${url}`);
  }
  return response;
}

function readEntities(): IconEntity[] {
  const read = (file: string): IconEntity[] =>
    (JSON.parse(readFileSync(join(GENERATED_DIR, file), 'utf8')) as IconEntity[]).map(
      ({ id, name }) => ({ id, name }),
    );
  return [...read('items.json'), ...read('buildings.json')];
}

/** Resolves each entity to a download URL, failing loudly on anything that isn't a real icon. */
async function resolveUrls(
  entities: readonly IconEntity[],
): Promise<Map<string, Omit<IconLockEntry, 'sha256'>>> {
  const resolved = new Map<string, Omit<IconLockEntry, 'sha256'>>();
  const wiki: { entity: IconEntity; title: string }[] = [];

  for (const entity of entities) {
    const source = iconSourceFor(entity, ICON_OVERRIDES);
    if (source.kind === 'wiki') {
      wiki.push({ entity, title: source.title });
    } else {
      resolved.set(entity.id, {
        name: entity.name,
        source: 'SatisfactoryTools',
        page: `www/assets/images/items/${source.path}`,
        url: `${TOOLS_ICON_BASE}${source.path}`,
      });
    }
  }

  const problems: string[] = [];
  for (const batch of chunk(wiki, 50)) {
    const titles = batch.map((b) => b.title);
    const params = new URLSearchParams({
      action: 'query',
      prop: 'imageinfo|categories',
      iiprop: 'url|size',
      cllimit: 'max',
      redirects: '1',
      format: 'json',
      formatversion: '2',
      titles: titles.join('|'),
    });
    const response = (await (await get(`${WIKI_API}?${params}`)).json()) as WikiQueryResponse;
    const pages = resolveWikiPages(titles, response);

    for (const { entity, title } of batch) {
      const page = pages.get(title);
      if (!page) problems.push(`${entity.id} (${entity.name}): no file at ${title}`);
      else if (!isIconCategory(page.categories))
        problems.push(`${entity.id} (${entity.name}): ${page.title} is not an icon`);
      else if (page.width < MIN_WIDTH)
        problems.push(`${entity.id} (${entity.name}): ${page.title} is only ${page.width} px`);
      else
        resolved.set(entity.id, {
          name: entity.name,
          source: 'Satisfactory Wiki',
          page: page.title,
          url: page.url,
        });
    }
    await sleep(PACE_MS);
  }

  if (problems.length) {
    throw new Error(
      `No usable icon for ${problems.length} entities; add them to ICON_OVERRIDES:\n  ${problems.join('\n  ')}`,
    );
  }
  return resolved;
}

async function main(): Promise<void> {
  mkdirSync(RAW_ICON_DIR, { recursive: true });
  const entities = readEntities();
  const urls = await resolveUrls(entities);
  const lockFile = join(RAW_ICON_DIR, 'icons.lock.json');
  const previous: Record<string, IconLockEntry | undefined> = existsSync(lockFile)
    ? (JSON.parse(readFileSync(lockFile, 'utf8')) as Record<string, IconLockEntry>)
    : {};
  const lock: Record<string, IconLockEntry> = {};
  let downloaded = 0;

  for (const entity of entities) {
    const entry = urls.get(entity.id);
    if (!entry) continue;
    const file = join(RAW_ICON_DIR, `${entity.id}.png`);
    // Refetch when the source moved, e.g. after a new override.
    if (!existsSync(file) || previous[entity.id]?.url !== entry.url) {
      process.stdout.write(`↓ ${entity.id.padEnd(40)} ${entry.page}\n`);
      writeFileSync(file, Buffer.from(await (await get(entry.url)).arrayBuffer()));
      downloaded += 1;
      await sleep(PACE_MS);
    }
    lock[entity.id] = {
      ...entry,
      sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    };
  }

  writeFileSync(lockFile, `${JSON.stringify(lock, null, 2)}\n`);
  process.stdout.write(
    `✓ ${Object.keys(lock).length} icons in ${RAW_ICON_DIR} (${downloaded} downloaded)\n`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
