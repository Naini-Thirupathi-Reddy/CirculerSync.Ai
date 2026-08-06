export const IMPACT_CONSTANTS = {
  CO2_FACTOR: 0.5,           // kg CO2 saved per kg waste diverted
  WATER_CARDBOARD_FACTOR: 100, // L water saved per kg cardboard recycled
  WATER_ORGANIC_FACTOR: 15,   // L water saved per kg organic composted
  PRODUCER_DISPOSAL_FEE_PER_KG: 0.20, // $ saved by producer per kg
  CONSUMER_SAVINGS_PER_KG: 0.15,      // $ saved by consumer per kg

  BY_WASTE_TYPE: {
    ORGANIC: {
      co2PerKg: 0.5,
      waterPerKg: 15,
      producerSavingsPerKg: 0.20,
      consumerSavingsPerKg: 0.18,
    },
    CARDBOARD: {
      co2PerKg: 0.8,
      waterPerKg: 100,
      producerSavingsPerKg: 0.15,
      consumerSavingsPerKg: 0.12,
    },
    PLASTIC: {
      co2PerKg: 1.2,
      waterPerKg: 50,
      producerSavingsPerKg: 0.25,
      consumerSavingsPerKg: 0.20,
    },
    TEXTILE: {
      co2PerKg: 1.5,
      waterPerKg: 200,
      producerSavingsPerKg: 0.30,
      consumerSavingsPerKg: 0.25,
    },
    OTHER: {
      co2PerKg: 0.4,
      waterPerKg: 10,
      producerSavingsPerKg: 0.15,
      consumerSavingsPerKg: 0.10,
    },
  },
};

export const NLP_KEYWORD_TAXONOMY = {
  "coffee grounds": { type: "ORGANIC", subtype: "nitrogen_rich", compatible: ["compost", "mushroom_substrate", "soil_amendment"] },
  "spent grain": { type: "ORGANIC", subtype: "brewery_waste", compatible: ["animal_feed", "compost", "bakery_substrate"] },
  "food scraps": { type: "ORGANIC", subtype: "mixed_food", compatible: ["compost", "biogas"] },
  "vegetable peelings": { type: "ORGANIC", subtype: "produce_waste", compatible: ["compost", "animal_feed", "vermicompost"] },
  "cardboard boxes": { type: "CARDBOARD", subtype: "corrugated", compatible: ["packaging", "mulch", "sheet_mulch"] },
  "cardboard": { type: "CARDBOARD", subtype: "mixed_paper", compatible: ["packaging", "recycling", "mulch"] },
  "burlap sacks": { type: "TEXTILE", subtype: "jute_fiber", compatible: ["garden_lining", "weed_barrier", "crafts"] },
  "wood shavings": { type: "ORGANIC", subtype: "carbon_rich", compatible: ["mushroom_substrate", "animal_bedding", "compost"] },
  "sawdust": { type: "ORGANIC", subtype: "carbon_rich", compatible: ["mushroom_substrate", "compost", "mulch"] },
  "fruit waste": { type: "ORGANIC", subtype: "sugar_rich", compatible: ["compost", "biogas", "fermentation"] },
};
