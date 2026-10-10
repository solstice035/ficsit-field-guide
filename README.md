# FICSIT Field Guide: Rocky Desert

Interactive, local-first guide to **Satisfactory** (Update 1.2) for a **Rocky Desert** start. It takes you from HUB Upgrade 1 to Project Assembly, with one tab per tier, configurable factory layouts, node-purity-aware maths and an exploration tracker for Mercer Spheres, Somersloops, SAM, Hard Drives and Power Slugs.

> Status: v1 in delivery. See [docs/PLAN.md](docs/PLAN.md).

## Quick start

```bash
nvm use            # Node 22.22+ (see .nvmrc)
npm install
npm run dev        # http://localhost:5173
```

No backend, API keys or runtime network calls. Progress is saved in your browser's `localStorage`. Use **Settings → Export** to back it up.

## Features

- **Tier guide (Tiers 0 to 9):** milestones with live costs and unlocks, ordered build steps with checklists, Space Elevator phases, and Rocky Desert-specific site advice.
- **Factory layouts:** change the target rate, recipes (including alternates), Miner Mk, node purity, belt Mk, clock strategy or somersloops. Machine counts, clocks, power, belts, a flow diagram, a to-scale floor plan, the bill of materials and a build checklist all recalculate.
- **Exploration:** vector world map plus "nearest uncollected" lists sorted by distance and bearing from your base. Hard Drive costs are mapped to the tier that makes them affordable, and collectibles can be ticked off as you find them.
- **Calculator:** a free-form production planner on the same engine.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run unit, component and a11y tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run coverage` | Run tests with coverage |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc` project build, no emit |
| `npm run format` | Prettier write |
| `npm run data:fetch` | Download raw game data sources to `data/raw/` |
| `npm run data:build` | Regenerate `src/data/generated/*.json` (`-- --docs <path>` to use your own game Docs) |
| `npm run data:verify` | Cross-check recipes against SatisfactoryTools |

## Project structure

```
docs/            plan, architecture, data pipeline, content authoring guide
scripts/data/    fetch → build → verify pipeline for game data
src/data/        generated game data + typed accessors
src/content/     hand-authored guide: tiers, steps, layouts, Rocky Desert sites
src/lib/calc/    pure calculation engine (solver, power, belts, floor plan…)
src/state/       persisted stores (progress, settings, layouts, exploration)
src/features/    guide, layouts, explore, calculator, dashboard, settings
src/components/  accessible UI primitives
```

## Optional map backdrop

The map is drawn from game coordinates and ships with no game artwork. To use a backdrop, save a square world-map render as `public/map/world.png` (git-ignored). It should span x −3,247 m to 4,253 m and y −3,750 m to 3,750 m. It will be picked up automatically.

## Documentation

- [docs/PLAN.md](docs/PLAN.md): outcomes, scope, phases, risks
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): modules and calculation maths
- [docs/DATA.md](docs/DATA.md): data sources, pipeline and regeneration
- [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md): how to add or edit tiers, steps and layouts
- [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md): licences

Satisfactory is © Coffee Stain Studios. This is an unofficial fan tool.
