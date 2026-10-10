import { type ReactNode, useId, useState } from 'react';
import { cx } from './cx.ts';

export interface DisclosureProps {
  summary: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  buttonClassName?: string;
  children: ReactNode;
}

/** WAI-ARIA disclosure: a button controlling a region. */
export function Disclosure({
  summary,
  defaultOpen = false,
  className,
  buttonClassName,
  children,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cx('flex w-full items-start gap-2 text-left', buttonClassName)}
      >
        <span
          aria-hidden="true"
          className={cx(
            'text-ink-faint mt-0.5 inline-block transition-transform',
            open && 'rotate-90',
          )}
        >
          ▶
        </span>
        <span className="min-w-0 flex-1">{summary}</span>
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
