import type { ReactNode } from 'react';
import type { Purity } from '../data/types.ts';
import { cx } from './cx.ts';

export type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'border-line-strong text-ink-muted',
  accent: 'border-accent/60 text-accent-strong',
  ok: 'border-ok/50 text-ok',
  warn: 'border-warn/50 text-warn',
  danger: 'border-danger/50 text-danger',
  info: 'border-info/50 text-info',
};

export interface BadgeProps {
  tone?: Tone;
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', title, className, children }: BadgeProps) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs leading-none font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const PURITY_TONE: Record<Purity, Tone> = { impure: 'danger', normal: 'warn', pure: 'ok' };
const PURITY_DOT: Record<Purity, string> = {
  impure: 'bg-purity-impure',
  normal: 'bg-purity-normal',
  pure: 'bg-purity-pure',
};

/** Purity shown with colour and text (never colour alone). */
export function PurityBadge({ purity }: { purity: Purity }) {
  return (
    <Badge tone={PURITY_TONE[purity]}>
      <span
        aria-hidden="true"
        className={cx('inline-block size-2 rounded-full', PURITY_DOT[purity])}
      />
      {purity[0]!.toUpperCase() + purity.slice(1)}
    </Badge>
  );
}

export function TierBadge({ tier, prefix = 'T' }: { tier: number; prefix?: string }) {
  if (!Number.isFinite(tier)) return <Badge tone="neutral">n/a</Badge>;
  return (
    <Badge tone="accent" title={`Available from Tier ${tier}`}>
      {prefix}
      {tier}
    </Badge>
  );
}
