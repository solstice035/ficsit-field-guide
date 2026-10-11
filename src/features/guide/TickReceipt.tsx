import { cx } from '../../components/cx.ts';
import type { LastTick } from './lastTick.ts';

export interface TickReceiptProps {
  lastTicked: LastTick | null;
  /** What NEXT now shows, so the announcement says where the tick moved on to. */
  nextLabel?: string;
  /** Hide the visible line (the live region stays mounted so it still announces). */
  visible?: boolean;
  onUndo: () => void;
  className?: string;
}

/**
 * "Ticked: X · Undo". A polite live region, so a tick from a NEXT switch or
 * the `n` key says what changed and can be taken back where it happened.
 */
export function TickReceipt({
  lastTicked,
  nextLabel,
  visible = true,
  onUndo,
  className,
}: TickReceiptProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(!(lastTicked && visible) && 'sr-only', className)}
    >
      {lastTicked && (
        <p className="text-ink-muted flex flex-wrap items-center gap-x-3 text-sm">
          <span>
            Ticked: <span className="text-ink">{lastTicked.label}</span>
            <span className="sr-only">{nextLabel ? `. Next: ${nextLabel}` : ''}</span>
          </span>
          <button
            type="button"
            onClick={onUndo}
            className="border-line-strong hover:border-ink-faint text-ink min-h-11 rounded border px-3"
          >
            Undo
          </button>
        </p>
      )}
    </div>
  );
}
