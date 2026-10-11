---
name: FICSIT Field Guide
description: A night-shift control panel for a Rocky Desert run, with graphite surfaces, FICSIT Amber for the next action and tabular readouts.
colors:
  bg: '#111317'
  panel: '#1a1d23'
  panel-2: '#22262e'
  panel-3: '#2b3039'
  line: '#3a414d'
  line-strong: '#4d5563'
  ink: '#eceef2'
  ink-muted: '#b3bac6'
  ink-faint: '#8f98a6'
  accent: '#fa9549'
  accent-strong: '#ffb878'
  accent-ink: '#1a1206'
  info: '#7cc4ff'
  ok: '#5ee08f'
  warn: '#ffd166'
  danger: '#ff8a8a'
  purity-impure: '#ff8a8a'
  purity-normal: '#ffd166'
  purity-pure: '#5ee08f'
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: '0.025em'
  readout:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: 'tnum'
  mono:
    fontFamily: 'ui-monospace, SF Mono, Menlo, Consolas, Liberation Mono, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '12px'
  full: '9999px'
spacing:
  '1': '4px'
  '1.5': '6px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '7': '28px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '6px 12px'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '6px 12px'
  input:
    backgroundColor: '{colors.panel-2}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '6px 8px'
  segmented-option-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '4px 8px'
  badge:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '2px 6px'
  item-chip:
    backgroundColor: '{colors.panel-2}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '4px 8px'
  nav-link:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '6px 12px'
  nav-link-active:
    backgroundColor: '{colors.panel-3}'
    textColor: '{colors.ink}'
  tier-tab:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px'
  tier-tab-selected:
    backgroundColor: '{colors.panel-3}'
    textColor: '{colors.accent-strong}'
  panel-card:
    backgroundColor: '{colors.panel}'
    rounded: '{rounded.lg}'
    padding: '16px'
  panel-hero:
    backgroundColor: '{colors.panel}'
    rounded: '{rounded.xl}'
    padding: '20px'
---

# Design System: FICSIT Field Guide

## Overview

**Creative North Star: "The Night-Shift Control Panel"**

This is a dark industrial readout, built to sit on a second monitor beside a running game in a dim room. The player looks at it in glances of a second or two, so the screen stays calm: graphite surfaces, quiet blue-grey text and tabular numbers. The one thing that needs doing next lights up in FICSIT Amber. Nothing else competes for that glow.

It is dense but not cramped. Machine counts, rates, clocks and power are the content, so they get the weight, the accent tint and tabular figures, while prose sits a step back in dimmed ink. Depth comes from tone and bezel lines, never from drop shadows, so the panel reads as one flat instrument face with recessed and raised zones.

Controls should feel like physical switches on that panel: tactile and sturdy, with clear pressed and selected states and hit areas that also work on a phone propped beside the keyboard.

**Key Characteristics:**

- Dark only (`color-scheme: dark`); there is no light theme.
- One amber accent, reserved for the next action, the selected state and key numbers.
- Flat surfaces stepped by tone (bg → panel → panel-2 → panel-3) and separated by bezel lines.
- Tabular numerals on every figure that can change.
- Status is never carried by colour alone: purity, task state and step kind always pair colour with text.
- Game item, building and resource icons speed up recognition but always sit beside the text name. The rest of the identity comes from type, colour tokens and text glyphs.

## Colors

Cool, blue-tinted graphite neutrals with a single warm amber signal, plus a small set of instrument-light status hues.

### Primary

- **FICSIT Amber** (accent): the signal colour. Primary buttons, the selected tier-tab border, the focus ring, progress fill, the active edge on the current-tier row and the hero panel's tint. On the flow diagram it also strokes conveyor belts.
- **Lit Amber** (accent-strong): amber at text-safe lightness. Use it for links, the selected tier label, accent badges and the amount in item chips (`120/min`, `4×`).
- **Amber Ink** (accent-ink): near-black warm brown for text that sits on FICSIT Amber.

### Secondary

- **Coolant Blue** (info): the information hue. Use it for MAM research badges, imported inputs in the flow diagram and pipe edges, so fluids read as blue and solids as amber.

