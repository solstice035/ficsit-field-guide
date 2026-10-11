import { describe, expect, it, vi } from 'vitest';
import { createResilientStorage } from './storage.ts';

const fakeBackend = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: vi.fn((k: string) => data.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => void data.set(k, v)),
    removeItem: vi.fn((k: string) => void data.delete(k)),
  };
};

describe('createResilientStorage', () => {
  it('writes through to the backend while it works', () => {
    const backend = fakeBackend();
    const { storage, status } = createResilientStorage(() => backend);
    storage.setItem('a', '1');
    expect(backend.data.get('a')).toBe('1');
    expect(storage.getItem('a')).toBe('1');
    expect(status.persistent()).toBe(true);
  });

  it('flags blocked storage at startup and keeps the session in memory', () => {
    const { storage, status } = createResilientStorage(() => {
      throw new Error('SecurityError');
    });
    expect(status.persistent()).toBe(false);
    storage.setItem('a', '1');
    expect(storage.getItem('a')).toBe('1');
  });

  it('survives a quota failure mid-session and notifies listeners once', () => {
    const backend = fakeBackend();
    const { storage, status } = createResilientStorage(() => backend);
    const listener = vi.fn();
    status.subscribe(listener);
    backend.setItem.mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => storage.setItem('a', '1')).not.toThrow();
    expect(() => storage.setItem('b', '2')).not.toThrow();
    expect(status.persistent()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.getItem('a')).toBe('1');
    expect(() => storage.removeItem('a')).not.toThrow();
    expect(storage.getItem('a')).toBeNull();
  });
});
