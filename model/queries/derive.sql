-- Derived relation: product item is made from ingredient item.
-- Standard (non-alternate) machine recipes only. Raw resources are leaves, so
-- Converter recipes that turn one ore into another add no edges.
CREATE VIEW made_from AS
SELECT DISTINCT p.item AS product, i.item AS ingredient
FROM "Product" p
JOIN "Ingredient" i ON i."Recipe_id" = p."Recipe_id"
JOIN "Recipe" r ON r.id = p."Recipe_id"
JOIN "Item" pi ON pi.id = p.item
WHERE r.alternate = 0
  AND pi."isResource" = 0
  AND EXISTS (SELECT 1 FROM "Recipe_producedIn" rp WHERE rp."Recipe_id" = r.id);
