# Backlog review: ecosystem opportunities vs. what we have

- **Date:** 2026-10-11
- **Inputs:** `dev` at `ca8e119` (v1 plus PRs #3–#8), the Linear project _FICSIT Field Guide_ (19 open issues, I-69 to I-88), and the research note _Satisfactory Tools, Apps and Open-Source Ecosystem_ (11 Oct 2026), with its 25-item backlog for a "unified companion product".
- **Lens:** that backlog was written for a broad, general-purpose planner. We are a **local-first, single-player, Rocky Desert tier guide** (PLAN §1–2). MoSCoW below is scored against _our_ outcomes O1–O6, not against the ecosystem's.

## 1. Summary

- **Already covered (8 of 25).** v1 matches the ecosystem's P0 core: data pipeline, exact multi-target solver, flow graph with build tables, power/clock/Somersloop maths, belt and pipe sizing, resource map, construction checklists and local persistence. Two items are partial: alternate-recipe control and share/reopen.
- **Planned in Linear (6 more).** Owned alternates (I-71), LP optimiser (I-74), save import (I-72), logistics (I-75), floor-plan export (I-76) and hosting (I-79). The I-80 redesign epic and `/glance` (I-85) cover the second-screen opportunity.
- **Real gaps worth adding (5).** A codex with "made by / used in" backlinks; per-tier Hard Drive alternate advice; shareable layout links; CSV export of the build list and BOM; a data-version stamp. All of them reuse data and engine code we already have.
- **Deliberately out (9).** Collaboration, autosave history, server tooling, public API, overlay, save editing, mod data, AI assistant and blueprint libraries. Each conflicts with the single-player, local-first, no-network charter, or costs far more than it returns.
- **Priority changes suggested.** I-71 should go from Medium to **High**, because it unlocks I-74 and the Hard Drive advice. I-79 should go from Low to **Medium**, because a phone or second screen can't reach `localhost` without it. I-88 (WCAG 2.2) should be decided **before** I-83 is built.

## 2. Coverage matrix: ecosystem backlog vs. Field Guide

Status key: ✅ shipped on `dev` · 🟡 partial · 📋 planned in Linear · ➕ gap (proposed new issue) · ⛔ out of scope

| #   | Ecosystem feature (their priority)              | Status     | Where / evidence                                                                                                                             | MoSCoW                                 |
| --- | ----------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | Versioned game-data pipeline (P0)               | ✅         | `data:fetch/build/verify`; two-way recipe verify in CI (`1f4d7e2`). **Gap:** the data is the 1.1 Docs and the UI shows no data-version stamp | Must (done) + ➕ stamp                 |
| 2   | Exact multi-output solver (P0)                  | ✅         | `lib/calc/solver.ts` (Gauss–Jordan with surplus clamp); multi-target `/calculator`                                                           | Must (done)                            |
| 3   | Alternate-recipe controls and optimisation (P0) | 🟡 📋      | Per-layout recipe overrides exist. Owned alternates: **I-71**. LP optimiser: **I-74**                                                        | Must: I-71 · Should: I-74              |
| 4   | Flow graph plus tabular build list (P0)         | ✅         | `FlowDiagram`, `PlanTables`, `lib/plan/checklist.ts`                                                                                         | Must (done)                            |
| 5   | Power, clock and Somersloop modelling (P0)      | ✅         | `power.ts`, `generators.ts`, layout clock strategy and sloops                                                                                | Must (done)                            |
| 6   | Belt and pipe capacity validation (P0)          | ✅         | `conveyance.ts`: smallest Mk per edge, or parallel lines                                                                                     | Must (done)                            |
| 7   | Local save/share/reopen (P0)                    | 🟡         | `localStorage` persist plus validated JSON backup. **No share link** for a layout config or calculator plan                                  | Should ➕ share link                   |
| 8   | Interactive map and node planning (P1)          | ✅         | `/explore` map, 14-site atlas, purity overrides, distance and bearing                                                                        | Must (done)                            |
| 9   | Save-aware plan vs. actual (P1)                 | 📋 partial | **I-72** auto-ticks collectibles, milestones and alternates. Line-level plan-vs-actual isn't planned                                         | Should: I-72 · Won't (now): line audit |
| 10  | Inter-factory logistics (P1)                    | 📋         | **I-75**                                                                                                                                     | Could                                  |
| 11  | Build progress and checklists (P1)              | ✅ 📋      | Tier step checklists and layout build checklists. Being reworked in **I-80/I-82/I-83/I-84**                                                  | Must (in flight)                       |
| 12  | Physical layout / module planner (P1)           | 🟡 📋      | Shelf-packed to-scale floor plan. Export: **I-76**                                                                                           | Could                                  |
| 13  | Blueprint integration (P1)                      | ⛔         | No `.sbp` support. At most, a free-text "blueprint note" per layout step                                                                     | Won't                                  |
| 14  | Codex / recipe explorer (P1)                    | ➕         | Not covered and not planned, but every item, recipe, building and schematic is already in `data/generated`                                   | **Should** ➕                          |
| 15  | Responsive / second-screen UI (P1)              | 🟡 📋      | Responsive to 360 px. `/glance` is **I-85**; hosting is **I-79**                                                                             | Must: I-85 · Should: I-79              |
| 16  | Collaboration and shared worlds (P2)            | ⛔         | Conflicts with the single-player assumption (PLAN §2.4)                                                                                      | Won't                                  |
| 17  | Recipe ranking and scenario comparison (P2)     | 📋 partial | The "delta vs. standard" view in **I-74**                                                                                                    | Could (with I-74)                      |
| 18  | History and autosave diffs (P2)                 | ⛔         | Needs robust save parsing and entity matching                                                                                                | Won't                                  |
| 19  | CSV and open interchange (P2)                   | 🟡         | JSON backup only                                                                                                                             | Could ➕ CSV of BOM and build list     |
| 20  | Dedicated-server dashboard (P2)                 | ⛔         | Needs network access; outside the planning journey                                                                                           | Won't                                  |
| 21  | Public API and plugins (P2)                     | ⛔         | —                                                                                                                                            | Won't                                  |
| 22  | In-game overlay and telemetry (P3)              | ⛔         | Fragile; `/glance` covers the realistic need                                                                                                 | Won't                                  |
| 23  | Safe save editing (P3)                          | ⛔         | I-72 is explicitly read-only                                                                                                                 | Won't                                  |
| 24  | Mod data and custom recipes (P3)                | ⛔         | —                                                                                                                                            | Won't                                  |
| 25  | AI assistant (P3)                               | ⛔         | —                                                                                                                                            | Won't                                  |

## 3. Linear issues with no ecosystem counterpart

These come from our own charter: guide quality, accessibility and content accuracy. Most of them are the product's differentiators.

| Issue | Title                                            | Current   | Suggested MoSCoW  | Note                                                                                                                 |
| ----- | ------------------------------------------------ | --------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| I-69  | Review and merge v1                              | In Review | Must              | **The status looks stale.** v1 and PRs #3–#8 are on `dev`; only `dev → main` is left                                 |
| I-80  | Tier guide redesign (epic)                       | High      | Must              | Critique scored 24/40, and the next action isn't on screen                                                           |
| I-82  | One tick per milestone, skipped state, migration | High      | Must              | Fixes a double-tick data-model bug; needs a store migration                                                          |
| I-83  | NEXT strip and Work Order Queue                  | High      | Must              | Core of the redesign                                                                                                 |
| I-81  | Icon pipeline (wiki WebP)                        | High      | Should            | **Conflicts with CLAUDE.md** ("No game artwork or icons are bundled"). Update CLAUDE.md and PLAN §2.6 in the same PR |
| I-84  | Dashboard NEXT hero                              | Medium    | Should            |                                                                                                                      |
| I-85  | `/glance` second-monitor page                    | Medium    | Must              | Our answer to the "mobile/overlay" gap                                                                               |
| I-87  | Impeccable finish review                         | Medium    | Should            |                                                                                                                      |
| I-88  | Decide WCAG 2.2 AA                               | Medium    | Must (decide now) | I-83's 44 px targets already exceed 2.5.8. Decide first so I-83 is accepted against the right bar                    |
| I-86  | Keyboard shortcuts                               | Low       | Could             |                                                                                                                      |
| I-70  | Verify terrain notes in game                     | Todo      | Should            | Content accuracy (PLAN §13)                                                                                          |
| I-73  | 1.2 Game Mode multipliers                        | Low       | Could             | Defaults are 1×, so only non-default saves benefit                                                                   |
| I-77  | Crash-site power requirements                    | Low       | Could             | needs-info                                                                                                           |
| I-78  | Restored Limestone node                          | Low       | Could             | needs-info; one node                                                                                                 |

## 4. Proposed new issues (the gaps)

Ordered by value for effort. None of them needs a backend or runtime network access.

1. **Codex: item, recipe and building pages with backlinks** (Should). `/codex/:id` shows "made by" (recipes, buildings, tier unlocked), "used in", the layouts that produce it, and the Hard Drives and MAM nodes that unlock its alternates. Step cards, plan tables and the calculator link into it. Low risk: the work is pure selectors over `data/generated` plus one route. (Ecosystem #14.)
2. **Hard Drive alternate advice per tier** (Should). On each tier page, list the alternates worth taking when a Hard Drive offers them, and why (for example Solid Steel Ingot, Stitched Iron Plate, Steamed Copper Sheet). Start as hand-authored content validated by `content.test.ts`; later back it with I-74's deltas. Depends on I-71. The ecosystem note calls "which hard-drive reward is best" a core use case, but no tool ties it to a progression guide. (Ecosystem #3/#17.)
3. **Shareable layout and calculator links** (Should). Encode a `LayoutConfig` or calculator plan into the URL (compressed query or hash). Opening the link loads it as a draft, and you can then "Save to my layouts". This makes I-79 hosting worthwhile and lets a phone open the exact plan. (Ecosystem #7.)
4. **Data-version stamp** (Should, small). `data:build` writes the Docs version, source commit and build date into the generated metadata. The footer and Settings show "Game data: 1.1 Docs (valid for 1.2.4)". (Ecosystem #1.)
5. **CSV export of the build list and bill of materials** (Could, small). Add it to the layout and calculator pages, using the same file-name rule as I-76. (Ecosystem #19.)
6. **Splitter and manifold helper for awkward ratios** (Could). For a row of _n_ machines, show the manifold vs. balanced-splitter choice and the splitter tree for the ratio. Pure `lib/calc` work, test-first. (Ecosystem "micro-planning specialists".)
7. **Offline-installable PWA** (Could, follows I-79). Add a service worker and manifest, so the hosted site keeps working on a phone with no signal. This keeps O5's "no runtime network" promise once the site is hosted.

## 5. Suggested MoSCoW roll-up

**Must (next):** I-88 decision → I-82 → I-83 → I-85; I-71; close out I-69 (`dev → main`).

**Should:** I-81 (with the CLAUDE.md/PLAN update), I-84, I-87, I-70, I-79 (raise to Medium), I-72, I-74, ➕ Codex, ➕ Hard Drive advice, ➕ share links, ➕ data-version stamp.

**Could:** I-75, I-76, I-73, I-77, I-78, I-86, ➕ CSV export, ➕ splitter helper, ➕ PWA.

**Won't (this horizon):** collaboration, autosave diffs, line-level plan vs. actual, server dashboard, public API, overlay, save editing, mod data, AI assistant, blueprint file integration.

## 6. Housekeeping found during the review

- PLAN §14 lists eight backlog bullets. All eight are now in Linear (I-71 to I-77, I-79). Linear is the source of truth, and §14 links here.
- PLAN §2.6, PLAN §10 and CLAUDE.md still say "no game artwork or icons" and "WCAG 2.1 AA". I-81 and I-88 will change both, so update the docs in those PRs.
- I-69's checklist ("Squash-merge PR into `dev`") has been overtaken by PRs #3–#8. Only the `dev → main` merge is left.
