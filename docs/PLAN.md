# FICSIT Field Guide: delivery plan

> Interactive, local-first website that walks a pioneer from HUB Upgrade 1 to Project Assembly (Tiers 0 to 9 and Space Elevator Phases 1 to 5) for a **Rocky Desert** start. It includes configurable factory layouts, node-purity-aware maths and an exploration tracker for Mercer Spheres, Somersloops, SAM, Hard Drives and Power Slugs.

- **Owner:** Nick
- **Status:** v1 delivered on `feature/tier-guide-v1`, awaiting review and merge to `dev` (see §15)
- **Last updated:** 2026-10-10

---

## 1. Outcomes

| #   | Outcome                                                   | Measure of done                                                                                                                                                                                                       |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | A step-by-step guide with **one tab per tier** (0 to 9)   | Every tier has its milestones (live costs and unlocks), an ordered step list with checklists, and its Space Elevator phase                                                                                            |
| O2  | **Detailed, configurable factory layouts** for each stage | 35+ layouts. Each recalculates machine counts, clocks, power, belts, floor plan and bill of materials as the rate, recipes, miner Mk, purity or belt Mk change                                                        |
| O3  | **Purity-aware** maths                                    | Every raw input maps to real Rocky Desert nodes with their purity, overridable per node (Update 1.2 Game Modes can randomise purity)                                                                                  |
| O4  | **Exploration** support                                   | A map and lists of 1,764 collectibles and 600+ resource nodes, sorted by distance from your base. Hard Drive unlock costs are mapped to the tier that makes them affordable, and items can be ticked off as collected |
| O5  | **Runs locally** with one command                         | `npm install && npm run dev` with no backend, no API keys and no network calls at runtime                                                                                                                             |
| O6  | Engineering quality                                       | Lint, type-check and tests (unit, component, a11y) all pass. Data is regenerated and cross-verified by script                                                                                                         |

## 2. Assumptions (stated, not asked)

1. **Game version:** Update 1.2 (patch 1.2.4.0, 11 Aug 2026). Recipe and milestone data come from the 1.1 Docs, because 1.2 added buildables (Fluid Truck, Pipeline T-junction, SPWN, Upgraded Power Connectors) but changed no production recipes or milestone costs. The 1.2 additions are called out in guide text.
2. **Start:** Rocky Desert. "Desert correction, rocky biome start" is read as the Rocky Desert starting area. The default base location is **(-1,640 m, -330 m)**, next to the 3 pure Iron and 1 pure Copper cluster. It can be changed in Settings.
3. **Game mode:** default settings (no cost multipliers, default node purity). Per-node purity overrides cover randomised-purity saves. Game Mode cost multipliers are not modelled yet (backlog).
4. **Single player, single save.** Progress is stored in `localStorage` and can be exported or imported as JSON.
5. **"Spheres and SAM things"** means Mercer Spheres, Somersloops and SAM ore. Hard Drives and Power Slugs are included as well because they drive the same exploration loop.
6. **No copyrighted game artwork is bundled.** The map is a vector plot of game coordinates. You can drop your own map image into `public/map/` to use as a backdrop.
7. **Tooling:** npm (ships with Node). Node ≥ 22.22 because jsdom 30 and React Router require it.

## 3. Data sources and licensing

