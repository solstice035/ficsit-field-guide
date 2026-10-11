-- Q2. Alternate Wire recipes that use less Copper Ore per Wire than the standard
-- recipe, assuming the standard Copper Ingot recipe.
WITH ore_per_ingot AS (
  SELECT i.amount / p.amount AS v
  FROM "Ingredient" i
  JOIN "Product" p ON p."Recipe_id" = i."Recipe_id" AND p.item = 'Desc_CopperIngot_C'
  WHERE i."Recipe_id" = 'Recipe_IngotCopper_C' AND i.item = 'Desc_OreCopper_C'
),
wire AS (
  SELECT r.id AS recipe, r.alternate AS alternate,
    COALESCE((SELECT i.amount FROM "Ingredient" i
              WHERE i."Recipe_id" = r.id AND i.item = 'Desc_CopperIngot_C'), 0)
      * (SELECT v FROM ore_per_ingot) / p.amount AS ore_per_wire
  FROM "Recipe" r
  JOIN "Product" p ON p."Recipe_id" = r.id AND p.item = 'Desc_Wire_C'
  WHERE EXISTS (SELECT 1 FROM "Recipe_producedIn" rp WHERE rp."Recipe_id" = r.id)
)
SELECT recipe, ore_per_wire
FROM wire
WHERE alternate = 1
  AND ore_per_wire < (SELECT ore_per_wire FROM wire WHERE recipe = 'Recipe_Wire_C')
ORDER BY ore_per_wire, recipe;
