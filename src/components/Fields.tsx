import { type ReactNode, useId, useState } from 'react';
import { cx } from './cx.ts';

const inputClass =
  'bg-panel-2 border-line-strong text-ink num w-full rounded border px-2 py-1.5 text-sm focus:border-accent';

export interface NumberFieldProps {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: ReactNode;
  className?: string;
}

/**
 * Number input that commits valid values on change and restores the last
 * valid value on blur, so typing intermediate states never breaks the plan.
 */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  hint,
  className,
}: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  // Sync external changes (reset, ×2) without clobbering what the user is typing.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (Number(draft) !== value) setDraft(String(value));
  }

  const parsed = Number(draft);
  const invalid =
    draft.trim() === '' ||
    !Number.isFinite(parsed) ||
    (min !== undefined && parsed < min) ||
    (max !== undefined && parsed > max);

  return (
    <div className={cx('min-w-0', className)}>
      <label htmlFor={id} className="text-ink-muted mb-1 block text-xs font-medium">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={draft}
          min={min}
          max={max}
          step={step}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            const next = Number(e.target.value);
            if (
              e.target.value.trim() !== '' &&
              Number.isFinite(next) &&
              (min === undefined || next >= min) &&
              (max === undefined || next <= max)
            ) {
              onChange(next);
            }
          }}
          onBlur={() => setDraft(String(value))}
          className={cx(inputClass, invalid && 'border-danger')}
        />
        {suffix && <span className="text-ink-faint shrink-0 text-xs">{suffix}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-ink-faint mt-1 text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: ReactNode;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  hint?: ReactNode;
  className?: string;
  hideLabel?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
  className,
  hideLabel,
}: SelectFieldProps) {
  const id = useId();
  return (
    <div className={cx('min-w-0', className)}>
      <label
        htmlFor={id}
        className={cx('text-ink-muted mb-1 block text-xs font-medium', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-describedby={hint ? `${id}-hint` : undefined}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="text-ink-faint mt-1 text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  title?: string;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string | number> {
  legend: ReactNode;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  hint?: ReactNode;
  className?: string;
}

/** Radio group styled as a segmented control (keyboard: arrow keys via native radios). */
export function Segmented<T extends string | number>({
  legend,
  value,
  options,
  onChange,
  hint,
  className,
}: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className={cx('min-w-0', className)}>
      <legend className="text-ink-muted mb-1 text-xs font-medium">{legend}</legend>
      <div className="border-line-strong bg-panel-2 inline-flex flex-wrap rounded border p-0.5">
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          const selected = o.value === value;
          return (
            <div key={String(o.value)} className="relative">
              <input
                id={id}
                type="radio"
                name={name}
                className="peer sr-only"
                checked={selected}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
              />
              <label
                htmlFor={id}
                title={o.title}
                className={cx(
                  'num block min-w-6 cursor-pointer rounded px-2 py-1 text-center text-xs font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-accent',
                  selected ? 'bg-accent text-accent-ink' : 'text-ink-muted hover:text-ink',
                  o.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                {o.label}
              </label>
            </div>
          );
        })}
      </div>
      {hint && <p className="text-ink-faint mt-1 text-xs">{hint}</p>}
    </fieldset>
  );
}
