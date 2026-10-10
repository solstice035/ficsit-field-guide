import { describe, expect, it } from 'vitest';
import {
  cleanRecipeName,
  nativeName,
  num,
  parseClassList,
  parseForm,
  parseItemAmounts,
  round,
} from './docs.ts';

describe('docs parsing helpers', () => {
  it('extracts the short native class name', () => {
    expect(nativeName("/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'")).toBe('FGRecipe');
  });

  it('parses item amount lists', () => {
    const value =
      '((ItemClass="/Script/Engine.BlueprintGeneratedClass\'/Game/FactoryGame/Resource/Parts/Rubber/Desc_Rubber.Desc_Rubber_C\'",Amount=6),' +
      '(ItemClass="/Script/Engine.BlueprintGeneratedClass\'/Game/FactoryGame/Resource/Parts/Fuel/Desc_LiquidFuel.Desc_LiquidFuel_C\'",Amount=6000))';
    expect(parseItemAmounts(value)).toEqual([
      { item: 'Desc_Rubber_C', amount: 6 },
      { item: 'Desc_LiquidFuel_C', amount: 6000 },
    ]);
  });

  it('returns an empty list for empty amount strings', () => {
    expect(parseItemAmounts('')).toEqual([]);
  });

  it('parses producer class lists and de-duplicates', () => {
    const value =
      '("/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C",' +
      '"/Game/FactoryGame/Buildable/-Shared/WorkBench/BP_WorkBenchComponent.BP_WorkBenchComponent_C",' +
      '"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C")';
    expect(parseClassList(value)).toEqual(['Build_ConstructorMk1_C', 'BP_WorkBenchComponent_C']);
  });

  it('parses schematic references containing hyphens', () => {
    const value =
      '("/Script/Engine.BlueprintGeneratedClass\'/Game/FactoryGame/Schematics/Progression/Schematic_3-1.Schematic_3-1_C\'")';
    expect(parseClassList(value)).toEqual(['Schematic_3-1_C']);
  });

  it('maps resource forms', () => {
    expect(parseForm('RF_SOLID')).toBe('solid');
    expect(parseForm('RF_LIQUID')).toBe('liquid');
    expect(parseForm('RF_GAS')).toBe('gas');
    expect(parseForm('RF_INVALID')).toBeNull();
  });

  it('parses numbers with fallbacks', () => {
    expect(num({ ClassName: 'X', mPower: '4.000000' }, 'mPower')).toBe(4);
    expect(num({ ClassName: 'X' }, 'mPower', 7)).toBe(7);
  });

  it('cleans alternate recipe names', () => {
    expect(cleanRecipeName('Alternate: Recycled Plastic')).toBe('Recycled Plastic');
    expect(cleanRecipeName('Iron Plate')).toBe('Iron Plate');
  });

  it('rounds without negative zero', () => {
    expect(round(-0.00001, 2)).toBe(0);
    expect(round(1.23456, 2)).toBe(1.23);
  });
});
