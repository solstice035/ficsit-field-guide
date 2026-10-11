import { useEffect, useState } from 'react';

export type WakeLockStatus = 'unsupported' | 'off' | 'on' | 'failed';

/**
 * Keeps the screen awake while `enabled` (Screen Wake Lock API). Browsers drop
 * the lock when the tab is hidden, so it is taken again when the tab returns.
 */
export function useWakeLock(enabled: boolean): WakeLockStatus {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [held, setHeld] = useState<'on' | 'failed' | null>(null);

  useEffect(() => {
    if (!supported || !enabled) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
        setHeld('on');
      } catch {
        if (!cancelled) setHeld('failed');
      }
    };
    const onVisibility = () => void acquire();
    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release();
      setHeld(null);
    };
  }, [supported, enabled]);

  if (!supported) return 'unsupported';
  if (!enabled) return 'off';
  return held ?? 'off';
}
