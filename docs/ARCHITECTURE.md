# Architecture

```
src/
├── data/            generated JSON + typed indexes (gameData.ts), availability tiers, default recipes
├── content/         hand-authored guide: tiers/, layouts.ts, sites.ts, spaceElevator.ts
├── lib/calc/        pure maths: solver, extraction, power, conveyance, floor plan, BOM, generators, availability
├── lib/geo/         distance, bearing, compass, nearest
├── lib/plan/        factoryPlan (solver → full plan), layoutConfig (content + user → config), checklist, format
├── state/           Zustand stores (progress, settings, layouts, explore) + backup/restore
├── components/      accessible primitives (Tabs, Disclosure, Segmented, NumberField, Checkbox, Badge…)
├── features/        route pages: dashboard, guide, layouts, explore, calculator, settings
└── app/             router + shell
```

Dependency direction: `features → state, lib/plan → lib/calc, lib/geo → data`. `lib/calc` imports no React and no store. `content` imports only types.

## From layout to screen

1. `content/layouts.ts` declares targets (or a generator bank), the build site, supply sites and default imports.
2. `lib/plan/layoutConfig.resolveLayoutConfig` merges tier defaults (belt, pipe and miner Mk from the unlock graph), the best node purity across the layout's sites (after the user's per-node overrides) and the user's saved tweaks into a `PlanConfig`.
3. `lib/plan/factoryPlan.buildFactoryPlan` runs the solver, then splits machines, plans extraction, allocates flow edges, computes power, lays out the floor and sums the BOM.
4. `features/layouts` renders that `FactoryPlan` as stats, a flow diagram, a floor plan, tables and a build list.

## Calculation details

### Solver (`lib/calc/solver.ts`)

- Choose one recipe per non-raw item. Defaults come from `data/recipeDefaults.ts`: standard first, never Unpackage or Converter by default, with explicit picks for ambiguous items (Fuel, Plastic, Rubber, Biomass, Ficsite…). User overrides win, and `''` means "import".
- Build the square system `M·x = t`, where `M[i][j]` is the net per-minute output of item _i_ by one machine of recipe _j_ (with the Somersloop multiplier), and solve it with Gauss–Jordan elimination using partial pivoting.
- If any `x < 0`, an item is over-supplied by byproducts. Drop **one** item per pass and re-solve, preferring a root cause (an item another running recipe makes as a byproduct). This stops upstream recipes from being wrongly dropped (regression test: dark matter).
- Raw items, unselected items and over-supplied items become **inputs** (net negative) or **surplus** (net positive).

### Machines and power

- `n` machines at 100% become `ceil(n / ceiling)` machines. With **even**, all run at the same clock (least power, since the exponent is above 1). With **fill**, all run at the ceiling and one machine runs the remainder.
- Power = base × clock^1.321929 × (1 + sloops/slots)². Variable-power recipes use the average of their range.
- Power Shards per machine = ceil((clock − 1) / 0.5).

### Extraction

- Rate per node = base(Mk) × {0.5, 1, 2}[purity] × clock, capped by the fastest unlocked belt or pipe. Water Extractors ignore purity. Resource Wells add a 150 MW Pressurizer.
- With a node limit, the clock rises to cover demand up to 250%, and anything still missing is reported as a shortfall warning.

### Flow edges

Each item's supply (machine groups, extraction, imports) is allocated to its demand (groups, outputs, surplus) in proportion: `edge = supply × demand / total demand`. Each edge gets the smallest belt or pipe Mk that fits, or parallel lines.

### Floor plan

Each machine group is a manifold row. Length = n × (ceil(w) + 1 m) − 1 m + 2 × 2 m margins. Depth = input lanes × 2 m + 1 + ceil(l) + 1 + output lanes × 2 m. Rows are shelf-packed in production order to a width of about 1.2 × √(area including gaps), which gives a near-square footprint. Sizes round up to 8 m foundations.

### Availability tiers (`lib/calc/availability.ts`)

The availability tiers come from a fixed-point pass over the unlock graph:

- A milestone counts at its tier. A HUB upgrade counts as Tier 0. A custom schematic takes its parent's tier. MAM research counts at max(1, the tier of its cost items).
- A recipe counts at max(its unlock tier, its building's tier unless hand-craftable, its ingredients' tiers).
- An item counts at the tier of its cheapest standard recipe. Raw resources take their extractor's tier.

This drives the "available from Tier N" badges and the "crash site openable at Tier N" labels. Tests also use it to forbid layouts from using recipes above their tier.

## State and persistence

Four persisted stores (`ffg.progress`, `ffg.settings`, `ffg.layouts`, `ffg.explore`) sit on `localStorage`, with an in-memory fallback. Each has a `version`, so add a `migrate` step when you change a shape. Backups are validated before anything is applied. Layout build-list ticks are stored as tasks with the key `layout:<id>:<step>`. A guide task linked to a milestone has no flag of its own: `toggleTask` flips the milestone, and progress maths (`src/lib/progress/`) reads it from there. Progress v2 (backup v2) folds old linked task ticks into their milestones and adds `skipped` for optional steps; v1 backups still restore. `startCrossWindowSync` (`src/state/sync.ts`, started in `App`) rehydrates a store when another window writes its key, so `/glance` on a second monitor and the main window stay in step.

## Accessibility

- The tier tabs and in-page tabs follow WAI-ARIA tabs (roving tabindex, arrows, Home and End).
- Steps use disclosure buttons, and purity is shown as text plus colour.
- All controls are labelled. The map has keyboard pan and zoom plus toolbar buttons.
- The SVG diagrams have text alternatives, and tables carry the same information.
- `axe-core` runs on every page in the test suite. Contrast was checked in the browser, because jsdom cannot compute it.
