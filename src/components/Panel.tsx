import { type ReactNode, useId } from 'react';
import { cx } from './cx.ts';

export interface PanelProps {
  title?: ReactNode;
  /** Heading level for the title (default h2). */
  level?: 2 | 3 | 4;
  actions?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A labelled section card. */
export function Panel({ title, level = 2, actions, description, className, children }: PanelProps) {
  const id = useId();
  const Heading = `h${level}` as const;
  return (
    <section className={cx('panel p-4 sm:p-5', className)} aria-labelledby={title ? id : undefined}>
      {(title || actions) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && (
              <Heading id={id} className={level === 2 ? 'text-lg' : 'text-base'}>
                {title}
              </Heading>
            )}
            {description && <p className="text-ink-muted mt-1 text-sm">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
