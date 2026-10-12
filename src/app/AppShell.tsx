import { useSyncExternalStore } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { cx } from '../components/cx.ts';
import { useSettings } from '../state/settings.ts';
import { storageStatus } from '../state/storage.ts';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tier', label: 'Tier guide', end: false },
  { to: '/layouts', label: 'Layouts', end: false },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/calculator', label: 'Calculator', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

/** Persistent warning once the browser stops saving (blocked or full storage). */
function StorageNotice() {
  const persistent = useSyncExternalStore(storageStatus.subscribe, storageStatus.persistent);
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-7xl px-4 empty:hidden">
      {!persistent && (
        <p className="border-warn/40 text-warn mt-4 rounded border px-3 py-2 text-sm">
          ⚠ This browser isn&apos;t saving your progress (storage is blocked or full). Changes last
          for this session only. <Link to="/settings">Export a backup</Link> before closing the tab.
        </p>
      )}
    </div>
  );
}

export function AppShell() {
  const currentTier = useSettings((s) => s.currentTier);
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-accent text-accent-ink sr-only z-50 rounded px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="border-line bg-panel/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-y-1.5 px-4 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:py-3">
          <NavLink
            to="/"
            className="text-ink flex items-center gap-2 font-semibold no-underline hover:no-underline"
          >
            <span
              aria-hidden="true"
              className="bg-accent text-accent-ink grid size-7 place-items-center rounded font-black"
            >
              F
            </span>
            <span>
              FICSIT Field Guide{' '}
              <span className="text-ink-faint text-sm font-normal">· Rocky Desert</span>
            </span>
          </NavLink>
          {/* Phones: one scrollable row rather than three wrapped lines. */}
          <nav
            aria-label="Primary"
            className="scrollbar-none -mx-4 min-w-0 overflow-x-auto px-4 sm:mx-0 sm:flex-1 sm:px-0"
          >
            <ul className="flex gap-1 sm:flex-wrap">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to === '/tier' ? `/tier/${currentTier}` : item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cx(
                        'block rounded px-2.5 py-1.5 text-sm font-medium whitespace-nowrap sm:px-3 no-underline hover:no-underline',
                        isActive || (item.to === '/tier' && pathname.startsWith('/tier'))
                          ? 'bg-panel-3 text-ink'
                          : 'text-ink-muted hover:text-ink',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <StorageNotice />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 focus:outline-none"
      >
        <Outlet />
      </main>
      <footer className="border-line text-ink-faint border-t px-4 py-4 text-center text-xs">
        Unofficial fan tool. Satisfactory is © Coffee Stain Studios. Game data: Update 1.1 Docs
        (valid for 1.2).
      </footer>
      <ScrollRestoration />
    </div>
  );
}
