# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** Nick, playing a Rocky Desert run of Satisfactory Update 1.2. He needs to know what to build next, where to build it and how many machines it takes, from HUB Upgrade 1 to Project Assembly.
- **Later:** any Rocky Desert pioneer, once the guide is hosted publicly. Copy and defaults should already make sense to a stranger; nothing should assume Nick's personal save.
- Each person has one save, with progress kept locally. There is no shared or multiplayer state.

## Product Purpose

A tier-by-tier companion for one starting area. Each tier, 0 to 9, gets milestones, ordered steps with checklists, factory layouts that recalculate on the spot, and exploration targets, all tied to real Rocky Desert node coordinates and purity. It succeeds when the player can glance at it mid-session and know the next action without opening a wiki, a calculator and a map separately.

## Positioning

Generic calculators (Satisfactory Tools, Satisfactory Calculator) answer "how many machines for X". This guide answers "what do I do next, here". The plan is opinionated and ordered for a Rocky Desert start; its layouts are bound to named nearby sites and their purity; and the exploration tracker maps Hard Drive costs to the tier that can first afford them.

## Operating Context

- **Second monitor** next to the running game, often in a dark room. The player glances at it between actions, so the current step, counts and rates must read at a glance.
- **Phone or tablet** beside the keyboard as a touch reference. Supported down to 360 px wide; the map and floor plan scroll inside their own containers.
- **Planning sessions** away from the game happen too, but are secondary.
- Routes: Dashboard, Guide (`/tier/:n`), Layout configurator, Explore (map, lists, tracker), Calculator, Settings.

## Capabilities and Constraints

- Local-first React SPA. There is no backend and no runtime network calls, and progress persists in `localStorage` with JSON export and import.
- Game data comes from the game's Docs JSON via a scripted pipeline and is never hand-edited. Space Elevator costs are hand-entered from the wiki.
- Units: rates per minute, fluids in m³, coordinates in metres (north is −y).
- Game terms and IDs keep the game's spelling ("Aluminum Ingot", `Desc_IronPlate_C`). Prose and UI copy use British English.
- Advice on terrain is phrased as options and flagged "verify in game".
- **Undecided:** hosting target and timing for the public version (backlog), cross-device sync, save-file import.

## Brand Commitments

- Name: **FICSIT Field Guide**.
- Voice: lightly in-world FICSIT. It may nod to the corporate "pioneer" tone, but instructions stay plain, direct and unambiguous. Role-play never obscures a number or an action.
- **Game icons are allowed.** Item, building and resource icons may be bundled for fast recognition (decided 2026-10-11; the copyright risk is accepted). An icon always sits beside its text name and never replaces it. FICSIT logos and map renders are still not bundled; a user can drop their own map backdrop into `public/map/`.
- **Icon source:** the Satisfactory Wiki's icon categories, fetched once by the data pipeline and served locally (see `docs/PLAN.md` §14).

## Evidence on Hand

- Generated game data in `src/data/generated/`: 276 machine recipes cross-verified against SatisfactoryTools, 1,764 collectibles and 600+ resource nodes.
- Authored content in `src/content/`: 10 tiers, 78 steps (178 tasks), 14 sites, 47 layouts, and Space Elevator phases 1 to 5.
- No users, testimonials or usage data exist yet. Do not invent any.

## Product Principles

1. **Next action first.** Every screen answers "what do I do now" before it explains why.
2. **Numbers are the product.** Rates, counts, clocks and power must be correct, legible and traceable to the game data.
3. **Rooted in place.** Advice names real sites, distances and bearings from the player's base. It is not generic.
4. **Honest about uncertainty.** Unverified terrain and data gaps are flagged, never smoothed over.
5. **Yours, offline.** Works without a network or an account, and progress belongs to the player.

## Accessibility & Inclusion

WCAG 2.1 AA: contrast ≥ 4.5:1, visible focus, labelled controls, WAI-ARIA tabs and disclosures, and no colour-only status (purity always pairs colour with text). The axe-core check is zero violations on every top-level page.
