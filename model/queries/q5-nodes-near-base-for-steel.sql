-- Q5. Resource nodes within 1 km of the default base (-1,640 m, -330 m) that
-- supply a raw input of the standard Steel Ingot chain.
WITH RECURSIVE inputs(item) AS (
  SELECT 'Desc_SteelIngot_C'
  UNION
  SELECT mf.ingredient FROM made_from mf JOIN inputs i ON mf.product = i.item
)
SELECT n.id AS node, n.resource AS resource, n.purity AS purity,
  sqrt((n.x + 1640) * (n.x + 1640) + (n.y + 330) * (n.y + 330)) AS distance_m
FROM "ResourceNode" n
JOIN inputs i ON i.item = n.resource
WHERE (n.x + 1640) * (n.x + 1640) + (n.y + 330) * (n.y + 330) <= 1000000
ORDER BY distance_m, node;
