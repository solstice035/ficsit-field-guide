import type { ItemAmount } from '../../data/types.ts';

export interface BomEntry {
  buildCost: readonly ItemAmount[];
  count: number;
}

/** Sums building costs × counts into a bill of materials (largest first). */
export function billOfMaterials(entries: readonly BomEntry[]): ItemAmount[] {
  const totals = new Map<string, number>();
  for (const { buildCost, count } of entries) {
    if (count <= 0) continue;
    for (const { item, amount } of buildCost)
      totals.set(item, (totals.get(item) ?? 0) + amount * count);
  }
  return [...totals]
    .map(([item, amount]) => ({ item, amount }))
    .sort((a, b) => b.amount - a.amount || a.item.localeCompare(b.item));
}
