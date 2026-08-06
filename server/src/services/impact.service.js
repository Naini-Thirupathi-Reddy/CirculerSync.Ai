import { IMPACT_CONSTANTS } from '../utils/constants.js';

export function calculateImpactForMatch(match) {
  const wasteStream = match.wasteStream || {};
  const quantityKg = wasteStream.quantity || 10.0;
  const wasteType = (wasteStream.wasteType || 'ORGANIC').toUpperCase();

  const typeConfig = IMPACT_CONSTANTS.BY_WASTE_TYPE[wasteType] || IMPACT_CONSTANTS.BY_WASTE_TYPE.ORGANIC;

  const co2SavedKg = Math.round(quantityKg * typeConfig.co2PerKg * 10) / 10;
  const waterSavedL = Math.round(quantityKg * typeConfig.waterPerKg * 10) / 10;
  const landfillDivertedKg = Math.round(quantityKg * 10) / 10; // 1:1 diversion
  const producerSavings = Math.round(quantityKg * typeConfig.producerSavingsPerKg * 100) / 100;
  const consumerSavings = Math.round(quantityKg * typeConfig.consumerSavingsPerKg * 100) / 100;

  return {
    co2SavedKg,
    waterSavedL,
    landfillDivertedKg,
    producerSavings,
    consumerSavings,
  };
}
