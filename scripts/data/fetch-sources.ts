/**
 * Downloads pinned raw sources into `data/raw/` and writes a lock file with
 * SHA-256 hashes so a rebuild can be reproduced and audited.
 *
 * Usage: npm run data:fetch
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAW_DIR, SOURCES } from './sources.ts';

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status} ${response.statusText}): ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main(): Promise<void> {
  mkdirSync(RAW_DIR, { recursive: true });
  const lock: Record<string, { url: string; sha256: string; bytes: number }> = {};

  for (const [key, source] of Object.entries(SOURCES)) {
    process.stdout.write(`↓ ${key.padEnd(12)} ${source.url}\n`);
    const body = await download(source.url);
    writeFileSync(join(RAW_DIR, source.file), body);
    lock[source.file] = {
      url: source.url,
      sha256: createHash('sha256').update(body).digest('hex'),
      bytes: body.byteLength,
    };
  }

  writeFileSync(join(RAW_DIR, 'sources.lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
  process.stdout.write(`✓ ${Object.keys(lock).length} sources written to ${RAW_DIR}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
