import { itemTier } from '../data/availability.ts';
import { itemName } from '../data/gameData.ts';
import type { ItemAmount } from '../data/types.ts';
import { formatNumber, formatRate } from '../lib/plan/format.ts';
import { TierBadge } from './Badge.tsx';
import { GameIcon } from './GameIcon.tsx';
import { cx } from './cx.ts';

export interface ItemAmountsProps {
  items: readonly ItemAmount[];
  /** Show `/min` rates instead of counts. */
  rates?: boolean;
  /** Flag items not yet producible at this tier. */
  currentTier?: number;
  className?: string;
}

/** Inline list of `amount × Item` chips. */
export function ItemAmounts({ items, rates, currentTier, className }: ItemAmountsProps) {
  if (!items.length) return <span className="text-ink-faint text-sm">None</span>;
  return (
    <ul className={cx('flex flex-wrap gap-1.5', className)}>
      {items.map(({ item, amount }) => {
        const tier = itemTier(item);
        const locked = currentTier !== undefined && tier > currentTier;
        return (
          <li
            key={item}
            className="bg-panel-2 border-line inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm"
          >
            <span className="num text-accent-strong font-semibold">
              {rates ? formatRate(amount, item) : `${formatNumber(amount)}×`}
            </span>
            <GameIcon id={item} />
            <span>{itemName(item)}</span>
            {locked && <TierBadge tier={tier} />}
          </li>
        );
      })}
    </ul>
  );
}
