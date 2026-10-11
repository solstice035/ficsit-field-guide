import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useLastTick } from '../features/guide/lastTick.ts';
import { resetAll } from '../state/backup.ts';

// jsdom does not implement scrolling (used by React Router's ScrollRestoration).
window.scrollTo = () => {};

beforeEach(() => {
  resetAll();
  useLastTick.setState({ last: null });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
