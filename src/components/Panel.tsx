import { type ReactNode, useId } from 'react';
import { cx } from './cx.ts';

/**
 * Surface levels, from loudest to quietest:
 * - `hero`: the one thing to act on (at most one per page), amber-tinted card.
 * - `card`: boxed controls that sit beside content (sidebars, forms).
 * - `section`: open content area, a heading over a rule with no box (default).
 */
export type PanelVariant = 'hero' | 'card' | 'section';

export interface PanelProps {
  title?: ReactNode;
  /** Heading level for the title (default h2). */
  level?: 2 | 3 | 4;
  variant?: PanelVariant;
  actions?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

const SURFACE: Record<PanelVariant, string> = {
  hero: 'panel-hero p-5 sm:p-7',
  card: 'panel p-4 sm:p-5',
  section: '',
};

/** A labelled page section. */
export function Panel({
  title,
  level = 2,
  variant = 'section',
  actions,
  description,
  className,
  children,
}: PanelProps) {
  const id = useId();
  const Heading = `h${level}` as const;
  const isSection = variant === 'section';
  return (
    <section className={cx(SURFACE[variant], className)} aria-labelledby={title ? id : undefined}>
      {(title || actions) && (
        <header
          className={cx(
            'flex flex-wrap items-baseline justify-between gap-2',
            isSection ? 'border-line mb-4 border-b pb-2' : 'mb-3',
          )}
        >
          <div>
            {title && (
              <Heading
                id={id}
                className={level === 2 ? (isSection ? 'text-xl' : 'text-lg') : 'text-base'}
              >
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
