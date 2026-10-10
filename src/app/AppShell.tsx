import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { cx } from '../components/cx.ts';
import { useSettings } from '../state/settings.ts';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tier', label: 'Tier guide', end: false },
  { to: '/layouts', label: 'Layouts', end: false },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/calculator', label: 'Calculator', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
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
          <nav aria-label="Primary" className="flex-1">
            <ul className="flex flex-wrap gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to === '/tier' ? `/tier/${currentTier}` : item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cx(
                        'block rounded px-3 py-1.5 text-sm font-medium no-underline hover:no-underline',
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
