# Content guide

All guide content is typed TypeScript in `src/content/`. Run `npm test` after any edit: `content.test.ts` checks every reference.

## IDs

Use the game's class names exactly. Find them in `src/data/generated/*.json`:

| Kind            | Example                                              | File              |
| --------------- | ---------------------------------------------------- | ----------------- |
| Item            | `Desc_IronPlateReinforced_C`                         | `items.json`      |
| Recipe          | `Recipe_Alternate_Screw_C`                           | `recipes.json`    |
| Building        | `Build_AssemblerMk1_C`                               | `buildings.json`  |
| Milestone / MAM | `Schematic_3-1_C`, `Research_Alien_CentralStorage_C` | `schematics.json` |
| Node            | `BP_ResourceNode114`                                 | `nodes.json`      |

Space Elevator parts are `Desc_SpaceElevatorPart_N_C`. 1 = Smart Plating, 2 = Versatile Framework, 3 = Automated Wiring, 4 = Modular Engine, 5 = Adaptive Control Unit, 6 = Magnetic Field Generator, 7 = Assembly Director System, 8 = Thermal Propulsion Rocket, 9 = Nuclear Pasta, 10 = Biochemical Sculptor, 11 = Ballistic Warp Drive, 12 = AI Expansion Server.

## Add a guide step

In `src/content/tiers/tierN.ts`:

```ts
{
  id: 't3-my-step',                 // unique across all tiers
  title: 'Short imperative title',
  kind: 'build',                    // handcraft | build | power | milestone | research | explore | logistics | space-elevator
  summary: 'One sentence shown when collapsed.',
  body: ['Optional paragraphs.'],
  tasks: [{ id: 't3-my-step-a', label: 'Tickable task' }],   // task IDs unique, never reuse (progress is keyed on them)
  milestoneIds: ['Schematic_3-1_C'],   // must be a milestone of THIS tier
  researchIds: ['Research_Sulfur_0_C'],
  layoutIds: ['t3-steel'],             // layout tier ≤ step tier
  siteIds: ['ne-steelworks'],
  explore: [{ kind: 'somersloop', count: 5, note: 'Nearest Somersloops' }],
}
```

Rules enforced by tests:

- Every milestone of a tier must be referenced by some step in that tier.
- Step and task IDs must be unique.
- Never rename a task ID after release, because users' ticks would be lost.

## Add a factory layout

In `src/content/layouts.ts`:

```ts
{
  id: 't5-my-layout',
  name: 'Display name',
  tier: 5,
  summary: 'What it makes and why.',
  siteId: 'coastal-oil',               // where you build it
  supplySiteIds: ['west-coast'],       // where raw inputs come from (purity defaults)
  imports: ['Desc_Rubber_C'],          // made by another layout and shipped in
  targets: [{ item: 'Desc_CircuitBoard_C', rate: 7.5 }],
  // or, for a power plant:
  // targets: [], generators: { buildingId: 'Build_GeneratorFuel_C', fuelId: 'Desc_LiquidFuel_C', count: 4 },
  tips: ['Practical advice.'],
}
```

The test suite solves every layout at its tier defaults. It fails on:

- warnings (such as node shortfalls)
- imports that are not declared
- any recipe or target unavailable at the layout's tier

## Add a site

In `src/content/sites.ts`, list real node IDs. Find them by coordinates:

```bash
node -e 'const N=require("./src/data/generated/nodes.json");
console.log(N.filter(n=>Math.hypot(n.x+1100,n.y+500)<200))'
```

Describe terrain as "verify in game" unless you have checked it in a save.

## Writing style

- British English in prose; game names keep the game's spelling ("Aluminum Ingot").
- Quote numbers only when they come from data. If you add a numeric claim, pin it in the "facts quoted in guide text" test block.
