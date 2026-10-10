import { type ReactNode, useId, useState } from 'react';
import { cx } from './cx.ts';
import { useRovingTabs } from './useRovingTabs.ts';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  label: string;
  tabs: readonly TabItem[];
  defaultTab?: string;
  className?: string;
}

/** Generic in-page tabs. */
export function Tabs({ label, tabs, defaultTab, className }: TabsProps) {
  const base = useId();
  const initial = Math.max(
    0,
    tabs.findIndex((t) => t.id === defaultTab),
  );
  const [active, setActive] = useState(initial);
  const { refs, onKeyDown } = useRovingTabs(tabs.length, setActive);
  const current = tabs[active] ?? tabs[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="border-line flex gap-1 overflow-x-auto overflow-y-hidden border-b"
      >
        {tabs.map((tab, index) => {
          const selected = index === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              id={`${base}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cx(
                '-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap',
                selected
                  ? 'border-accent text-ink'
                  : 'text-ink-muted hover:text-ink border-transparent',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {current && (
        <div
          role="tabpanel"
          id={`${base}-panel-${current.id}`}
          aria-labelledby={`${base}-tab-${current.id}`}
          tabIndex={0}
          className="pt-4 focus-visible:outline-none"
        >
          {current.content}
        </div>
      )}
    </div>
  );
}
