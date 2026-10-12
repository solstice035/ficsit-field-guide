import type { ReactNode } from 'react';
import { cx } from './cx.ts';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** Strike the label through when on (for to-do items, not settings). */
  strikeWhenChecked?: boolean;
  /** md 44 px target; lg 56 px (dashboard hero); xl 80 px (glance, read from a metre away). */
  size?: 'md' | 'lg' | 'xl';
  /** A keyboard shortcut for this switch, announced via `aria-keyshortcuts` and the tooltip. */
  keyShortcut?: string;
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
  keyShortcut,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-keyshortcuts={keyShortcut}
      title={keyShortcut ? `Shortcut: ${keyShortcut}` : undefined}
      onClick={() => onChange(!checked)}
      className={cx(
        'group flex min-h-11 items-center gap-3 rounded text-left',
        size === 'lg' && 'min-h-14 gap-4',
        size === 'xl' && 'min-h-20 gap-6',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'relative shrink-0 rounded-full border transition-colors',
          { md: 'h-6 w-11', lg: 'h-8 w-14', xl: 'h-12 w-20' }[size],
          checked
            ? 'border-ok/70 bg-[color-mix(in_srgb,var(--color-ok)_30%,var(--color-panel-3))]'
            : 'border-line-strong bg-panel-3 group-hover:border-ink-faint',
        )}
      >
        <span
          className={cx(
            'absolute top-1/2 -translate-y-1/2 rounded-full transition-[left]',
            { md: 'size-[18px]', lg: 'size-6', xl: 'size-10' }[size],
            checked
              ? cx('bg-ok', { md: 'left-[21px]', lg: 'left-[26px]', xl: 'left-[34px]' }[size])
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
