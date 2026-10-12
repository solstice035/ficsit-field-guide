import { cx } from './cx.ts';

export interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
  showText?: boolean;
}

export function ProgressBar({ value, max, label, className, showText = true }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={cx('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${value} of ${max} (${pct}%)`}
        className="bg-panel-3 h-1.5 flex-1 overflow-hidden rounded-full"
      >
        <div
          className={cx('h-full rounded-full', pct === 100 ? 'bg-ok' : 'bg-ink-muted')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showText && <span className="text-ink-muted num w-10 text-right text-xs">{pct}%</span>}
    </div>
  );
}
