/**
 * Writes the published views of the game data:
 *
 *   dist-data/game.sqlite  tables from the LinkML-generated DDL
 *   dist-data/game.ttl     RDF (Turtle) via the LinkML-generated JSON-LD context
 *   dist-data/NOTICE.md    sources, licences and the sourcing caveat
 *
 * Usage: npm run data:graph
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultGraph } from 'oxigraph';
import { ROOT, buildSqlite, buildStore, loadGameData, loadMeta } from './graph.ts';

const OUT_DIR = join(ROOT, 'dist-data');
mkdirSync(OUT_DIR, { recursive: true });

const data = loadGameData();
const meta = loadMeta();

const sqlitePath = join(OUT_DIR, 'game.sqlite');
rmSync(sqlitePath, { force: true });
buildSqlite(data, sqlitePath).close();

const store = await buildStore(data);
const turtle = store.dump({
  format: 'text/turtle',
  from_graph_name: defaultGraph(),
});
writeFileSync(join(OUT_DIR, 'game.ttl'), turtle);

const notice = `# FICSIT Field Guide game-data bundle

Generated ${meta.generatedAt} from ${meta.gameVersion}.

> Community-sourced from the Satisfactory Wiki and open-source projects; may lag
> game patches; verify in game. Not affiliated with or endorsed by Coffee Stain Studios.

## Sources

${meta.sources.map((s) => `- ${s.name}: <${s.url}> (${s.licence})`).join('\n')}

Game data © Coffee Stain Studios. Facts derived from the Satisfactory Wiki are
CC BY-NC-SA: any reuse of those parts must be non-commercial, share-alike and
credit the wiki. The schema and tooling are MIT.
`;
writeFileSync(join(OUT_DIR, 'NOTICE.md'), notice);

console.log(`Wrote game.sqlite, game.ttl (${store.size} triples) and NOTICE.md to ${OUT_DIR}`);
