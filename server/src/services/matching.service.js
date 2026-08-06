import { calculateDistanceKm } from '../utils/geospatial.js';
import { parseWasteDescription } from './nlp.service.js';

/**
 * AI Matching Engine: Weighted scoring algorithm with transparent sub-score breakdowns
 * Formula: score = 0.4·compatibility + 0.3·volume_fit + 0.2·distance_score + 0.1·timing_score
 */
export function calculateMatchScore(wasteStream, resourceNeed) {
  const producer = wasteStream.producer || {};
  const consumer = resourceNeed.consumer || {};

  // 1. Compatibility Score (0 - 100)
  const nlpResult = parseWasteDescription(wasteStream.rawDescription || wasteStream.wasteType);
  const acceptedTypes = resourceNeed.acceptedTypes || [];
  
  let compatibilityScore = 30; // base score
  
  const isDirectTypeMatch = acceptedTypes.some(
    t => t.toLowerCase() === wasteStream.wasteType.toLowerCase() ||
         t.toLowerCase() === wasteStream.subtype.toLowerCase()
  );
  
  const isTaxonomyMatch = nlpResult.compatible.some(
    c => acceptedTypes.some(t => t.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(t.toLowerCase()))
  );

  if (isDirectTypeMatch) {
    compatibilityScore = 100;
  } else if (isTaxonomyMatch) {
    compatibilityScore = 85;
  } else if (acceptedTypes.length === 0 || acceptedTypes.includes('ANY') || acceptedTypes.includes('ORGANIC')) {
    compatibilityScore = 70;
  }

  // 2. Volume Fit Score (0 - 100)
  const minVol = resourceNeed.minVolume || 10.0;
  const wasteVol = wasteStream.quantity || 15.0;
  let volumeScore = 100;
  if (wasteVol < minVol) {
    volumeScore = Math.max(20, Math.round((wasteVol / minVol) * 100));
  } else {
    // Slight penalty if volume is 5x larger than minimum, perfect fit around 1x - 3x
    const ratio = wasteVol / minVol;
    if (ratio <= 3) volumeScore = 100;
    else volumeScore = Math.max(70, Math.round(100 - (ratio - 3) * 5));
  }

  // 3. Distance Score (0 - 100)
  const pLat = producer.lat || 40.7128;
  const pLng = producer.lng || -74.0060;
  const cLat = consumer.lat || 40.7180;
  const cLng = consumer.lng || -74.0010;

  const distKm = calculateDistanceKm(pLat, pLng, cLat, cLng);
  const maxRad = resourceNeed.maxRadiusKm || 10.0;

  let distanceScore = 100;
  if (distKm <= maxRad) {
    distanceScore = Math.round(100 - (distKm / maxRad) * 40); // 100 down to 60 within radius
  } else {
    distanceScore = Math.max(0, Math.round(60 - (distKm - maxRad) * 10));
  }

  // 4. Timing Score (0 - 100)
  const readyAt = new Date(wasteStream.pickupReadyAt || Date.now());
  const windowFrom = new Date(resourceNeed.needWindowFrom || Date.now());
  const windowTo = new Date(resourceNeed.needWindowTo || Date.now() + 86400000 * 2);

  let timingScore = 80;
  if (readyAt >= windowFrom && readyAt <= windowTo) {
    timingScore = 100;
  } else if (Math.abs(readyAt - windowFrom) <= 86400000) {
    timingScore = 75;
  } else {
    timingScore = 50;
  }

  // Overall Weighted Score
  const totalScore = Math.round(
    (0.4 * compatibilityScore +
     0.3 * volumeScore +
     0.2 * distanceScore +
     0.1 * timingScore) * 10
  ) / 10;

  const reasoning = `${totalScore}% compatibility seal · ${distKm}km distance, ${wasteVol}${wasteStream.unit || 'kg'} volume fit, ready ${readyAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return {
    score: totalScore,
    compatibilityScore,
    volumeScore,
    distanceScore,
    timingScore,
    reasoning,
    distanceKm: distKm,
  };
}
