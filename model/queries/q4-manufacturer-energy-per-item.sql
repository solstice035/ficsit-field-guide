-- Q4. Manufacturer recipes ranked by energy per item made (MJ = MW × s / items).
-- Every Manufacturer draws the same 55 MW, so energy per item is the useful rank.
SELECT r.id AS recipe, p.item AS product, b."powerMW" * r."durationS" / p.amount AS mj_per_item
FROM "Recipe" r
JOIN "Recipe_producedIn" rp ON rp."Recipe_id" = r.id
JOIN "Building" b ON b.id = rp."producedIn_id"
JOIN "Product" p ON p."Recipe_id" = r.id
WHERE b.id = 'Build_ManufacturerMk1_C'
ORDER BY mj_per_item DESC, recipe, product;
