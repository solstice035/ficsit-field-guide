import { beforeEach, describe, expect, it } from 'vitest';
import { createBackup, resetAll, restoreBackup } from './backup.ts';
import { useExplore } from './explore.ts';
import { useLayouts } from './layouts.ts';
import { useProgress } from './progress.ts';
import { useSettings } from './settings.ts';

/** A backup as parsed JSON, loose enough to corrupt in tests. */
interface Raw {
  version: unknown;
  progress: Record<string, unknown>;
  settings: Record<string, unknown>;
  layouts: Record<string, unknown>;
  explore: Record<string, unknown>;
}

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

  describe('nested validation', () => {
    const valid = () => JSON.parse(JSON.stringify(createBackup())) as Raw;
    const snapshot = () =>
      JSON.stringify([
        useProgress.getState().tasks,
        useSettings.getState(),
        useLayouts.getState().configs,
        useLayouts.getState().calculator,
        useExplore.getState().filters,
        useExplore.getState().collected,
      ]);

    it.each([
      ['null calculator targets', (b: Raw) => (b.layouts.calculator = { tier: 2, targets: null })],
      ['null filters', (b: Raw) => (b.explore.filters = null)],
      ['non-boolean filter', (b: Raw) => (b.explore.filters = { types: { somersloop: 1 } })],
      ['fractional version', (b: Raw) => (b.version = 0.5)],
      ['negative version', (b: Raw) => (b.version = -1)],
      ['non-flag progress', (b: Raw) => (b.progress.tasks = { a: 'yes' })],
      ['unknown purity', (b: Raw) => (b.settings.purityOverrides = { n: 'mega' })],
      ['out-of-range base', (b: Raw) => (b.settings.base = { x: 1e9, y: 0, z: 0 })],
      ['string tier', (b: Raw) => (b.settings.currentTier = 'three')],
      ['bad miner', (b: Raw) => (b.layouts.configs = { l: { minerMk: 7 } })],
      ['negative rate', (b: Raw) => (b.layouts.configs = { l: { targetRates: { x: -5 } } })],
      ['infinite clock', (b: Raw) => (b.layouts.configs = { l: { maxClock: 'Infinity' } })],
      ['array configs', (b: Raw) => (b.layouts.configs = [])],
    ])('rejects %s and leaves every store unchanged', (_name, mutate) => {
      useProgress.getState().toggleTask('keep-me');
      useLayouts.getState().update('t2-rotors', { maxBeltMk: 3 });
      const before = snapshot();
      const backup = valid();
      mutate(backup);
      expect(() => restoreBackup(backup)).toThrow();
      expect(snapshot()).toBe(before);
    });

    it('ignores corrupt saved state on hydration', async () => {
      localStorage.setItem(
        'ffg.explore',
        JSON.stringify({ state: { collected: {}, filters: null }, version: 1 }),
      );
      await useExplore.persist.rehydrate();
      expect(useExplore.getState().filters.purities.pure).toBe(true);
      localStorage.removeItem('ffg.explore');
    });

    it('fills omitted calculator and filters with defaults, not existing state', () => {
      useExplore.getState().setFilters({ hideCollected: false, resource: 'Desc_OreIron_C' });
      useLayouts.getState().setCalculator({ tier: 5, targets: [] });
      const backup = valid();
      delete backup.layouts.calculator;
      delete backup.explore.filters;
      restoreBackup(backup);
      expect(useExplore.getState().filters.hideCollected).toBe(true);
      expect(useExplore.getState().filters.resource).toBe('');
      expect(useLayouts.getState().calculator.tier).toBe(2);
    });

    it('fills missing filter fields and drops unknown recipe and item IDs', () => {
      const backup = valid();
      backup.explore.filters = { hideCollected: false };
      backup.layouts.configs = {
        l: { recipeOverrides: { Desc_IronPlate_C: 'Recipe_Gone_C', Desc_Wire_C: '' } },
      };
      backup.layouts.calculator = {
        tier: 3,
        targets: [
          { item: 'Desc_Gone_C', rate: 5 },
          { item: 'Desc_Wire_C', rate: 10 },
        ],
      };
      restoreBackup(backup);
      const { filters } = useExplore.getState();
      expect(filters.hideCollected).toBe(false);
      expect(filters.purities).toEqual({ impure: true, normal: true, pure: true });
      expect(useLayouts.getState().configs.l).toEqual({ recipeOverrides: { Desc_Wire_C: '' } });
      expect(useLayouts.getState().calculator.targets).toEqual([{ item: 'Desc_Wire_C', rate: 10 }]);
    });
  });
});
