/**
 * Turns the raw icons from `data:fetch-icons` into the committed set the app
 * serves: `public/icons/<class name>.webp` at 64 px (2× the largest 32 px
 * display size), plus `src/data/generated/icons.json` recording each icon's
 * source for the credits and a future provenance pass.
 *
 * Usage: npm run data:fetch-icons && npm run data:build-icons
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { IconLockEntry } from './fetch-icons.ts';
import { GENERATED_DIR, ICON_DIR, RAW_ICON_DIR } from './sources.ts';

const SIZE = 64;

async function main(): Promise<void> {
  const lock = JSON.parse(readFileSync(join(RAW_ICON_DIR, 'icons.lock.json'), 'utf8')) as Record<
    string,
    IconLockEntry
  >;
  mkdirSync(ICON_DIR, { recursive: true });

  const ids = Object.keys(lock).sort();
  const keep = new Set(ids.map((id) => `${id}.webp`));
  for (const file of readdirSync(ICON_DIR)) {
    if (!keep.has(file)) rmSync(join(ICON_DIR, file));
  }

  let bytes = 0;
  for (const id of ids) {
    const output = await sharp(join(RAW_ICON_DIR, `${id}.png`))
      .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toBuffer();
    writeFileSync(join(ICON_DIR, `${id}.webp`), output);
    bytes += output.byteLength;
  }

  const manifest = Object.fromEntries(
    ids.map((id) => {
      const { name, source, page } = lock[id] as IconLockEntry;
      return [id, { name, source, page }];
    }),
  );
  writeFileSync(join(GENERATED_DIR, 'icons.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(
    `✓ ${ids.length} icons, ${(bytes / 1024).toFixed(0)} KiB of WebP in ${ICON_DIR}\n`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
