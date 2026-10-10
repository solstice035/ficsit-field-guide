/**
 * Cross-checks generated recipes against greeny/SatisfactoryTools (1.0 data)
 * and sanity-checks world data counts against known 1.0+ totals.
 *
 * Usage: npm run data:verify   (exit code 1 on unexplained differences)
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Collectible, Item, Recipe, Schematic } from '../../src/data/types.ts';
import { GENERATED_DIR, RAW_DIR, SOURCES } from './sources.ts';

interface ToolsRecipe {
  className: string;
  time: number;
  inMachine: boolean;
  ingredients: { item: string; amount: number }[];
  products: { item: string; amount: number }[];
  producedIn: string[];
}

const load = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;

const toolsPath = join(RAW_DIR, SOURCES.crossCheck.file);
if (!existsSync(toolsPath)) throw new Error('Run `npm run data:fetch` first.');

const tools = load<{ recipes: Record<string, ToolsRecipe> }>(toolsPath);
const recipes = load<Recipe[]>(join(GENERATED_DIR, 'recipes.json'));
const items = load<Item[]>(join(GENERATED_DIR, 'items.json'));
const schematics = load<Schematic[]>(join(GENERATED_DIR, 'schematics.json'));
const collectibles = load<Collectible[]>(join(GENERATED_DIR, 'collectibles.json'));

/**
 * Differences that are expected because our source is newer (1.1 Docs) than
 * SatisfactoryTools' 1.0 dataset. Add an entry with a reason, never silently.
 */
const KNOWN_DIFFERENCES: Record<string, string> = {};

const key = (list: { item: string; amount: number }[]): string =>
  list
    .map((x) => `${x.item}×${x.amount}`)
    .sort()
    .join(' + ');

const problems: string[] = [];
const notes: string[] = [];
let compared = 0;

const ours = new Map(recipes.map((r) => [r.id, r]));
for (const theirs of Object.values(tools.recipes)) {
  if (!theirs.inMachine) continue;
  const mine = ours.get(theirs.className);
  if (!mine) {
    notes.push(`only in SatisfactoryTools: ${theirs.className}`);
    continue;
  }
  compared += 1;
  const diffs: string[] = [];
  if (mine.durationS !== theirs.time) diffs.push(`time ${mine.durationS} vs ${theirs.time}`);
  if (key(mine.ingredients) !== key(theirs.ingredients)) {
    diffs.push(`ingredients [${key(mine.ingredients)}] vs [${key(theirs.ingredients)}]`);
  }
  if (key(mine.products) !== key(theirs.products)) {
    diffs.push(`products [${key(mine.products)}] vs [${key(theirs.products)}]`);
  }
  const producers = (list: string[]): string =>
    list
      .map((p) => p.replace(/^(Desc|Build)_/, ''))
      .sort()
      .join(',');
  if (producers(mine.producedIn) !== producers(theirs.producedIn)) {
    diffs.push(`producedIn ${producers(mine.producedIn)} vs ${producers(theirs.producedIn)}`);
  }
  if (diffs.length) {
    const reason = KNOWN_DIFFERENCES[mine.id];
    (reason ? notes : problems).push(
      `${mine.id}: ${diffs.join('; ')}${reason ? ` (known: ${reason})` : ''}`,
    );
  }
}

// World totals as of 1.0 (Satisfactory Wiki).
const EXPECTED_COLLECTIBLES: Record<string, number> = {
  mercerSphere: 298,
  somersloop: 106,
  hardDrive: 118,
  slugBlue: 596,
  slugYellow: 389,
  slugPurple: 257,
};
for (const [type, expected] of Object.entries(EXPECTED_COLLECTIBLES)) {
  const actual = collectibles.filter((c) => c.type === type).length;
  if (actual !== expected) problems.push(`collectibles: ${type} ${actual} ≠ expected ${expected}`);
}

// Every referenced item must exist.
const itemIds = new Set(items.map((i) => i.id));
const missing = new Set<string>();
for (const r of recipes) {
  if (r.buildGun && !r.producedIn.length) continue; // building descriptors aren't items
  for (const x of [...r.ingredients, ...r.products]) if (!itemIds.has(x.item)) missing.add(x.item);
}
for (const s of schematics) for (const x of s.cost) if (!itemIds.has(x.item)) missing.add(x.item);
for (const c of collectibles)
  for (const x of c.unlockCost ?? []) if (!itemIds.has(x.item)) missing.add(x.item);
for (const id of missing) problems.push(`referenced item missing from items.json: ${id}`);

process.stdout.write(`Compared ${compared} machine recipes against SatisfactoryTools 1.0.\n`);
for (const n of notes) process.stdout.write(`  note: ${n}\n`);
if (problems.length) {
  for (const p of problems) process.stdout.write(`  ✗ ${p}\n`);
  process.stdout.write(`✗ ${problems.length} unexplained difference(s).\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('✓ No unexplained differences.\n');
}
