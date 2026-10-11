# CLAUDE.md: FICSIT Field Guide

Local-first React SPA: a Satisfactory tier-by-tier guide for a Rocky Desert start. Read `docs/PLAN.md` first.

## Commands

- `npm run dev`: dev server (Vite, port 5173)
- `npm test`: Vitest (unit, component, axe). `npm run test:watch` for TDD
- `npm run lint`, `npm run typecheck`, `npm run build`
- `npm run data:fetch`, `npm run data:build`, `npm run data:verify`: game data pipeline

Done = `npm run lint && npm run typecheck && npm test && npm run build` all green.

## Layout

- `src/data/generated/*.json`: **generated**; never hand-edit. Change `scripts/data/*` and rerun `data:build`.
- `src/content/`: hand-authored guide content. IDs must resolve against generated data; `src/content/content.test.ts` enforces this.
- `src/lib/calc/`: pure functions only (no React, no store). Write tests first.
- `src/state/`: Zustand stores with `persist`. Bump `version` and add a `migrate` step when changing persisted shapes.
- `src/features/<feature>/`: route-level UI; `src/components/`: shared accessible primitives.

## Conventions

- TypeScript strict; explicit interfaces for props and domain types; `const` only.
- Units: rates are **per minute**; fluids in **m³**; world coordinates in **metres** (x east, y south, so north is −y).
- Game IDs keep the game's class names (`Desc_IronPlate_C`, `Recipe_IronPlate_C`, `Build_SmelterMk1_C`, `Schematic_3-1_C`).
- British English in prose and UI copy; game names keep the game's spelling (e.g. "Aluminum Ingot").
- Game item, building and resource icons may be bundled (Nick's decision, 2026-10-11; copyright risk accepted). Always pair an icon with its text name, never icon-only, and credit Coffee Stain in `docs/THIRD_PARTY_NOTICES.md`. FICSIT logos and map renders stay out.
- Accessibility: WAI-ARIA patterns for tabs and disclosures, labelled inputs, never colour-only status.

## Git

- Branches: `main` ← `dev` ← `feature/*`. Commit format: `{gitmoji} {scope}: {description}`.
- Never push `main` or `dev`. Merging is Nick's.
