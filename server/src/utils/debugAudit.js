import { parseWasteDescription } from '../services/nlp.service.js';
import { calculateMatchScore } from '../services/matching.service.js';
import { getOpenMeteoForecast } from '../services/weather.service.js';
import { generateWasteForecast } from '../services/prediction.service.js';
import { optimizePickupRoutes } from '../services/routing.service.js';
import { calculateImpactForMatch } from '../services/impact.service.js';
import { SEED_USERS, SEED_WASTE_STREAMS, SEED_RESOURCE_NEEDS } from './mockStore.js';

async function runFullAudit() {
  console.log('🧪 Starting CircularSync AI Full-Stack Logic & AI Engine Audit...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Audit NLP Classifier
  const nlp1 = parseWasteDescription('45kg fresh espresso coffee grounds');
  assert(nlp1.wasteType === 'ORGANIC', 'NLP Classifier: Coffee grounds -> ORGANIC');
  assert(nlp1.quantity === 45, 'NLP Classifier: Extracted 45kg quantity');
  assert(nlp1.qualityGrade === 'GRADE_A', 'NLP Classifier: Inferred GRADE_A quality');

  const nlp2 = parseWasteDescription('85kg clean corrugated cardboard boxes');
  assert(nlp2.wasteType === 'CARDBOARD', 'NLP Classifier: Cardboard -> CARDBOARD');

  // 2. Audit Matchmaking Engine
  const testStream = {
    id: 'ws-test',
    rawDescription: '45kg coffee grounds',
    wasteType: 'ORGANIC',
    subtype: 'nitrogen_rich',
    quantity: 45.0,
    unit: 'kg',
    producer: SEED_USERS[0],
    pickupReadyAt: new Date().toISOString(),
  };

  const testNeed = {
    id: 'rn-test',
    acceptedTypes: ['ORGANIC', 'coffee_grounds'],
    minVolume: 20.0,
    maxRadiusKm: 10.0,
    consumer: SEED_USERS[8],
  };

  const matchRes = calculateMatchScore(testStream, testNeed);
  assert(matchRes.score >= 80, `Match Engine: Score calculated (${matchRes.score}%)`);
  assert(matchRes.compatibilityScore === 100, 'Match Engine: 100% Compatibility sub-score');
  assert(matchRes.volumeScore === 100, 'Match Engine: 100% Volume sub-score');
  assert(typeof matchRes.reasoning === 'string' && matchRes.reasoning.includes('compatibility seal'), 'Match Engine: Sealed reasoning string formatted');

  // 3. Audit Weather & Prediction Engine
  const weatherData = await getOpenMeteoForecast(40.7128, -74.0060);
  assert(Array.isArray(weatherData) && weatherData.length === 7, 'Open-Meteo Weather: Returned 7-day forecast array');

  const forecastRes = await generateWasteForecast(testStream);
  assert(forecastRes.length === 7, 'Predictive Engine: Generated 7-day forecast items');
  assert(forecastRes[0].factors.smaBaseKg > 0, 'Predictive Engine: SMA base calculated');

  // 4. Audit Logistics Route Optimizer
  const testJobs = [
    { id: 'j1', match: { wasteStream: { producer: SEED_USERS[0] }, resourceNeed: { consumer: SEED_USERS[8] } }, routeOrder: 1 },
    { id: 'j2', match: { wasteStream: { producer: SEED_USERS[1] }, resourceNeed: { consumer: SEED_USERS[9] } }, routeOrder: 2 },
  ];

  const routeRes = optimizePickupRoutes(testJobs);
  assert(routeRes.length === 2, 'Route Optimizer: Ordered 2 pickup stops');
  assert(routeRes[0].estimatedTime instanceof Date, 'Route Optimizer: Calculated stop ETA timestamp');

  // 5. Audit Impact Calculator
  const impactRes = calculateImpactForMatch({ wasteStream: testStream });
  assert(impactRes.co2SavedKg === 22.5, `Impact Engine: Calculated 22.5kg CO2 saved (0.5 factor * 45kg)`);
  assert(impactRes.landfillDivertedKg === 45, 'Impact Engine: 1:1 Landfill diversion (45kg)');
  assert(impactRes.producerSavings === 9.00, 'Impact Engine: Producer disposal savings ($0.20/kg)');

  console.log(`\n🎉 Audit Completed: ${passed}/${total} Tests Passed Cleanly!`);
}

runFullAudit();
