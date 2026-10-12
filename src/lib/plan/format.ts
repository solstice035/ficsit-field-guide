import { ITEM_BY_ID } from '../../data/gameData.ts';

/** Rounds to at most `decimals` places and drops trailing zeros. */
export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '∞';
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return rounded.toLocaleString('en-GB', { maximumFractionDigits: decimals });
}

/** `30/min` for solids, `30 m³/min` for fluids. */
export function formatRate(rate: number, itemId?: string): string {
  const fluid = itemId ? ITEM_BY_ID.get(itemId)?.form !== 'solid' && ITEM_BY_ID.has(itemId) : false;
  return `${formatNumber(rate)}${fluid ? ' m³' : ''}/min`;
}

/** Clock fraction → percentage with up to 4 decimals (the game accepts 4). */
export function formatClock(clock: number): string {
  return `${formatNumber(clock * 100, 4)}%`;
}

export function formatMW(mw: number): string {
  return mw >= 1000 ? `${formatNumber(mw / 1000, 2)} GW` : `${formatNumber(mw, 1)} MW`;
}
