import { NLP_KEYWORD_TAXONOMY } from '../utils/constants.js';

export function parseWasteDescription(description = '') {
  const lower = description.toLowerCase();
  
  // 1. Keyword extraction & taxonomy lookup
  let wasteType = 'ORGANIC';
  let subtype = 'general_organic';
  let compatible = ['compost'];

  for (const [keyword, info] of Object.entries(NLP_KEYWORD_TAXONOMY)) {
    if (lower.includes(keyword)) {
      wasteType = info.type;
      subtype = info.subtype;
      compatible = info.compatible;
      break;
    }
  }

  // Fallback checks if taxonomy lookup didn't match specific phrase
  if (wasteType === 'ORGANIC') {
    if (lower.includes('cardboard') || lower.includes('box') || lower.includes('paper')) {
      wasteType = 'CARDBOARD';
      subtype = 'corrugated';
      compatible = ['packaging', 'mulch', 'sheet_mulch'];
    } else if (lower.includes('burlap') || lower.includes('textile') || lower.includes('fabric')) {
      wasteType = 'TEXTILE';
      subtype = 'natural_fiber';
      compatible = ['mulch', 'insulation', 'crafts'];
    }
  }

  // 2. Regex quantity & unit extraction
  let quantity = 15; // default fallback
  let unit = 'kg';

  const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(kg|kilograms|lbs|pounds|tons|boxes|bags|liters|l)/i);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1]);
    const rawUnit = qtyMatch[2].toLowerCase();
    if (rawUnit.includes('lb') || rawUnit.includes('pound')) {
      quantity = Math.round(quantity * 0.453592 * 10) / 10; // convert to kg
      unit = 'kg';
    } else if (rawUnit.includes('ton')) {
      quantity = quantity * 1000;
      unit = 'kg';
    } else {
      unit = 'kg';
    }
  }

  // 3. Quality grade inference
  let qualityGrade = 'GRADE_B'; // default fair quality
  if (lower.includes('fresh') || lower.includes('clean') || lower.includes('pure') || lower.includes('uncontaminated') || lower.includes('sorted')) {
    qualityGrade = 'GRADE_A'; // high quality / uncontaminated
  } else if (lower.includes('mixed') || lower.includes('wet') || lower.includes('used') || lower.includes('soiled')) {
    qualityGrade = 'GRADE_C'; // mixed / low quality
  }

  return {
    rawDescription: description,
    wasteType,
    subtype,
    quantity,
    unit,
    qualityGrade,
    compatible,
  };
}
