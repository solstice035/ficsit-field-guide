-- Q1. Every item in the standard Heavy Modular Frame chain, with the earliest
-- milestone tier that unlocks a standard recipe for it. The frame's earliest
-- tier is the highest tier in the list.
WITH RECURSIVE chain(item) AS (
  SELECT 'Desc_ModularFrameHeavy_C'
  UNION
  SELECT mf.ingredient FROM made_from mf JOIN chain c ON mf.product = c.item
)
SELECT c.item AS item, MIN(s.tier) AS tier
FROM chain c
JOIN "Product" p ON p.item = c.item
JOIN "Recipe" r ON r.id = p."Recipe_id" AND r.alternate = 0
JOIN "SchematicUnlocks_recipes" u ON u.recipes_id = r.id
JOIN "Schematic" s ON s.unlocks_id = u."SchematicUnlocks_id"
WHERE s.type IN ('milestone', 'tutorial')
  AND EXISTS (SELECT 1 FROM "Recipe_producedIn" rp WHERE rp."Recipe_id" = r.id)
GROUP BY c.item
ORDER BY tier DESC, item;
