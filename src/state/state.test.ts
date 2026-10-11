import { beforeEach, describe, expect, it } from 'vitest';
import { createBackup, resetAll, restoreBackup } from './backup.ts';
import { useExplore } from './explore.ts';
import { useLayouts } from './layouts.ts';
import { useProgress } from './progress.ts';
import { useSettings } from './settings.ts';

describe('stores', () => {
  beforeEach(() => resetAll());

  it('toggles progress flags on and off', () => {
    useProgress.getState().toggleTask('t0-land-hub');
    expect(useProgress.getState().tasks).toEqual({ 't0-land-hub': true });
    useProgress.getState().toggleTask('t0-land-hub');
    expect(useProgress.getState().tasks).toEqual({});
    useProgress.getState().togglePhase(1);
    expect(useProgress.getState().phases).toEqual({ '1': true });
  });

  it('clamps the current tier and manages purity overrides', () => {
    useSettings.getState().setCurrentTier(12);
    expect(useSettings.getState().currentTier).toBe(9);
    useSettings.getState().setPurityOverride('BP_ResourceNode114', 'impure');
    expect(useSettings.getState().purityOverrides).toEqual({ BP_ResourceNode114: 'impure' });
    useSettings.getState().setPurityOverride('BP_ResourceNode114', undefined);
    expect(useSettings.getState().purityOverrides).toEqual({});
  });

  it('sets and removes nested layout entries', () => {
    const { setEntry, update, resetLayout } = useLayouts.getState();
    setEntry('t1-iron-works', 'purity', 'Desc_OreIron_C', 'normal');
    update('t1-iron-works', { minerMk: 2 });
    expect(useLayouts.getState().configs['t1-iron-works']).toEqual({
      purity: { Desc_OreIron_C: 'normal' },
      minerMk: 2,
    });
    setEntry('t1-iron-works', 'purity', 'Desc_OreIron_C', undefined);
    expect(useLayouts.getState().configs['t1-iron-works']?.purity).toEqual({});
    resetLayout('t1-iron-works');
    expect(useLayouts.getState().configs['t1-iron-works']).toBeUndefined();
  });

  it('round-trips a backup', () => {
    useProgress.getState().toggleMilestone('Schematic_1-1_C');
    useSettings.getState().setBase({ x: 1, y: 2, z: 3 });
    useExplore.getState().toggleCollected('BP_DropPod1');
    useLayouts.getState().update('t2-rotors', { maxBeltMk: 3 });
    const backup = JSON.parse(JSON.stringify(createBackup(new Date('2026-10-10T00:00:00Z'))));

    resetAll();
    expect(useProgress.getState().milestones).toEqual({});

    restoreBackup(backup);
    expect(useProgress.getState().milestones).toEqual({ 'Schematic_1-1_C': true });
    expect(useSettings.getState().base).toEqual({ x: 1, y: 2, z: 3 });
    expect(useExplore.getState().collected).toEqual({ BP_DropPod1: true });
    expect(useLayouts.getState().configs['t2-rotors']).toEqual({ maxBeltMk: 3 });
  });

  it('rejects invalid backups without changing state', () => {
    useProgress.getState().toggleTask('keep-me');
    expect(() => restoreBackup({ app: 'other' })).toThrow(/not a FICSIT Field Guide backup/);
    expect(() => restoreBackup({ app: 'ficsit-field-guide', version: 99 })).toThrow(
      /newer version/,
    );
    expect(() =>
      restoreBackup({
        app: 'ficsit-field-guide',
        version: 1,
        progress: {},
        settings: { base: { x: 'a', y: 0, z: 0 } },
        layouts: {},
        explore: {},
      }),
    ).toThrow(/invalid base/);
    expect(useProgress.getState().tasks).toEqual({ 'keep-me': true });
  });
});
