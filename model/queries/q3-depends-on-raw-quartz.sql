-- Q3. Every item that transitively depends on Raw Quartz through standard recipes.
WITH RECURSIVE deps(item) AS (
  SELECT product FROM made_from WHERE ingredient = 'Desc_RawQuartz_C'
  UNION
  SELECT mf.product FROM made_from mf JOIN deps d ON mf.ingredient = d.item
)
SELECT item FROM deps ORDER BY item;
