import { useEffect, useId, useRef } from 'react';
import { cx } from '../../components/cx.ts';
import { moveStepFocus, openGlance, tickNextTask } from './actions.ts';
import { SHORTCUTS, type ShortcutAction, shortcutFor } from './keymap.ts';

/**
 * Listens for the guide's single-key shortcuts and renders the visible
 * "Keyboard shortcuts" button plus the sheet it opens (a modal dialog that
 * closes with Esc).
 */
export function KeyboardShortcuts({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = () => {
    const el = dialog.current;
    if (!el || el.open) return;
    // jsdom and very old browsers lack showModal; the open attribute still shows it.
    if (typeof el.showModal === 'function') el.showModal();
    else el.setAttribute('open', '');
    el.querySelector<HTMLElement>('button')?.focus();
  };
  const close = () => {
    const el = dialog.current;
    if (!el) return;
    if (typeof el.close === 'function') el.close();
    else el.removeAttribute('open');
  };

  useEffect(() => {
    const run: Record<ShortcutAction, () => void> = {
      'tick-next': tickNextTask,
      'next-step': () => moveStepFocus(1),
      'previous-step': () => moveStepFocus(-1),
      'open-glance': openGlance,
      'show-help': open,
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || dialog.current?.open) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const action = shortcutFor({
        key: event.key,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        targetTag: target?.tagName ?? '',
        targetEditable: target?.isContentEditable ?? false,
      });
      if (!action) return;
      event.preventDefault();
      run[action]();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-keyshortcuts="?"
        title="Keyboard shortcuts (?)"
        className={cx(
          'text-ink-muted hover:text-ink min-h-11 underline-offset-2 hover:underline',
          className,
        )}
      >
        Keyboard shortcuts
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
        className="bg-panel border-line text-ink m-auto text-left w-[min(28rem,calc(100vw-2rem))] rounded-xl border p-6 backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={close}
            className="border-line-strong hover:border-ink-faint min-h-11 rounded border px-3 text-sm"
          >
            Close
          </button>
        </div>
        <dl className="mt-4 space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <dt>
                <kbd className="bg-panel-3 border-line-strong inline-grid min-w-8 place-items-center rounded border px-2 py-1 font-mono text-sm">
                  {s.key}
                </kbd>
              </dt>
              <dd className="text-ink-muted">{s.description}</dd>
            </div>
          ))}
        </dl>
        <p className="text-ink-faint mt-4 text-sm">
          Shortcuts pause while you type in a field or hold Ctrl, Alt or Cmd.
        </p>
      </dialog>
    </>
  );
}
