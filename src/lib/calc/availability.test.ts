import { describe, expect, it } from 'vitest';
import { BUILDINGS, ITEMS, RECIPES, SCHEMATICS } from '../../data/gameData.ts';
import { computeAvailability } from './availability.ts';

const availability = computeAvailability({
  items: ITEMS,
  recipes: RECIPES,
  buildings: BUILDINGS,
  schematics: SCHEMATICS,
});
const tierOf = (id: string): number | undefined => availability.itemTier.get(id);

describe('computeAvailability (real 1.1 data)', () => {
  it.each([
    ['Desc_OreIron_C', 0],
    ['Desc_IronPlate_C', 0],
    ['Desc_IronPlateReinforced_C', 0],
    ['Desc_Cement_C', 0],
    ['Desc_HighSpeedWire_C', 1], // Quickwire via MAM Caterium
    ['Desc_QuartzCrystal_C', 1],
    ['Desc_Rotor_C', 2],
    ['Desc_ModularFrame_C', 2],
    ['Desc_SpaceElevatorPart_1_C', 2], // Smart Plating
    ['Desc_Gunpowder_C', 2], // Black Powder: MAM + Assembler
    ['Desc_Water_C', 3],
    ['Desc_SteelPlate_C', 3], // Steel Beam
    ['Desc_SpaceElevatorPart_2_C', 3], // Versatile Framework
    ['Desc_Motor_C', 4],
    ['Desc_SpaceElevatorPart_3_C', 4], // Automated Wiring
    ['Desc_LiquidOil_C', 5],
    ['Desc_Plastic_C', 5],
    ['Desc_CircuitBoard_C', 5],
    ['Desc_Computer_C', 6],
    ['Desc_ModularFrameHeavy_C', 6],
    ['Desc_AluminumPlate_C', 7], // Alclad Aluminum Sheet
    ['Desc_ComputerSuper_C', 7],
    ['Desc_NitrogenGas_C', 8],
    ['Desc_ModularFrameFused_C', 8],
    ['Desc_TimeCrystal_C', 9],
  ])('%s is available from tier %i', (id, tier) => {
    expect(tierOf(id)).toBe(tier);
  });

  it('places core production buildings in the right tiers', () => {
    const b = (id: string): number | undefined => availability.buildingTier.get(id);
    expect(b('Build_SmelterMk1_C')).toBe(0);
    expect(b('Build_ConstructorMk1_C')).toBe(0);
    expect(b('Build_AssemblerMk1_C')).toBe(2);
    expect(b('Build_FoundryMk1_C')).toBe(3);
    expect(b('Build_OilRefinery_C')).toBe(5);
    expect(b('Build_ManufacturerMk1_C')).toBe(6);
    expect(b('Build_Blender_C')).toBe(7);
    expect(b('Build_HadronCollider_C')).toBe(8);
    expect(b('Build_Converter_C')).toBe(9);
  });

  it('leaves FICSMAS-only items unavailable', () => {
    expect(tierOf('Desc_CandyCane_C') ?? Number.POSITIVE_INFINITY).toBe(Number.POSITIVE_INFINITY);
  });
});
