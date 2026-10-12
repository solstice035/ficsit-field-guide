# Third-party notices

## Game data

Satisfactory, its item, recipe, building and world data are © Coffee Stain Studios. This is an unofficial, non-commercial fan tool. Item, building and resource icons, where shown, are © Coffee Stain Studios and are used only to identify game items. No FICSIT logos or map renders are bundled; the optional map backdrop (`public/map/world.png`) is user-supplied and git-ignored.

## Shipped derived data

`src/data/generated/nodes.json`, `collectibles.json` and the building footprints in `buildings.json` are derived from **rockfactory/satisfactory-logistics**, which in turn derives node data from **Hirashi3630/satisfactory_node_heatmap**.

```
MIT License

Copyright (c) 2024 Leonardo Ascione

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

```
MIT License

Copyright (c) 2025 Satisfactory Node Heatmap contributors

(Same MIT terms as above.)
```

## Cross-check only (not shipped)

**greeny/SatisfactoryTools** `data/data1.0.json` is downloaded by `npm run data:fetch` and used only by `npm run data:verify` to cross-check recipes. Code is MIT (© 2019 greeny).

## Game icons (shipped)

`public/icons/*.webp` are 64 px conversions of Coffee Stain's item and building icons, © Coffee Stain Studios, used only to identify game items and always shown beside the item's name. Most were downloaded from the community **Satisfactory Wiki** (satisfactory.wiki.gg). Three the wiki lacks (SAM Fluctuator, Converter, Quantum Encoder) come from **greeny/SatisfactoryTools**' bundled copies of the same game artwork. `src/data/generated/icons.json` records the source of each one.

## Facts

Space Elevator phase costs and a few mechanics notes (e.g. Smelter Somersloop slots) come from the community Satisfactory Wiki (satisfactory.wiki.gg). Facts are restated, not copied.

## npm dependencies

Runtime: React, React DOM, React Router, Zustand (all MIT). Run `npx license-checker --summary` for the full tree.
