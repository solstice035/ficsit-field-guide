import type { Building, Item, Purity } from '../../data/types.ts';
import { PURITY_MULTIPLIER } from './constants.ts';

export interface GeneratorOption {
  generatorId: string;
  fuelId?: string;
  /** Generators needed at 100% clock to cover the demand. */
  count: number;
  /** Fuel consumed per minute for exactly the demand. */
  fuelPerMin: number;
  /** Supplemental (water) per minute for exactly the demand. */
  supplementalPerMin: number;
  supplementalId?: string;
  /** Byproduct (nuclear waste) per minute. */
  byproductPerMin: number;
  byproductId?: string;
  powerPerGeneratorMW: number;
}

/**
 * Generators and fuel needed to supply `demandMW` with one fuel type.
 * Fuel burn = MW × 60 / energy (MJ per item or m³). Geothermal uses purity.
 */
export function generatorFor(
  demandMW: number,
  generator: Building,
  fuel: Item | undefined,
  purity: Purity = 'normal',
): GeneratorOption | undefined {
  const spec = generator.generator;
  if (!spec) return undefined;
  const isGeothermal = spec.fuels.length === 0;
  const powerPerGeneratorMW = isGeothermal
    ? spec.powerMW * PURITY_MULTIPLIER[purity]
    : spec.powerMW;
  if (powerPerGeneratorMW <= 0) return undefined;

  const fuelSpec = fuel ? spec.fuels.find((f) => f.item === fuel.id) : undefined;
  if (!isGeothermal && (!fuel || !fuelSpec || fuel.energyMJ <= 0)) return undefined;

  const fuelPerMin = fuel && !isGeothermal ? (demandMW * 60) / fuel.energyMJ : 0;
  const byproduct = fuelSpec?.byproduct;
  return {
    generatorId: generator.id,
    ...(fuel && !isGeothermal ? { fuelId: fuel.id } : {}),
    count: Math.ceil(demandMW / powerPerGeneratorMW - 1e-9),
    fuelPerMin,
    supplementalPerMin: fuelSpec?.supplemental ? demandMW * spec.supplementalPerMW : 0,
    ...(fuelSpec?.supplemental ? { supplementalId: fuelSpec.supplemental } : {}),
    byproductPerMin: byproduct ? fuelPerMin * byproduct.amount : 0,
    ...(byproduct ? { byproductId: byproduct.item } : {}),
    powerPerGeneratorMW,
  };
}
