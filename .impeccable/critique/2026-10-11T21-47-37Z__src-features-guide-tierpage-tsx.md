---
target: "tier guide /tier/:n"
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/nicksolly/Dev/satisfactory/src/features/guide/TierPage.tsx"
target_fingerprint: "sha256:40dc8e896ab70f02863e0643ae831345bb999eb3faff19b64169c04918854fa2"
target_path: /Users/nicksolly/Dev/satisfactory/src/features/guide/TierPage.tsx
timestamp: 2026-10-11T21-47-37Z
slug: src-features-guide-tierpage-tsx
---
Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent)

# Tier guide critique after the Work Order Queue rebuild: 28/40 (Good)

Baseline 24/40 (2026-10-11 morning). Target ≥ 32/40.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | System status | 3 | Strong NEXT/fresh-line signals; a strip tick isn't announced and doesn't show what was ticked |
| 2 | Real-world match | 3 | Game vocabulary right; "—" sites and no distance/bearing in the queue |
| 3 | Control and freedom | 2 | Strip or `n` tick has no inline undo |
| 4 | Consistency | 3 | "Skip to next step" scrolls while "Skip step" changes progress |
| 5 | Error prevention | 2 | One key or a stray tap on the sticky switch commits a tick |
| 6 | Recognition over recall | 3 | Glyph + label rows; tier titles truncate; phone hides figures |
| 7 | Flexibility and efficiency | 4 | Shortcuts, glance, deep links, persisted Hide completed |
| 8 | Aesthetic and minimal | 2 | Figures shown three times; dead gap in the open step; amber still on ~10 elements |
| 9 | Error recovery | 3 | Storage notice names its recovery |
| 10 | Help and docs | 3 | Why this tier, tips, shortcut sheet; shortcuts only discoverable from the footer |
| **Total** | | **28/40** | **Good** |

## Design specificity
Structure authored for the product (NEXT strip in the header, work-order rows, Elevator Violet, figures on the task, glance with keep-awake, fresh-until-seen). Skin is category dark-SaaS: system sans, orange accent, text "F" logo. Detector: CLI 0 findings; browser: `overused-font` (Inter not loaded; taste call), `repeated-container-text` on /tier/9 (false positive), and one real `text-overflow` in the phone NEXT strip.

## Priority issues
- [P1] Phone NEXT strip: task label crushed to a 45 px column (strip 181 px tall), because GlanceLink's hard-coded `inline-flex` beats `hidden`; current step falls below the 390 fold.
- [P1] Strip / `n` tick has no undo and no live announcement.
- [P2] One Glow Rule: amber on ~10 first-screen elements (links, Skip link, chip amounts, tier badge).
- [P2] Open step repeats figures (strip, aside, layout card) and leaves a dead gap.
- [P2] "Skip" means scroll in one control and skip-step in two others.

## Persona red flags
- Night-shift pioneer: 12 px tab captions and card figures; header takes ~540 px before the current step.
- Phone user: sticky switch in the top bar can be hit while scrolling; Glance button shows on phone; current step below fold.
- Screen-reader user: NEXT switch always announces "off"; label change not announced.

## Minor
Unicode ↗ and ⚠ glyphs; fresh highlight snaps out; "Your current tier" duplicates the tab's "You"; "—" site placeholders; dashboard Then items not links.

## Questions
- Should the tier page be the plan view only, with the strip owning "act"?
- Should the phone strip be a bottom thumb bar with an undo slot?
- Should finishing a tier be a moment?
