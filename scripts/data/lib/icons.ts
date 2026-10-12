/**
 * Pure helpers for the icon pipeline: choosing a source per item or building,
 * and reading MediaWiki `prop=imageinfo|categories` responses.
 */

/** An item or building that needs an icon. */
export interface IconEntity {
  id: string;
  name: string;
}

export type IconSource =
  | { kind: 'wiki'; title: string }
  /** A file under `www/assets/images/items/` in greeny/SatisfactoryTools. */
  | { kind: 'satisfactory-tools'; path: string };

/** Picks the override for `entity.id` if there is one, else `File:<name>.png` on the wiki. */
export function iconSourceFor(
  entity: IconEntity,
  overrides: Readonly<Record<string, IconSource>>,
): IconSource {
  return overrides[entity.id] ?? { kind: 'wiki', title: `File:${entity.name}.png` };
}

/**
 * True when a file sits in one of the wiki's icon categories ("Item icons",
 * "Building icons" and so on). "FP icons" holds the "Unknown item" placeholder
 * the wiki redirects missing icons to, so it does not count.
 */
export function isIconCategory(categories: readonly string[]): boolean {
  return categories.some((c) => / icons$/.test(c) && c !== 'Category:FP icons');
}

export interface WikiQueryResponse {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: {
      title: string;
      missing?: boolean;
      imageinfo?: { url: string; width: number }[];
      categories?: { title: string }[];
    }[];
  };
}

export interface WikiImage {
  /** Final file title after normalisation and redirects. */
  title: string;
  url: string;
  width: number;
  categories: string[];
}

/** Maps each requested title to its final file page, following normalisation and redirects. */
export function resolveWikiPages(
  requested: readonly string[],
  response: WikiQueryResponse,
): Map<string, WikiImage> {
  const normalized = new Map(response.query?.normalized?.map((n) => [n.from, n.to]));
  const redirects = new Map(response.query?.redirects?.map((r) => [r.from, r.to]));
  const pages = new Map(response.query?.pages?.map((p) => [p.title, p]));
  const resolved = new Map<string, WikiImage>();

  for (const title of requested) {
    const normal = normalized.get(title) ?? title;
    const page = pages.get(redirects.get(normal) ?? normal);
    const info = page?.imageinfo?.[0];
    if (!page || page.missing || !info) continue;
    resolved.set(title, {
      title: page.title,
      url: info.url,
      width: info.width,
      categories: (page.categories ?? []).map((c) => c.title),
    });
  }
  return resolved;
}

/** Splits `items` into batches of at most `size`. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}
