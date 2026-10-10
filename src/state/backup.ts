import { useExplore } from './explore.ts';
import { useLayouts } from './layouts.ts';
import { useProgress } from './progress.ts';
import { useSettings } from './settings.ts';

export const BACKUP_VERSION = 1;

export interface Backup {
  app: 'ficsit-field-guide';
  version: number;
  exportedAt: string;
  progress: Pick<
    ReturnType<typeof useProgress.getState>,
    'tasks' | 'milestones' | 'research' | 'phases'
  >;
  settings: Pick<
    ReturnType<typeof useSettings.getState>,
    'base' | 'currentTier' | 'purityOverrides'
  >;
  layouts: Pick<ReturnType<typeof useLayouts.getState>, 'configs' | 'calculator'>;
  explore: Pick<ReturnType<typeof useExplore.getState>, 'collected' | 'filters'>;
}

/** Snapshot of all persisted state. */
export function createBackup(now = new Date()): Backup {
  const p = useProgress.getState();
  const s = useSettings.getState();
  const l = useLayouts.getState();
  const e = useExplore.getState();
  return {
    app: 'ficsit-field-guide',
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    progress: { tasks: p.tasks, milestones: p.milestones, research: p.research, phases: p.phases },
    settings: { base: s.base, currentTier: s.currentTier, purityOverrides: s.purityOverrides },
    layouts: { configs: l.configs, calculator: l.calculator },
    explore: { collected: e.collected, filters: e.filters },
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Validates and restores a backup. Throws a user-readable error on bad input;
 * never partially applies an invalid file.
 */
export function restoreBackup(raw: unknown): void {
  if (!isRecord(raw) || raw.app !== 'ficsit-field-guide') {
    throw new Error('This file is not a FICSIT Field Guide backup.');
  }
  if (typeof raw.version !== 'number' || raw.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of the guide.');
  }
  const { progress, settings, layouts, explore } = raw as unknown as Backup;
  if (![progress, settings, layouts, explore].every(isRecord)) {
    throw new Error('The backup is missing sections.');
  }
  const base = settings.base;
  if (
    !isRecord(base) ||
    ![base.x, base.y, base.z].every((n) => typeof n === 'number' && Number.isFinite(n))
  ) {
    throw new Error('The backup has an invalid base location.');
  }

  useProgress.setState({
    tasks: progress.tasks ?? {},
    milestones: progress.milestones ?? {},
    research: progress.research ?? {},
    phases: progress.phases ?? {},
  });
  useSettings.setState({
    base: { x: base.x, y: base.y, z: base.z },
    currentTier: Math.min(9, Math.max(0, Number(settings.currentTier) || 0)),
    purityOverrides: settings.purityOverrides ?? {},
  });
  useLayouts.setState({
    configs: layouts.configs ?? {},
    ...(layouts.calculator ? { calculator: layouts.calculator } : {}),
  });
  useExplore.setState({
    collected: explore.collected ?? {},
    ...(explore.filters ? { filters: explore.filters } : {}),
  });
}

export function resetAll(): void {
  useProgress.getState().reset();
  useSettings.getState().reset();
  useLayouts.getState().reset();
  useExplore.getState().reset();
}
