import { cx } from '../../components/cx.ts';

/** Opens `/glance` in its own window, to drag onto a second monitor. */
export function GlanceLink({ className }: { className?: string }) {
  return (
    <a
      href={`${import.meta.env.BASE_URL}glance`}
      target="ficsit-glance"
      className={cx(
        'border-line-strong text-ink hover:border-ink-faint inline-flex min-h-11 items-center gap-1 rounded border px-3 text-sm no-underline hover:no-underline',
        className,
      )}
    >
      Glance <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new window)</span>
    </a>
  );
}