### Status

- **Go Green** (ok): completion. Use it for 100% progress, tasks done, pure nodes and extraction nodes in the flow diagram.
- **Caution Yellow** (warn): attention. Use it for the storage warning, power-step badges and normal-purity nodes.
- **Fault Red** (danger): errors and impurity. Use it for invalid input borders, impure nodes and the destructive-reset hover. Space Elevator step badges also use this tone, which is a reuse of the hue rather than an error meaning.
- **Purity tokens** (purity-impure / purity-normal / purity-pure) alias Fault Red, Caution Yellow and Go Green so purity can be retuned separately from status.

### Neutral

- **Night Shift Graphite** (bg): the page behind everything.
- **Console Graphite** (panel): boxed cards, the sticky header (at 95% with backdrop blur) and unselected tier tabs.
- **Raised Console** (panel-2): inputs, item chips, tiles inside a panel and disclosure hover.
- **Selected Console** (panel-3): the active nav link, selected tier tab, current-tier row and progress track.
- **Bezel Line** (line): default borders and section rules.
- **Strong Bezel** (line-strong): control borders (inputs, secondary buttons, neutral badges) and hover borders on cards.
- **Readout White** (ink): headings and primary text.
- **Dimmed Readout** (ink-muted): body prose, summaries, table headers and inactive nav.
- **Stencil Grey** (ink-faint): eyebrows, step numbers, hints, suffixes and the footer. It holds ≥ 4.5:1 on bg and panel.

### Data-viz series (map only, not theme tokens)

Collectible layers on the Explore map use fixed series colours from `src/features/explore/nearby.ts`: Somersloop `#ff5fa2`, Hard Drive `#ff9b42`, Blue Slug `#5aa9ff`, Yellow Slug `#ffd84d` and Purple Slug `#c084fc`. They exist only to tell series apart on the map and must not leak into UI chrome.

### Named Rules

**The One Glow Rule.** FICSIT Amber marks what to act on or what is selected. If two unrelated things on a screen glow amber, one of them is wrong.

**The Fluids Are Blue Rule.** Coolant Blue means fluid or pipe, and amber means solid or belt, in every diagram and table that shows logistics.

**The Text-Grade Amber Rule.** Amber text always uses Lit Amber (accent-strong). Base FICSIT Amber is for fills, borders and strokes.

## Typography

**Display Font:** Inter (falls back to the system UI sans: SF Pro on macOS, Segoe UI on Windows)
**Body Font:** the same stack
**Label/Mono Font:** ui-monospace, SF Mono or Menlo, used rarely

Inter is declared first but not bundled or loaded, so most players see their system UI font. Treat the stack as "a neutral grotesque" and never rely on Inter-specific metrics.

**Character:** a single utilitarian sans in a tight range of weights (400 to 700, one 900 for the logo mark). Hierarchy comes from size, weight and the ink ramp, not from contrasting families.

### Hierarchy

- **Display** (600, 2.25rem, 1.11): the Dashboard hero headline only. It steps down to 1.875rem below 640px.
- **Headline** (600, 1.875rem, 1.2): page `h1` on Tier, Layout, Explore, Calculator and Settings. It steps down to 1.5rem below 640px.
- **Title** (600, 1.25rem, 1.4): section `h2` over a rule. Boxed cards use 1.125rem, and `h3`/`h4` use 1rem.
- **Body** (400, 0.875rem, 1.43): the working size for prose, tables, controls and nav. Step body text uses `leading-relaxed` (1.625) and a 48rem (`max-w-3xl`) measure.
- **Label** (600, 0.75rem, 0.025em, uppercase): the eyebrow above headings and sub-sections. Field labels use the same size at weight 500 in sentence case.
- **Readout** (700, 1.875rem, tabular): headline numbers on the Dashboard.

### Named Rules

**The Tabular Figures Rule.** Any number that can change (rates, counts, percentages, step numbers, input values) uses tabular figures (`.num`, `font-variant-numeric: tabular-nums`) so columns and live recalculations don't jitter.

