import { type KeyboardEvent, useRef } from 'react';

/** Moves focus between tabs with arrows/Home/End (WAI-ARIA tabs, automatic activation). */
export function useRovingTabs(count: number, onSelect: (index: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const map: Record<string, number> = {
      ArrowRight: (index + 1) % count,
      ArrowLeft: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    refs.current[next]?.focus();
    onSelect(next);
  };
  return { refs, onKeyDown };
}
