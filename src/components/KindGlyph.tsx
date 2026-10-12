import type { StepKind } from '../content/types.ts';

/** 16 px line glyphs, one per step kind, drawn on a 16 grid with a 1.5 stroke. */
const PATHS: Record<StepKind, string> = {
  handcraft: 'M3 13l5-5M9 3.5l3.5 3.5-2 2L7 5.5zM11 9l2 2',
  build: 'M8 2l5.5 3v6L8 14l-5.5-3V5zM2.5 5L8 8l5.5-3M8 8v6',
  power: 'M9 1.5L3.5 9H8l-1 5.5L12.5 7H8z',
  milestone: 'M3.5 14.5v-13M3.5 2.5h8l-1.5 3 1.5 3h-8',
  research: 'M6 1.5h4M6.5 1.5v4.5L2.5 13a1 1 0 00.9 1.5h9.2a1 1 0 00.9-1.5L9.5 6V1.5',
  explore: 'M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM10.5 5.5l-1.5 3.5-3.5 1.5 1.5-3.5z',
  logistics: 'M1.5 5.5h9M8 3l2.5 2.5L8 8M14.5 10.5h-9M8 8l-2.5 2.5L8 13',
  'space-elevator':
    'M8 1.5c2 1.5 3 4 3 7l-1.5 2h-3L5 8.5c0-3 1-5.5 3-7zM6.5 10.5L5 14.5M9.5 10.5l1.5 4M8 5.5v1',
};

export function KindGlyph({ kind, className }: { kind: StepKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[kind]} />
    </svg>
  );
}

/** A check mark for "Done" states, drawn to match the kind glyphs. */
export function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}
