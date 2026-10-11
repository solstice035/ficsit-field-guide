# Knowledge model

One schema, several views of the same game data. This is the I-97 spike for the
I-96 epic (Open Factory Plan and FICSIT knowledge model).

> Community-sourced from the Satisfactory Wiki and open-source projects; may lag
> game patches; verify in game. Not affiliated with or endorsed by Coffee Stain Studios.

## How it fits together

```
model/ficsit.linkml.yaml            ← single source of truth (LinkML)
  │  npm run model:gen  (needs uv; pinned LinkML 1.12.0)
  ├── generated/ficsit.schema.json     JSON Schema: validates src/data/generated/*.json
  ├── generated/ficsit.sql             SQL DDL: tables for game.sqlite
  ├── generated/ficsit.context.jsonld  JSON-LD context: turns the same JSON into RDF
  └── generated/ficsit.shacl.ttl       SHACL shapes: validates the RDF

src/data/generated/*.json  ──  npm run data:graph  ──►  dist-data/game.sqlite
                                                        dist-data/game.ttl
                                                        dist-data/NOTICE.md
```

- `model/generated/` is committed and **generated**: never hand-edit it. Change
  the YAML and run `npm run model:gen`. CI regenerates it and fails on drift.
- `dist-data/` is a git-ignored build output.
- The app is unchanged: it still reads `src/data/generated/*.json`.

## Identifiers

| Kind                   | IRI                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| Vocabulary (`ficsit:`) | `https://solstice035.github.io/ficsit-field-guide/vocab#`               |
| Data (`fgd:`)          | `https://solstice035.github.io/ficsit-field-guide/id/<game class name>` |

Data IRIs keep the game's class names, so `fgd:Desc_IronPlate_C` is Iron Plate.
These URLs do not resolve yet; hosting them is part of I-101.

## Example queries

`model/queries/` holds five questions, each written in SQL (`.sql`) and SPARQL
(`.rq`). `scripts/model/graph.test.ts` runs both and checks they agree.

| Query | Question                                                                             |
| ----- | ------------------------------------------------------------------------------------ |
| Q1    | Every item in the standard Heavy Modular Frame chain, and the earliest tier for each |
| Q2    | Wire alternates that use less Copper Ore than the standard recipe                    |
| Q3    | Every item that transitively depends on Raw Quartz                                   |
| Q4    | Manufacturer recipes ranked by energy per item (all draw 55 MW, so MW alone is flat) |
| Q5    | Nodes within 1 km of the default base that feed the Steel Ingot chain                |

Both views first add the same derived relation, `madeFrom` (`derive.sql` /
`derive.ru`): product made from ingredient, over standard machine recipes, with
raw resources as leaves.

## Findings from the spike

1. **One schema really does drive both views.** All 3,817 generated records
   validate against the generated JSON Schema with no changes to the data. The
   same JSON becomes 37,630 RDF triples through the generated JSON-LD context.
   SQLite (~0.1 s) and Oxigraph (~1 s) both build in-process with no server.
2. **The two views cross-check each other.** SQLite's foreign-key check and
   SHACL independently report the same four kinds of dangling reference with
   the same counts, and nothing else:

   | Gap                         | Count | Cause                                                               |
   | --------------------------- | ----- | ------------------------------------------------------------------- |
   | Recipe product → Item       | 537   | Build Gun recipes produce buildable descriptors, which aren't items |
   | Schematic → dependsOn       | 104   | Points at schematics the build trims out                            |
   | Schematic → unlocked recipe | 35    | Points at recipes the build trims out                               |
   | Resource node → Item        | 31    | Geysers use the pseudo-resource `geothermal`                        |

   These are pinned in the tests. A follow-up should model buildables and
   geothermal properly, or document them as out of scope.

3. **Model changes needed.** Two LinkML generators needed help:
   - `gen-sqlddl` stored ingredients and products in one `ItemAmount` table with
     no role column. Fixed with `Ingredient` and `Product` subclasses; the JSON is
     unchanged.
   - A slot that is inlined in one class and referenced in another confuses
     `gen-shacl`. Fixed by setting inlining per class with `slot_usage`.
   - Numbers use `double`, not `float`: `xsd:float` is 32-bit in SPARQL engines and
     loses precision on world coordinates.
4. **Oxigraph 0.5.11 arithmetic bug.** It groups chained `-` and `/` from the
   right (`8 - 4 - 2` = 6). Every `.rq` file brackets chained arithmetic, and a
   test fails when upstream fixes it so the workaround can be dropped. This
   should be reported upstream.
5. **Tooling cost.** LinkML is Python, so regeneration needs `uv`. Everything at
   build and test time is Node: `node:sqlite` (built in, experimental in Node 22),
   `jsonld`, `oxigraph` (WASM) and `rdf-validate-shacl`. All are dev dependencies;
   nothing is added to the app bundle. SHACL validation is the slow step (~14 s).

## Recommendation

Keep LinkML as the source of truth for I-99 (Open Factory Plan v0). The spike
showed it generates a JSON Schema that our real data already passes, and the
graph view adds checks (SHACL) and questions (transitive dependencies) that are
awkward over flat JSON.
