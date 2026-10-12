import { type ReactNode, useId } from 'react';
import { cx } from './cx.ts';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  /** Strike the label through when checked (for to-do items, not settings). */
  strikeWhenChecked?: boolean;
  className?: string;
}

/** Native checkbox with a 24 px target (WCAG 2.2 2.5.8) and visible focus. */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  strikeWhenChecked = false,
  className,
}: CheckboxProps) {
  const id = useId();
  return (
    <div className={cx('flex items-start gap-2.5', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent size-6 shrink-0 cursor-pointer"
        aria-describedby={description ? `${id}-desc` : undefined}
      />
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={cx(
            'inline-block min-h-6 cursor-pointer py-0.5',
            strikeWhenChecked && checked && 'text-ink-muted decoration-ink-faint line-through',
          )}
        >
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="text-ink-faint text-xs">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
