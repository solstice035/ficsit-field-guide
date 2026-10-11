# Derived relation: product item is made from ingredient item.
# Same rule as derive.sql: standard machine recipes, raw resources are leaves.
INSERT { ?product ficsit:madeFrom ?ingredient }
WHERE {
  ?recipe a ficsit:Recipe ;
    ficsit:alternate false ;
    ficsit:producedIn ?building ;
    ficsit:products/ficsit:item ?product ;
    ficsit:ingredients/ficsit:item ?ingredient .
  ?product a ficsit:Item ;
    ficsit:isResource false .
}
