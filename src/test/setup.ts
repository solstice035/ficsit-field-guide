import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { resetAll } from '../state/backup.ts';

// Node-environment tests (`// @vitest-environment node`, e.g. scripts/model) have
// no DOM, so the browser-only setup below is skipped for them.
const hasDom = typeof window !== 'undefined';

// jsdom does not implement scrolling (used by React Router's ScrollRestoration).
if (hasDom) window.scrollTo = () => {};

beforeEach(() => {
  if (hasDom) resetAll();
});

afterEach(() => {
  if (!hasDom) return;
  cleanup();
  window.localStorage.clear();
});
