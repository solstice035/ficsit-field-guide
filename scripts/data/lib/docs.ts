/**
 * Parsing helpers for the game's `CommunityResources/Docs/<locale>.json`.
 *
 * The file is an array of `{ NativeClass, Classes[] }`. Property values are
 * Unreal-serialised strings, e.g.
 *   mIngredients: `((ItemClass="/Script/Engine.BlueprintGeneratedClass'/Game/…/Desc_IronPlate.Desc_IronPlate_C'",Amount=3))`
 *   mProducedIn:  `("/Game/…/Build_ConstructorMk1.Build_ConstructorMk1_C")`
 */
import { readFileSync } from 'node:fs';

export type DocsClass = Record<string, unknown> & { ClassName: string };

export interface DocsNativeGroup {
  NativeClass: string;
  Classes: DocsClass[];
}

/** Reads a Docs file, handling the UTF-16LE (with BOM) encoding the game ships. */
export function readDocsFile(path: string): DocsNativeGroup[] {
  const buffer = readFileSync(path);
  const isUtf16Le = buffer[0] === 0xff && buffer[1] === 0xfe;
  const text = isUtf16Le ? buffer.toString('utf16le') : buffer.toString('utf8');
  return JSON.parse(text.replace(/^\uFEFF/, '')) as DocsNativeGroup[];
}

/** Short native class name, e.g. `FGRecipe` from `/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'`. */
export function nativeName(nativeClass: string): string {
  const match = /\.([A-Za-z0-9_]+)'?$/.exec(nativeClass);
  return match?.[1] ?? nativeClass;
}

/** Groups classes by short native class name. */
export function indexByNative(docs: DocsNativeGroup[]): Map<string, DocsClass[]> {
  const index = new Map<string, DocsClass[]>();
  for (const group of docs) {
    const name = nativeName(group.NativeClass);
    index.set(name, [...(index.get(name) ?? []), ...group.Classes]);
  }
  return index;
}

/** Reads a string property, tolerating absence. */
export function str(cls: DocsClass, key: string): string {
  const value = cls[key];
  return typeof value === 'string' ? value : '';
}

/** Parses a numeric property (`"4.000000"` → 4). Missing or invalid → fallback. */
export function num(cls: DocsClass, key: string, fallback = 0): number {
  const parsed = Number.parseFloat(str(cls, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Parses `"True"` / `"False"`. */
export function bool(cls: DocsClass, key: string): boolean {
  return str(cls, key).toLowerCase() === 'true';
}

export interface RawItemAmount {
  item: string;
  amount: number;
}

const ITEM_AMOUNT_RE = /\.([A-Za-z0-9_-]+_C)'?"?\s*,\s*Amount=(-?\d+(?:\.\d+)?)/g;

/** Parses `((ItemClass="…Desc_X.Desc_X_C'",Amount=3),(…))` into item amounts (raw units). */
export function parseItemAmounts(value: string): RawItemAmount[] {
  return [...value.matchAll(ITEM_AMOUNT_RE)].map((m) => ({
    item: m[1] ?? '',
    amount: Number.parseFloat(m[2] ?? '0'),
  }));
}

const CLASS_REF_RE = /\.([A-Za-z0-9_-]+_C)(?=['"])/g;

/** Extracts class names from an Unreal object path list: `("/Game/…/Build_X.Build_X_C",…)`. */
export function parseClassList(value: string): string[] {
  return [...new Set([...value.matchAll(CLASS_REF_RE)].map((m) => m[1] ?? ''))].filter(Boolean);
}

/** Maps `RF_SOLID` / `RF_LIQUID` / `RF_GAS` to a form; anything else is null. */
export function parseForm(value: string): 'solid' | 'liquid' | 'gas' | null {
  switch (value) {
    case 'RF_SOLID':
      return 'solid';
    case 'RF_LIQUID':
      return 'liquid';
    case 'RF_GAS':
      return 'gas';
    default:
      return null;
  }
}

/** Removes the `Alternate: ` prefix that the game uses on alternate recipe names. */
export function cleanRecipeName(name: string): string {
  return name.replace(/^Alternate:\s*/, '').trim();
}

/** Rounds to a fixed number of decimals, avoiding `-0`. */
export function round(value: number, decimals = 4): number {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}