**The Readout Outranks Prose Rule.** A number is set heavier or brighter than the sentence around it. Prose sits in Dimmed Readout and never in Readout White when a figure shares its line.

## Layout

- **Container:** a single centred column, max 80rem (1280px), with 16px side padding and 24px vertical padding on `main`. Reading-width blocks cap at 48rem.
- **Rhythm:** a 4px base step. Gaps cluster at 4, 6 and 8px inside components, 12 and 16px between items, and 20 to 28px for panel padding.
- **Breakpoints:** 640px (sm), 768px (md) and 1024px (lg).
  - Below 640px the header stacks and the primary nav becomes one horizontally scrolling row with a hidden scrollbar. The clipped edge signals more to scroll.
  - Tier tabs scroll in a snap row of 128px cards below 768px, then become a 10-column grid.
  - Sidebars (the layout configurator's controls) collapse behind a full-width disclosure button below 1024px.
- **Contained scroll:** the map and floor plan scroll inside their own containers, never the page. The layout works down to 360px wide.

### Named Rules

**The One Column Rule.** Pages are one column of sections. Multi-column grids (md:2, lg:3 cards; md:10 tier tabs) only appear inside a section and fall back to one column on phones.

## Elevation & Depth

The system is flat and uses tonal layering. Depth is a lightness step from bg (18.6% L) through panel, panel-2 and panel-3 (30.8% L), with bezel lines marking edges. A tile inside a panel automatically lifts one step (panel → panel-2). There are no drop shadows. The only `box-shadow` is an inset 3px amber bar marking the current tier row on the Dashboard, which works as an indicator rather than elevation. The sticky header gets separation from a 95% panel fill, a backdrop blur and its bottom bezel.

### Named Rules

**The No Drop Shadow Rule.** Surfaces never float. If something needs more presence, step its tone up one level or give it a stronger bezel; don't add a shadow.

**The Single Hero Rule.** The hero panel (amber-tinted gradient, amber-mixed border, 12px radius) appears at most once per page and holds the one thing to act on next.

## Shapes

Corners are small and squared-off: 4px on controls, badges and chips; 6px on tier tabs; 8px on panels and tiles; 12px only on the hero. Fully round shapes are kept for progress bars and status dots. Borders are always 1px, except the 2px underline on in-page tabs and the 2px focus outline. The logo mark is a 28px amber square with a black "F". It is set as type, not drawn.

## Components

### Buttons

Tactile and sturdy: they should feel like switches on a console.

- **Shape:** squared, 4px radius.
- **Primary:** FICSIT Amber fill, Amber Ink text, semibold, 6px × 12px padding. Use it once per context for the committing action.
- **Secondary (default):** transparent with a Strong Bezel 1px border and Readout White text. On hover the border turns FICSIT Amber. There is a compact 4px × 10px variant for inline actions.
- **Destructive:** the secondary style in Dimmed Readout, whose border turns Fault Red on hover.
- **Focus:** a global 2px FICSIT Amber outline at 2px offset.
- **Gap to close:** current buttons render around 30px tall. On touch layouts, the tactile direction calls for hit areas of at least 44px.

### Badges

- **Style:** an outlined pill-rectangle (4px radius, 1px border at 50–60% of the tone, tone-coloured text, 12px medium, no fill).
- **Tones:** neutral, accent, ok, warn, danger and info. `PurityBadge` adds a coloured dot plus the word, and `TierBadge` reads "T4" with a tooltip.

### Item chips

- **Style:** a Raised Console fill, Bezel Line border and 4px radius. The tabular amount is in Lit Amber semibold, followed by the item name in Readout White. A tier badge is appended when the item is not yet producible.
- **Icon (planned):** once icons ship, the item icon sits between the amount and the name at body size (about 20px), as decorative `alt=""` because the name follows. The order is amount, then icon, then name, so the figure still leads.

### Game icons

Item, building and resource icons ship as 64 px WebP in `public/icons/` (see `docs/DATA.md`) and render through `GameIcon`. Item chips (`ItemAmounts`) show them at 20 px; the redesign (I-83 onwards) adds the rest.

- **Always labelled:** an icon never replaces the text name, in chips, tables, selectors, the flow diagram or map legends. When the name is adjacent the icon is decorative (`alt=""`); if an icon must stand alone, it gets the name as its accessible label and a visible tooltip on hover and focus.
- **Sizes:** 16px inline in tables and badges, 20px in chips and lists, 32px in headers and cards. Never scale an icon up past its source resolution.
- **No colour role:** icons carry their own artwork colours and never stand in for status. Purity, completion and warnings still use the colour-plus-text tokens.
- **Containment:** icons sit on the surface as they are, with no amber tint, glow or extra frame.

### Cards / Containers

- **Section (default):** no box, just a Title heading over a bezel rule (`pb-2 mb-4`).
- **Card:** Console Graphite, Bezel Line border, 8px radius and 16px padding (20px from sm). Use it for sidebars, forms and step cards.
- **Hero:** a 135° gradient from 9% amber-mixed panel to plain panel, a 35% amber-mixed border, 12px radius and 20px padding (28px from sm).
- **Tile:** a borderless 8px block that lifts one tone step inside a card or hero.

### Inputs / Fields

- **Style:** a Raised Console fill, Strong Bezel border, 4px radius and 6px × 8px padding, with tabular numerals. Labels sit above in 12px medium Dimmed Readout.
- **Focus:** the border turns FICSIT Amber and the global focus ring is drawn.
- **Error:** the border turns Fault Red with `aria-invalid`. The number field restores the last valid value on blur.
- **Segmented control:** native radios inside a Raised Console trough. The selected option is filled FICSIT Amber with Amber Ink text.
- **Checkbox:** native, tinted with `accent-color`, 16px. Completed to-dos strike through in Dimmed Readout.

### Navigation

- **Primary nav:** links in 14px medium. Inactive links are Dimmed Readout and go to Readout White on hover. The active link sits on a Selected Console fill with a 4px radius. It lives in a sticky, blurred header and scrolls horizontally on phones.
- **In-page tabs:** a row on a bezel rule. The selected tab has a 2px FICSIT Amber underline and Readout White text. Arrow, Home and End keys work.

### Tier tabs (signature)

Ten tabs, each a small instrument card: "Tier n" in bold (Lit Amber when selected), the tier title in Dimmed Readout and "n% done" in tabular Stencil Grey. A 2px progress line runs along the bottom edge in amber, turning Go Green at 100%. The selected tab gets an amber border on Selected Console. Each tab is also a route.

### Step cards (signature)

A card-styled disclosure. The summary row shows a zero-padded step number (`01`), the title, a step-kind badge and a "done/total tasks" badge. Expanding reveals body prose, then eyebrow-labelled sub-sections (Checklist, Milestones, MAM research, Factory layouts, Sites, Nearest to your base, Tips). Completed steps drop to 80% opacity. The disclosure chevron is a text glyph (▶) that rotates 90°.

## Do's and Don'ts

### Do:

- **Do** take every colour from the `@theme` tokens in `src/index.css`. SVG diagrams currently hard-code the same hex values. When you touch them, switch to `var(--color-*)` rather than adding new literals.
- **Do** pair every status colour with text or a glyph (purity word plus dot, "3/5 tasks", "✓", "⚠").
- **Do** set changing figures in tabular numerals and give them more weight or brightness than the surrounding prose.
- **Do** step surfaces by tone (panel → panel-2 → panel-3) to show nesting or selection.
- **Do** keep a visible 2px FICSIT Amber focus ring on every interactive element.
- **Do** make touch targets at least 44px on phone layouts, in line with the tactile direction.
- **Do** honour `prefers-reduced-motion`; motion is limited to short transitions such as the chevron rotation.

### Don't:

- **Don't** add drop shadows, glows or floating cards.
- **Don't** use FICSIT Amber for decoration, secondary emphasis or a second competing call to action on the same screen.
- **Don't** use base FICSIT Amber (#fa9549) for small text; use Lit Amber.
- **Don't** show a game icon without its text name, and don't bundle FICSIT logos or map renders.
- **Don't** introduce a light theme or a second typeface without revisiting this document.
- **Don't** reuse the map's collectible series colours in UI chrome.
