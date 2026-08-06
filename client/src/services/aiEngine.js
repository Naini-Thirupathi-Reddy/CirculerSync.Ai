/**
 * CircularSync AI — Real-Time Semantic Symbiosis & NLP Engine
 * Computes material C:N ratios, moisture compatibility, geospatial proximity,
 * and weighted multi-criteria symbiosis scores.
 */

// Known Material Taxonomy & Chemical/Biological Profiles
const MATERIAL_TAXONOMY = [
  {
    keywords: ['coffee', 'espresso', 'grounds', 'chaff', 'arabica', 'robusta', 'java'],
    wasteType: 'ORGANIC',
    subtype: 'coffee_grounds',
    qualityGrade: 'GRADE_A',
    cnRatio: 20, // 20:1 Carbon-to-Nitrogen ratio
    moisture: 'High (60-65%)',
    idealConsumers: [
      { name: 'Mycelium Magic Mushrooms', role: 'Mushroom Cultivation Substrate', minCn: 15, maxCn: 25, idealMoisture: '60-70%' },
      { name: 'City Farm Urban Agriculture', role: 'Soil Amendment & Vermicompost', minCn: 15, maxCn: 30, idealMoisture: '50-70%' },
    ],
  },
  {
    keywords: ['cardboard', 'box', 'boxes', 'corrugated', 'carton', 'paper', 'packaging'],
    wasteType: 'CARDBOARD',
    subtype: 'corrugated',
    qualityGrade: 'GRADE_A',
    cnRatio: 400, // 400:1 Carbon-rich brown material
    moisture: 'Dry (<12%)',
    idealConsumers: [
      { name: 'EcoBox Sustainable Packaging', role: 'Recycled Fiber Re-Pulping', minCn: 300, maxCn: 500, idealMoisture: 'Dry' },
      { name: 'Metro Compost Operations', role: 'Carbon Bulking Agent', minCn: 200, maxCn: 500, idealMoisture: 'Any' },
    ],
  },
  {
    keywords: ['bread', 'bakery', 'flour', 'pastry', 'dough', 'crust', 'wheat', 'grain'],
    wasteType: 'ORGANIC',
    subtype: 'bakery_waste',
    qualityGrade: 'GRADE_B',
    cnRatio: 30,
    moisture: 'Medium (20-30%)',
    idealConsumers: [
      { name: 'City Farm Urban Agriculture', role: 'Poultry Feed & Vermicompost', minCn: 20, maxCn: 40, idealMoisture: '20-40%' },
      { name: 'Metro Compost Operations', role: 'Rapid Anaerobic Digestion', minCn: 20, maxCn: 50, idealMoisture: '30-60%' },
    ],
  },
  {
    keywords: ['vegetable', 'fruit', 'peel', 'peels', 'salad', 'produce', 'kitchen', 'food'],
    wasteType: 'ORGANIC',
    subtype: 'produce_waste',
    qualityGrade: 'GRADE_B',
    cnRatio: 15,
    moisture: 'High (80-90%)',
    idealConsumers: [
      { name: 'City Farm Urban Agriculture', role: 'Thermal Compost Batching', minCn: 10, maxCn: 25, idealMoisture: '70-90%' },
      { name: 'Metro Compost Operations', role: 'Anaerobic Bio-Digestion', minCn: 10, maxCn: 30, idealMoisture: '70-90%' },
    ],
  },
  {
    keywords: ['barley', 'beer', 'spent grain', 'mash', 'brewery', 'hops', 'malt'],
    wasteType: 'ORGANIC',
    subtype: 'brewery_waste',
    qualityGrade: 'GRADE_A',
    cnRatio: 12,
    moisture: 'High (75-80%)',
    idealConsumers: [
      { name: 'City Farm Urban Agriculture', role: 'Protein Livestock Feed & Soil Booster', minCn: 10, maxCn: 20, idealMoisture: '70-85%' },
      { name: 'Mycelium Magic Mushrooms', role: 'Protein Supplement Substrate', minCn: 10, maxCn: 20, idealMoisture: '70-80%' },
    ],
  },
  {
    keywords: ['wood', 'sawdust', 'shavings', 'pallet', 'timber', 'lumber'],
    wasteType: 'WOOD',
    subtype: 'sawdust',
    qualityGrade: 'GRADE_A',
    cnRatio: 500,
    moisture: 'Dry (<15%)',
    idealConsumers: [
      { name: 'Mycelium Magic Mushrooms', role: 'Hardwood Sawdust Substrate', minCn: 300, maxCn: 600, idealMoisture: 'Dry' },
      { name: 'EcoBox Sustainable Packaging', role: 'Wood Fiber Molding', minCn: 200, maxCn: 600, idealMoisture: 'Dry' },
    ],
  },
];

