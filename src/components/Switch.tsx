import type { ReactNode } from 'react';
import { cx } from './cx.ts';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** Strike the label through when on (for to-do items, not settings). */
  strikeWhenChecked?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * WAI-ARIA switch: a button with `role="switch"`, at least 44 px tall. On is
 * shown by the thumb's position and, for to-dos, a struck-through label, never
 * by colour alone.
 */
export function Switch({
  checked,
  onChange,
  label,
  strikeWhenChecked = false,
  size = 'md',
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        'group flex min-h-11 items-center gap-3 rounded text-left',
        size === 'lg' && 'min-h-14 gap-4',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'relative shrink-0 rounded-full border transition-colors',
          size === 'lg' ? 'h-8 w-14' : 'h-6 w-11',
          checked
            ? 'border-ok/70 bg-[color-mix(in_srgb,var(--color-ok)_30%,var(--color-panel-3))]'
            : 'border-line-strong bg-panel-3 group-hover:border-ink-faint',
        )}
      >
        <span
          className={cx(
            'absolute top-1/2 -translate-y-1/2 rounded-full transition-[left]',
            size === 'lg' ? 'size-6' : 'size-[18px]',
            checked
              ? cx('bg-ok', size === 'lg' ? 'left-[26px]' : 'left-[21px]')
              : 'bg-ink-muted left-[3px]',
          )}
        />
      </span>
      <span
        className={cx(
          'min-w-0',
          strikeWhenChecked && checked && 'text-ink-muted decoration-ink-faint line-through',
        )}
      >
        {label}
      </span>
    </button>
  );
}
