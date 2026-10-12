import { Navigate, type RouteObject, createBrowserRouter } from 'react-router';
import { CalculatorPage } from '../features/calculator/CalculatorPage.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { ExplorePage } from '../features/explore/ExplorePage.tsx';
import { GlancePage } from '../features/glance/GlancePage.tsx';
import { TierPage } from '../features/guide/TierPage.tsx';
import { LayoutPage, LayoutsIndexPage } from '../features/layouts/LayoutPages.tsx';
import { SettingsPage } from '../features/settings/SettingsPage.tsx';
import { AppShell } from './AppShell.tsx';
import { NotFound } from './NotFound.tsx';

export const routes: RouteObject[] = [
  // Its own window on the second monitor: no app chrome.
  { path: '/glance', element: <GlancePage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tier', element: <Navigate to="/tier/0" replace /> },
      { path: 'tier/:tier', element: <TierPage /> },
      { path: 'layouts', element: <LayoutsIndexPage /> },
      { path: 'layouts/:layoutId', element: <LayoutPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'calculator', element: <CalculatorPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const createAppRouter = () => createBrowserRouter(routes);
