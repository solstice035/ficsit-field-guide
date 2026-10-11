import { describe, expect, it } from 'vitest';
import { useProgress } from './progress.ts';
import { STORAGE_KEYS } from './storage.ts';
import { startCrossWindowSync } from './sync.ts';

describe('cross-window sync', () => {
  it('rehydrates a store when another window writes its key', async () => {
    const stop = startCrossWindowSync();
    const saved = {
      state: {
        tasks: { 't0-land-pod': true },
        milestones: {},
        research: {},
        phases: {},
        skipped: {},
      },
      version: 2,
    };
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.progress }));
    await Promise.resolve();
    expect(useProgress.getState().tasks).toEqual({ 't0-land-pod': true });
    stop();
    localStorage.removeItem(STORAGE_KEYS.progress);
  });

  it('ignores keys that are not ours', () => {
    const stop = startCrossWindowSync();
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
    expect(useProgress.getState().tasks).toEqual({});
    stop();
  });
});