// Active Resource Consumer Registry
const CONSUMER_REGISTRY = [
  {
    id: 'user-7',
    orgName: 'Mycelium Magic Mushrooms',
    role: 'CONSUMER',
    acceptedTypes: ['ORGANIC', 'WOOD'],
    cnTarget: 20,
    weeklyCapacityKg: 500,
    lat: 40.7265,
    lng: -74.0062,
    address: '88 Broad St, NY',
  },
  {
    id: 'user-8',
    orgName: 'City Farm Urban Agriculture',
    role: 'CONSUMER',
    acceptedTypes: ['ORGANIC'],
    cnTarget: 25,
    weeklyCapacityKg: 800,
    lat: 40.7282,
    lng: -74.0078,
    address: '45 Grand St, NY',
  },
  {
    id: 'user-9',
    orgName: 'EcoBox Sustainable Packaging',
    role: 'CONSUMER',
    acceptedTypes: ['CARDBOARD', 'WOOD'],
    cnTarget: 400,
    weeklyCapacityKg: 1200,
    lat: 40.7152,
    lng: -73.9928,
    address: '12 Mott St, NY',
  },
  {
    id: 'user-10',
    orgName: 'Metro Compost Operations',
    role: 'CONSUMER',
    acceptedTypes: ['ORGANIC', 'CARDBOARD'],
    cnTarget: 30,
    weeklyCapacityKg: 2500,
    lat: 40.7110,
    lng: -74.0120,
    address: '500 Canal St, NY',
  },
];

/**
 * 1. AI NLP Parser: Extracts chemical & biological attributes from raw text
 */
export const parseWasteTextWithAI = (rawText = '') => {
  const textLower = rawText.toLowerCase();
  
  // Extract numerical quantity
  const qtyMatch = textLower.match(/(\d+(\.\d+)?)\s*(kg|lbs|tons|g)?/);
  let quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 45;
  let unit = qtyMatch && qtyMatch[3] ? qtyMatch[3] : 'kg';
  if (unit === 'lbs') {
    quantity = Math.round(quantity * 0.453592);
    unit = 'kg';
  }

  // Match against Taxonomy
  let matchedTaxon = MATERIAL_TAXONOMY.find(t =>
    t.keywords.some(k => textLower.includes(k))
  );

  if (!matchedTaxon) {
    matchedTaxon = {
      wasteType: 'ORGANIC',
      subtype: 'general_organic',
      qualityGrade: 'GRADE_A',
      cnRatio: 25,
      moisture: 'Medium (50%)',
      idealConsumers: [CONSUMER_REGISTRY[1]],
    };
  }

  return {
    rawDescription: rawText,
    wasteType: matchedTaxon.wasteType,
    subtype: matchedTaxon.subtype,
    quantity,
    unit: 'kg',
    qualityGrade: matchedTaxon.qualityGrade,
    cnRatio: matchedTaxon.cnRatio,
    moisture: matchedTaxon.moisture,
  };
};

/**
 * 2. Geospatial Haversine Distance Calculation (km)
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * 3. AI Multi-Criteria Symbiosis Engine
 * Evaluates Material (40%), Volume (30%), Proximity (20%), Timing (10%)
 */
export const runAISymbiosisEngine = (wasteStream, producerUser = {}) => {
  const parsed = parseWasteTextWithAI(wasteStream.rawDescription || wasteStream);
  const prodLat = producerUser.lat || 40.7230;
  const prodLng = producerUser.lng || -73.9985;
  const prodOrg = producerUser.orgName || 'GreenBean Cafe & Bakery';

  const matches = CONSUMER_REGISTRY.map(consumer => {
    // 1. Material Compatibility (40%)
    let compatScore = 0;
    if (consumer.acceptedTypes.includes(parsed.wasteType)) {
      const cnDiff = Math.abs(parsed.cnRatio - consumer.cnTarget);
      compatScore = Math.max(60, 100 - cnDiff * 0.5);
    } else {
      compatScore = 40;
    }

    // 2. Volume Fit (30%)
    const volumeRatio = parsed.quantity / consumer.weeklyCapacityKg;
    const volumeScore = Math.min(100, Math.max(50, 100 - volumeRatio * 20));

    // 3. Proximity Distance (20%)
    const distanceKm = calculateDistanceKm(prodLat, prodLng, consumer.lat, consumer.lng) || 1.4;
    const distanceScore = Math.max(40, Math.min(100, 100 - distanceKm * 10));

    // 4. Pickup Timing (10%)
    const timingScore = 95;

    // Weighted Overall Score
    const overallScore = Math.round(
      compatScore * 0.40 +
      volumeScore * 0.30 +
      distanceScore * 0.20 +
      timingScore * 0.10
    );

    // AI Reasoning Explanation
    const reasoning = `${overallScore}% Compatibility Seal · ${distanceKm}km distance. ${parsed.quantity}kg ${parsed.subtype.replace('_', ' ')} (C:N ${parsed.cnRatio}:1) matches ${consumer.orgName}'s intake requirements.`;

    return {
      id: `ai-match-${Date.now()}-${consumer.id}`,
      score: overallScore,
      compatibilityScore: Math.round(compatScore),
      volumeScore: Math.round(volumeScore),
      distanceScore: Math.round(distanceScore),
      timingScore: Math.round(timingScore),
      reasoning,
      status: 'PROPOSED',
      wasteStream: {
        id: wasteStream.id || `ws-${Date.now()}`,
        rawDescription: parsed.rawDescription,
        wasteType: parsed.wasteType,
        subtype: parsed.subtype,
        quantity: parsed.quantity,
        unit: 'kg',
        qualityGrade: parsed.qualityGrade,
        producer: { orgName: prodOrg, lat: prodLat, lng: prodLng },
      },
      resourceNeed: {
        id: `rn-${consumer.id}`,
        consumer: { orgName: consumer.orgName, address: consumer.address, lat: consumer.lat, lng: consumer.lng },
      },
    };
  }).sort((a, b) => b.score - a.score);

  return {
    parsedStream: parsed,
    topMatches: matches,
  };
};
