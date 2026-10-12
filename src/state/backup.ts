import { parseExplore, useExplore } from './explore.ts';
import { parseLayouts, useLayouts } from './layouts.ts';
import { parseProgress, useProgress } from './progress.ts';
import { StateError, isRecord } from './schema.ts';
import { parseSettings, useSettings } from './settings.ts';

/**
 * v2: progress gains `skipped` and linked task ticks live on milestones and
 * phases; settings gain `hideCompleted`. v1 backups still restore.
 */
export const BACKUP_VERSION = 2;

export interface Backup {
  app: 'ficsit-field-guide';
  version: number;
  exportedAt: string;
  progress: Pick<
    ReturnType<typeof useProgress.getState>,
    'tasks' | 'milestones' | 'research' | 'phases' | 'skipped'
  >;
  settings: Pick<
    ReturnType<typeof useSettings.getState>,
    'base' | 'currentTier' | 'purityOverrides' | 'hideCompleted'
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
    progress: {
      tasks: p.tasks,
      milestones: p.milestones,
      research: p.research,
      phases: p.phases,
      skipped: p.skipped,
    },
    settings: {
      base: s.base,
      currentTier: s.currentTier,
      purityOverrides: s.purityOverrides,
      hideCompleted: s.hideCompleted,
    },
    layouts: { configs: l.configs, calculator: l.calculator },
    explore: { collected: e.collected, filters: e.filters },
  };
}

/**
 * Validates and restores a backup. Throws a user-readable error on bad input;
 * the whole file is parsed before any store changes, so nothing is partially applied.
 */
export function restoreBackup(raw: unknown): void {
  if (!isRecord(raw) || raw.app !== 'ficsit-field-guide') {
    throw new StateError('This file is not a FICSIT Field Guide backup.');
  }
  if (typeof raw.version === 'number' && raw.version > BACKUP_VERSION) {
    throw new StateError('This backup was made by a newer version of the guide.');
  }
  if (!Number.isInteger(raw.version) || (raw.version as number) < 1) {
    throw new StateError('The backup has an unsupported version.');
  }
  const { progress, settings, layouts, explore } = raw;
  if (!isRecord(progress) || !isRecord(settings) || !isRecord(layouts) || !isRecord(explore)) {
    throw new StateError('The backup is missing sections.');
  }

  const next = {
    progress: parseProgress(progress),
    settings: parseSettings(settings),
    layouts: parseLayouts(layouts),
    explore: parseExplore(explore),
  };
  useProgress.setState(next.progress);
  useSettings.setState(next.settings);
  useLayouts.setState(next.layouts);
  useExplore.setState(next.explore);
}

export function resetAll(): void {
  useProgress.getState().reset();
  useSettings.getState().reset();
  useLayouts.getState().reset();
  useExplore.getState().reset();
}
