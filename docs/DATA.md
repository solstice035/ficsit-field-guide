# Data pipeline

All game data the app uses is generated, committed, and reproducible.

```
npm run data:fetch    # download pinned sources → data/raw/ (git-ignored) + sources.lock.json
npm run data:build    # parse → src/data/generated/*.json
npm run data:verify   # cross-check vs SatisfactoryTools + world totals; exit 1 on drift

npm run data:fetch-icons   # one icon per item and building → data/raw/icons/ + icons.lock.json
npm run data:build-icons   # 64 px WebP → public/icons/<class name>.webp + src/data/generated/icons.json
```

## Game icons

- **Source:** the Satisfactory Wiki (`satisfactory.wiki.gg`) through the MediaWiki API. Each item or building maps to `File:<display name>.png`, following the wiki's redirects (so `Factory Cart™` resolves to `Factory Cart.png`).
- **Guard:** the resolved file must sit in an icon category ("Item icons", "Building icons" and so on) and be at least 64 px. The wiki redirects missing icons to an "Unknown" placeholder (category "FP icons"), which the guard rejects, so a bad match fails the fetch instead of shipping a placeholder.
- **Overrides:** `ICON_OVERRIDES` in `scripts/data/sources.ts`. Three have no wiki icon (checked 2026-10-11): SAM Fluctuator, Converter and Quantum Encoder. They come from greeny/SatisfactoryTools at the pinned commit.
- **Politeness:** a named User-Agent, one request a second, and cached files are skipped unless their source URL changed. The icon scripts stay out of `data:fetch`, so CI never calls the wiki.
- **Output:** 230 icons, about 600 KiB of WebP, served from the app's own origin. Nothing hotlinks the wiki at runtime.
- **Test:** `src/content/content.test.ts` fails if any item or building lacks `public/icons/<id>.webp`.
- **Fallback:** extract the icons from a local game install with FModel if the wiki falls behind a patch.

## Sources (pinned by commit SHA in `scripts/data/sources.ts`)

| File                              | Source                                                        | Used for                               |
| --------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| `docs-en.json`                    | Game Docs (Update 1.1) via rockfactory/satisfactory-logistics | Items, recipes, buildings, schematics  |
| `WorldResourceNodes.json`         | satisfactory-logistics (from satisfactory_node_heatmap)       | Node coordinates and purity            |
| `WorldCollectibles.json`          | satisfactory-logistics                                        | Spheres, Somersloops, drives, slugs    |
| `FactoryBuildings.json`           | satisfactory-logistics                                        | Building clearance boxes (floor plans) |
| `satisfactory-tools-data1.0.json` | greeny/SatisfactoryTools                                      | Cross-check only                       |

### Use your own game install

The game ships its Docs at `<Satisfactory>/CommunityResources/Docs/en-US.json` (UTF-16). After a patch, regenerate from your install:

```
npm run data:build -- --docs "/path/to/CommunityResources/Docs/en-US.json"
npm run data:verify
npm test   # content tests catch any ID the guide references that changed
```

## What the parser does (`scripts/data/build-data.ts`)

- Reads UTF-16LE or UTF-8 Docs and indexes classes by native class (`FGRecipe`, `FGSchematic`, …).
- **Items:** name, form, sink points, energy (fluids converted to MJ/m³), resource flag.
- **Recipes:** ingredients/products (fluids ÷ 1000 → m³), duration, producers; flags for hand-craft, Build Gun and workshop; variable power range for Particle Accelerator / Converter / Quantum Encoder recipes.
- **Buildings:** power, overclock exponent, Somersloop slots, extractor rates (items/min at normal purity), generator fuels with water ratio (m³/min per MW), belt/pipe throughput, build cost (from the matching Build Gun recipe), footprint.
- **Schematics:** milestones, HUB upgrades, MAM (tree derived from the class prefix), alternates, nested unlocks, scanner unlocks, dependencies.
- **World:** nodes and collectibles converted from cm to m (x east, y south; north is −y). Deposits and well cores are kept apart from extractable nodes.

### Documented overrides

| Override                                                       | Why                                          |
| -------------------------------------------------------------- | -------------------------------------------- |
| Smelter Somersloop slots 0 → 1                                 | Docs export 0; the game (and wiki) has 1     |
| `Desc_HardDrive_C`, `Desc_ResourceSinkCoupon_C` added as items | Referenced by costs but not exported in Docs |

### Not in Docs (hand-entered, test-pinned)

- Space Elevator phase costs (`src/content/spaceElevator.ts`), checked in `content.test.ts`.
- Geothermal output scales ×0.5 / ×1 / ×2 by geyser purity around the Docs factor (200 MW).

## Verification

`npm run data:verify` compares every machine recipe (276) with SatisfactoryTools 1.0: ingredients, products, duration and producers. Any unexplained difference fails the run; known 1.1+ changes must be listed in `KNOWN_DIFFERENCES` with a reason. It also checks collectible totals (298 Mercer Spheres, 106 Somersloops, 118 crash sites, 596/389/257 slugs) and that every referenced item exists.

## Caveats

- Node data is from 1.0. Patch 1.2.1.0 restored one missing Rocky Desert Limestone node that may not be in the dataset.
- Update 1.2 Game Modes can randomise node purity and positions. Use **Settings → Node purity overrides**.
- About 30 crash sites have no item cost in the data; some of those need power to open (not exported).