| Data                                                                | Source                                                                                                                                      | Licence                                       | Use                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Items, recipes, buildings, schematics (milestones, MAM, alternates) | Game `Docs` JSON (1.1), via [rockfactory/satisfactory-logistics](https://github.com/rockfactory/satisfactory-logistics) `data/docs-en.json` | Game data © Coffee Stain Studios. Repo is MIT | Parsed by our own script into trimmed JSON                 |
| Cross-check dataset                                                 | [greeny/SatisfactoryTools](https://github.com/greeny/SatisfactoryTools) `data/data1.0.json`                                                 | MIT (code). Icons not used                    | `npm run data:verify` diffs every recipe                   |
| Resource node coordinates and purity                                | satisfactory-logistics `WorldResourceNodes.json`, itself from Hirashi3630/satisfactory_node_heatmap                                         | MIT                                           | Map, distance and purity defaults                          |
| Collectibles (spheres, sloops, slugs, drives)                       | satisfactory-logistics `WorldCollectibles.json`                                                                                             | MIT                                           | Map, tracker and Hard Drive costs                          |
| Building footprints (clearance boxes)                               | satisfactory-logistics `FactoryBuildings.json`                                                                                              | MIT                                           | Floor-plan sizing                                          |
| Space Elevator phase costs                                          | Satisfactory Wiki (not present in Docs)                                                                                                     | CC BY-NC-SA (facts)                           | Hand-entered in `src/content/spaceElevator.ts` with a test |

Raw sources are downloaded to `data/raw/` (git-ignored) by `npm run data:fetch`. Generated, trimmed JSON is committed under `src/data/generated/` so the site runs with no network. You can instead regenerate from your own install's `CommunityResources/Docs/en-US.json` with `npm run data:build -- --docs <path>`.

## 4. Architecture

```
React 19 SPA (Vite 8)
├── content/  (typed, hand-authored guide: tiers, steps, layouts, sites)
│     └── references IDs in ──► data/generated (machine-generated game data)
├── lib/calc  (pure TS engine: solver, extraction, power, belts, floor plan, BOM)
├── state/    (Zustand + persist: progress, settings, layout configs, collected)
└── features/ (guide, layouts, explore, calculator, dashboard, settings)
```

**Stack**

- Vite 8, React 19.3, TypeScript 6.0 (strict), React Router 7.18 (data router).
- Tailwind CSS 4.3, using CSS-variable theme tokens (FICSIT orange on graphite).
- Zustand 5 with `persist`, for state stored in `localStorage` and versioned with migrations.
- Vitest 5, React Testing Library, user-event, jsdom 30 and axe-core for a11y assertions. MSW is not needed because the app makes no HTTP calls.
- ESLint 10 (typescript-eslint, react-hooks, jsx-a11y-x, react-refresh) and Prettier. jsx-a11y-x is the maintained fork that supports ESLint 10.
- `tsx` runs the TypeScript data scripts.

**Folder structure**

```
.
├── README.md                 # quick start, features, scripts
├── CLAUDE.md                 # repo-specific instructions for Claude Code
├── docs/
│   ├── PLAN.md               # this document
│   ├── ARCHITECTURE.md       # modules, data flow, calc engine maths
│   ├── DATA.md               # data pipeline, sources, regeneration
│   ├── CONTENT_GUIDE.md      # how to author tiers, steps, layouts, sites
│   └── THIRD_PARTY_NOTICES.md
├── scripts/data/             # fetch → build → verify pipeline (tsx)
├── data/raw/                 # downloaded sources (git-ignored)
├── public/map/               # optional user-supplied backdrop (git-ignored)
└── src/
    ├── data/                 # generated JSON + typed accessors
    ├── content/              # tiers/, layouts/, sites.ts, spaceElevator.ts
    ├── lib/                  # calc/, geo/, format.ts
    ├── state/                # Zustand stores
    ├── components/           # UI primitives (Tabs, Checkbox, NumberField…)
    ├── features/             # guide/, layouts/, explore/, calculator/, …
    └── test/                 # setup, axe helper, render helpers
```

## 5. Domain model (summary)

- **Item**: `id`, `name`, `form` (solid, liquid, gas), `sinkPoints`, `energyMJ`.
- **Recipe**: `id`, `name`, `alternate`, `durationS`, `ingredients[]`, `products[]`, `producedIn`. Variable power uses a min/max range. Fluids are converted from milli-units to m³.
- **Building**: `id`, `name`, `powerMW`, `powerExponent`, `somersloopSlots`, `footprint {w,l,h}`, `buildCost[]`. Extractor rates and generator fuel rules are included where relevant.
- **Schematic**: `id`, `name`, `type` (Milestone, Tutorial, MAM, Alternate, …), `tier`, `cost[]`, `unlocks {recipes, schematics, scanner}`, `mamTree`.
- **ResourceNode** / **Collectible**: `id`, `type`/`resource`, `purity`, `x`, `y`, `z` in metres. Collectibles also carry `unlockCost[]`.
- **TierGuide** → **GuideStep** → **Task**: hand-authored, with stable IDs for progress tracking.
- **FactoryLayout**: `targets[]`, `recipeDefaults`, `siteId`, `notes`, `minTier`. The user's **LayoutConfig** overrides rate, recipes, miner Mk, purity, belt Mk, clock strategy and somersloops.
- **Site**: a named Rocky Desert cluster of node IDs with a short description and directions from the HUB.

## 6. Calculation engine spec (`src/lib/calc`)

| Concern           | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Machine rate      | `perMin = amount × 60 / durationS`. Fluids are already in m³                                                                                                                                                                                                                                                                                                                                                                                  |
| Solver            | Choose one recipe per non-raw item (default or user override) and gather the reachable item set from the targets. Solve the square system `M·x = t` (Gauss–Jordan), where `M[i][r]` is the net per-machine output of item `i` by recipe `r`. If any `x < 0` (byproduct surplus), drop that item from the system, mark it as surplus and re-solve. Remaining raw or byproduct-only nets become **inputs** (negative) or **surplus** (positive) |
| Machine counts    | `n` fractional machines become `ceil(n)` machines at an even clock of `n / ceil(n)`. The alternative "fill + remainder" option is also shown                                                                                                                                                                                                                                                                                                  |
| Power (consumers) | `P = P_base × clock^1.321929 × (1 + sloops/slots)^2`                                                                                                                                                                                                                                                                                                                                                                                          |
| Somersloops       | Output × `(1 + sloops/slots)`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Extraction        | `rate = base(Mk) × purity × clock`. Miner Mk1/2/3 base is 60/120/240. Purity multipliers are 0.5/1/2. Water Extractor 120. Oil Extractor 120 × purity. Resource Well satellite 60 × purity. Values are capped at the belt or pipe limit                                                                                                                                                                                                       |
| Belts and pipes   | Belt Mk1 to Mk6 carry 60/120/270/480/780/1200 items per minute; pipe Mk1 and Mk2 carry 300/600 m³/min. Each edge gets the smallest Mk that fits, or `ceil(rate/cap)` parallel lines at the highest unlocked Mk                                                                                                                                                                                                                                |
| Generators        | Biomass 30 MW, Coal 75 MW, Fuel 250 MW, Nuclear 2,500 MW, Geothermal by purity. Fuel burn = `MW × 60 / energyMJ`                                                                                                                                                                                                                                                                                                                              |
| Floor plan        | Each machine group is a manifold row: length `n × w + gaps`, depth `l + belt lanes`. Rows are laid out in topological order and snapped to 8 m foundations. The plan is rendered to scale as SVG                                                                                                                                                                                                                                              |
| Bill of materials | Sum of `buildCost × count` over machines, extractors and generators                                                                                                                                                                                                                                                                                                                                                                           |
| Geo               | Distance in metres, bearing (N is −Y) as an 8-point compass, and elevation delta                                                                                                                                                                                                                                                                                                                                                              |

Everything in `lib/calc` is pure and covered by unit tests (test-first).

## 7. Content plan: tier by tier (Rocky Desert)

Each tier tab has the following parts:

1. **Briefing**: what the tier unlocks and why it matters.
2. **Milestones**: live from data, each with a checkbox.
3. **Ordered steps**: tasks, linked layouts, map targets and tips.
4. **Exploration goals** for the tier.
5. **Space Elevator** phase card, where relevant.

| Tier                      | Milestones (data-driven)                                                                                                   | Steps (headline)                                                                                                                                                                | Layouts                                                                                                                                                | Exploration focus                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **0 Onboarding**          | HUB Upgrades 1–6                                                                                                           | Land at the pure iron cluster; hand-feed the Smelter and Constructor; place the first Miner Mk1 on pure iron; Biomass power; build the Space Elevator                           | Starter Iron; Starter Copper; Starter Concrete                                                                                                         | Blue Power Slugs nearby; Mercer Sphere and Somersloop within 1 km            |
| **1 Base Building**       | Base Building, Logistics, Field Research                                                                                   | Foundations and grid; Iron Works on 3 pure nodes; Copper and wire; Concrete; MAM: Caterium, Quartz, Slugs, Mycelia                                                              | Iron Works Mk1; Screw Line; Copper Wire & Cable; Concrete Plant                                                                                        | Caterium (pure, ~480 m N); Quartz cave (~1.1 km N); first SAM sample         |
| **2 Part Assembly**       | Part Assembly, Obstacle Clearing, Jump Pads, Resource Sink Bonus Program, Logistics Mk.2                                   | Assemblers; Reinforced Plates; Rotors; Modular Frames; **Phase 1 (50 Smart Plating)**; Solid Biofuel; AWESOME Sink                                                              | Reinforced Iron Plate; Rotor; Smart Plating (Phase 1); Modular Frame; Copper Sheet; Biofuel                                                            | Hard Drives openable with T2 parts; Mercer Spheres for the Dimensional Depot |
| **3 Coal & Steel**        | Coal Power, Vehicular Transport, Basic Steel Production, Enhanced Asset Security                                           | Coal Power (choice of 3× pure-coal plateau or the NE sea-level coal cluster); Steel at the NE iron+coal site; Versatile Framework; Tractor routes                               | Coal Power 8:3; Steel Ingots; Steel Beams & Pipes; Versatile Framework                                                                                 | SAM Reanimation → Dimensional Depot; Somersloop Analysis                     |
| **4 Advanced Steel**      | Advanced Steel Production, Expanded Power Infrastructure, Hypertubes, FICSIT Blueprints, Logistics Mk.3                    | Miner Mk2 retrofit; Encased Beams; Stators, Motors, Automated Wiring; **Phase 2 (1,000 Smart Plating, 1,000 Versatile Framework, 100 Automated Wiring)**                        | Encased Industrial Beam; Stator; Motor; Automated Wiring; Phase 2 Mall                                                                                 | Hard Drives with steel/motor costs; Power Augmenter path                     |
| **5 Oil**                 | Oil Processing, Fluid Packaging, Petroleum Power, Logistics Mk.4, Jetpack                                                  | Coastal oil field (2 pure, 2 normal); Plastic and Rubber; Fuel Power; Circuit Boards; Packaging; 1.2 Fluid Trucks                                                               | Plastic & Rubber; Fuel Power; Circuit Board; Packaged Fuel                                                                                             | Sulfur scouting; oil-cost Hard Drives                                        |
| **6 Industrial**          | Industrial Manufacturing, Monorail Train Technology, Railway Signalling, Pipeline Engineering Mk.2, FICSIT Blueprints Mk.2 | Manufacturers; Computers; Heavy Modular Frames; Modular Engines; Adaptive Control Units; **Phase 3**; Rail backbone                                                             | Computer; Heavy Modular Frame; Modular Engine; Adaptive Control Unit; Phase 3 Mall                                                                     | Somersloops for Production Amplifier                                         |
| **7 Aluminium & Control** | Bauxite Refinement, Logistics Mk.5, Hazmat Suit, Control System Development, Hoverpack                                     | Southern bauxite and quartz; Alumina → Scrap → Ingot (water loop); Alclad Sheets, Casings; Batteries; Radio Control Units; Supercomputers; Assembly Director Systems            | Aluminium Ingot; Alclad Sheet & Casing; Battery; Radio Control Unit; Supercomputer; Assembly Director System                                           | Uranium scouting (south-east, normal)                                        |
| **8 Nuclear & Particles** | Aeronautical Engineering, Nuclear Power, Advanced Aluminum Production, Leading-Edge Production, Particle Enrichment        | Nuclear Power; Nitrogen wells; Heat Sinks, Cooling Systems, Fused Frames; Turbo Motors; Magnetic Field Generators; Thermal Propulsion Rockets; Nuclear Pasta; **Phase 4**       | Uranium Fuel Rod & Nuclear Power; Cooling System; Fused Modular Frame; Turbo Motor; Magnetic Field Generator; Thermal Propulsion Rocket; Nuclear Pasta | Nitrogen well nearest base; drives for key alternates                        |
| **9 Endgame**             | Matter Conversion, Quantum Encoding, FICSIT Blueprints Mk.3, Spatial Energy Regulation, Peak Efficiency                    | SAM Converter chain; Ficsite; Time Crystals; Dark Matter; Superposition Oscillators; AI Expansion Servers; Ballistic Warp Drives; Biochemical Sculptors; **Phase 5** and launch | Reanimated SAM & Fluctuator; Ficsite Trigon; Time Crystal; Superposition Oscillator; AI Expansion Server; Ballistic Warp Drive; Biochemical Sculptor   | All remaining SAM nodes; full Mercer Sphere set for Depot upgrades           |

### Space Elevator (verified against wiki, 1× costs)

| Phase                   | Parts                                                                                                        | Unlocks                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------- |
| 1 Distribution Platform | 50 Smart Plating                                                                                             | Tiers 3 & 4             |
| 2 Construction Dock     | 1,000 Smart Plating, 1,000 Versatile Framework, 100 Automated Wiring                                         | Tiers 5 & 6             |
| 3 Main Body             | 2,500 Versatile Framework, 500 Modular Engine, 100 Adaptive Control Unit                                     | Tiers 7 & 8             |
| 4 Propulsion            | 500 Assembly Director System, 500 Magnetic Field Generator, 250 Thermal Propulsion Rocket, 100 Nuclear Pasta | Tier 9                  |
| 5 Assembly              | 1,000 Nuclear Pasta, 1,000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive           | Project Assembly launch |

## 8. Rocky Desert site atlas (derived from node data)

Coordinates are in metres (x east, y south; north is −y). Distances are measured from the default base.

| Site                                                               | Nodes                                                                                                            | Role                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **HUB / Starter** (~-1,640, -330)                                  | Iron pure ×3, Copper pure ×1, Limestone normal ×4                                                                | Tiers 0 to 2 core                   |
| **Coal Plateau** (~-1,115, -490; elev ~162 m), ~530 m E            | Coal pure ×3, SAM impure (~-809, -324)                                                                           | Coal power (pump water uphill)      |
| **North-East Steelworks** (~-1,040, -1,380; sea level), ~1.2 km NE | Iron pure, Coal normal ×4, Copper normal, Limestone normal                                                       | Steel (iron and coal on one site)   |
| **Caterium Ridge** (-1,785, -798), ~490 m N                        | Caterium pure                                                                                                    | Quickwire, AI Limiters              |
| **Quartz Cave** (~-1,780, -1,430; underground), ~1.1 km N          | Quartz pure ×2 + normal, SAM normal                                                                              | Quartz, Silica, SAM                 |
| **North-West Iron Field** (~-2,400, -1,200)                        | Iron pure ×4 + normal ×3, Limestone pure ×3                                                                      | Scale-up iron and concrete          |
| **West Coast** (~-2,620, -400)                                     | Iron normal ×6, Copper normal ×3, Limestone normal ×3                                                            | Secondary copper                    |
| **Coastal Oil** (~-2,400, 750; sea level), ~1.3 km SW              | Oil pure ×2 + normal ×2                                                                                          | Tier 5 oil                          |
| **Southern Uplands** (~-1,300, 500)                                | Bauxite pure ×2 + normal, Quartz pure ×2, Uranium normal, Coal pure ×2, Caterium pure, Sulfur normal, SAM normal | Tiers 7 and 8 aluminium and nuclear |

Caveats are surfaced in the UI. Patch 1.2.1.0 restored one missing Rocky Desert Limestone node that may not be in the dataset. Terrain (cliffs, water access) needs an in-game check, and the UI marks it "verify in game".

## 9. Exploration feature

- **Map**: an SVG pan and zoom plot of game coordinates (north up). It shows the base marker, 500 m, 1 km and 2 km rings, and layer toggles for each collectible type and each resource and purity. Hovering a point shows details, and clicking selects it.
- **Lists**: the nearest _N_ uncollected items of each type, with distance, bearing and elevation. Hard Drives show their unlock cost and the **tier at which that cost becomes producible**.
- **Tracker**: collected toggles are persisted, with "x / total" counters. Each count is set against what the MAM needs, e.g. Mercer Spheres needed for the full Dimensional Depot research set and Somersloops for the Alien tree.
- **Guidance cards** explain what each collectible does, the MAM nodes that consume it, and how many to aim for at each tier.

## 10. UX and accessibility

- Routes: `/` Dashboard · `/tier/:n` Guide (tabs 0 to 9) · `/layouts/:id` Configurator · `/explore` · `/calculator` · `/settings`.
- Tier tabs follow the WAI-ARIA tabs pattern (arrow keys, Home and End) and each is also a route, so it can be deep-linked.
- WCAG 2.1 AA: contrast ≥ 4.5:1, visible focus, labelled controls and no colour-only status (purity uses both colour and text).
- Responsive down to 360 px. The map and floor plan scroll inside their own containers, never the page.

## 11. Testing strategy

| Layer              | What                                                                                                                                                              | Tooling                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Unit (test-first)  | Solver (chains, byproducts, fluids, alternates), extraction, power, belts, machine split, floor plan, BOM, geo                                                    | Vitest                            |
| Data integrity     | Every content reference (items, recipes, schematics, nodes, layouts) resolves. Every layout solves without unbalanced inputs. Space Elevator costs match the wiki | Vitest                            |
| Component          | Tier tabs keyboard nav, step checklist persistence, configurator recalculation, explore filters and collected toggles                                             | RTL + user-event                  |
| Accessibility      | Each top-level page has zero axe violations                                                                                                                       | axe-core                          |
| Manual and browser | Smoke test every route in a real browser with screenshots                                                                                                         | Playwright MCP during development |

Done means `npm run lint && npm run typecheck && npm test && npm run build` all pass.

## 12. Delivery phases

| Phase                        | Scope                                                                                                                     | Acceptance                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **P0 Repo & tooling**        | git (`main`, `dev`, `feature/tier-guide-v1`), Vite/React/TS, Tailwind, ESLint, Prettier, Vitest, docs skeleton            | `lint`, `typecheck`, `test` and `build` pass on an empty app           |
| **P1 Data pipeline**         | `data:fetch`, `data:build` (own Docs parser), `data:verify` (diff vs SatisfactoryTools), generated JSON + typed accessors | Generated data committed; verify reports zero unexplained recipe diffs |
| **P2 Calc engine**           | solver, extraction, power, belts, machines, floor plan, BOM, geo, written test-first                                      | ≥ 95 % line coverage on `lib/calc`                                     |
| **P3 Shell & design system** | Layout, nav, theme, Tabs, Checkbox, NumberField, Select, Badge, Card, Disclosure                                          | axe-clean shell                                                        |
| **P4 Guide**                 | Tier pages, milestones table, steps, progress store, dashboard                                                            | Ticking a task persists across reloads                                 |
| **P5 Layout configurator**   | Controls, flow diagram, floor plan, machine, input and belt tables, BOM, auto build checklist                             | Changing any control recalculates everything                           |
| **P6 Exploration**           | Map, filters, nearest lists, tracker, Hard Drive tier mapping                                                             | Collected state persists; distances correct                            |
| **P7 Content**               | Tiers 0 to 9, Space Elevator, site atlas, 35+ layouts, Rocky Desert notes                                                 | Data-integrity tests green                                             |
| **P8 Calculator & settings** | Free-form planner, base location, defaults, purity overrides, import/export/reset                                         | Round-trip export → import                                             |
| **P9 QA & docs**             | Full test pass, browser smoke, README, ARCHITECTURE, DATA, CONTENT_GUIDE                                                  | All checks green; screenshots reviewed                                 |

Commits follow `{gitmoji} {scope}: {description}` at each phase boundary. Merging to `dev` or `main` is Nick's call.

## 13. Risks and mitigations

| Risk                                            | Mitigation                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Data drift with future patches                  | One-command regeneration from your own game `Docs`, plus the cross-verify script                                                      |
| Purity or node changes from Game Modes (1.2)    | Per-node purity overrides in Settings                                                                                                 |
| Terrain unknowns (cliffs, water) in site advice | "Verify in game" flags; advice is phrased as options, not absolutes                                                                   |
| Solver edge cases (loops, byproducts)           | Clamp-and-resolve algorithm with explicit surplus and deficit reporting, and tests for the aluminium water loop and the HOR byproduct |
| Bleeding-edge toolchain (Vite 8, TS 7)          | Pinned to compatible majors (TS 6.0, ESLint 10 + jsx-a11y-x, React Router 7)                                                          |

## 14. Backlog (post-v1)

- Save-file import, to auto-tick collected items and detect unlocked alternates.
- LP-optimal planner (minimise raw inputs or power), with an alternate-recipe recommender.
- Train and drone logistics planner between sites.
- Blueprint-sized layout export (foundation grid images).
- Hosted deployment (static) and cross-device sync.
- Game Mode cost multipliers (1.2) applied to milestones, Space Elevator and recipes.
- Power requirements for crash sites that have no item cost (not in the source data).
- Alternate-recipe tracking ("I have unlocked these Hard Drive alternates") so recipe pickers only offer what you own.

## 15. Delivery log (v1, 2026-10-10)

| Phase             | Result                                                                                                                                                         | Commit               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| P0 Repo & tooling | Done. `main`/`dev`/`feature/tier-guide-v1`, Vite 8, React 19.3, TS 6.0 strict, Tailwind 4, Vitest 5, ESLint 10                                                 | `b2a2393`, `bf3f771` |
| P1 Data pipeline  | Done. Own Docs parser; **276/276 machine recipes match SatisfactoryTools**; collectible totals match the wiki                                                  | `876e83a`            |
| P2 Calc engine    | Done. Test-first; `lib/calc` line coverage 97.9%                                                                                                               | `03d8815`            |
| P7 Content        | Done. 10 tiers, 78 steps (178 tasks), 14 sites, **47 layouts**, Space Elevator 1–5; every layout solves within its tier (commit message says 46; actual is 47) | `121a3ea`            |
| P3–P6, P8 UI      | Done. Guide, configurator, exploration, calculator, settings, dashboard                                                                                        | `22b2b9d`            |
| P9 QA & docs      | Done. 186 tests incl. axe on every page; browser smoke at 1440 px and 390 px; docs complete                                                                    | this commit          |

**Deviations from the plan, and why:**

- **ESLint 10 + `eslint-plugin-jsx-a11y-x`, not ESLint 9:** ESLint 9 is end-of-life, and the original jsx-a11y does not support 10.
- **Top-to-bottom flow diagram:** chosen over left-to-right after browser testing. Wide stages wrap at 4 nodes, so Tier 9 chains fit the panel.
- **Shelf-packed floor plan:** replaced a single column of rows after browser testing. It gives near-square, realistic footprints.
- **Late-game layouts import intermediates** made by their own layouts, with a "full chain" toggle. This keeps each layout manageable.
- **Power plants are generator-driven layouts.** Choose a generator count, and the fuel and water targets are derived from it.
- **Collectible count is 1,764**, not 1,768: audio tapes and the cosmetic pickup were excluded.
