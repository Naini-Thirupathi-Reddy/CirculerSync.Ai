import { getOpenMeteoForecast } from './weather.service.js';

/**
 * Generate 7-day predictive waste forecast using 4-week SMA, weekend/holiday multipliers, and Open-Meteo rain signal
 */
export async function generateWasteForecast(wasteStream, historicalLogs = []) {
  const baseQuantity = wasteStream.quantity || 30.0;
  
  // Calculate 4-week SMA (Simple Moving Average)
  let smaBase = baseQuantity;
  if (historicalLogs && historicalLogs.length > 0) {
    const sum = historicalLogs.reduce((acc, log) => acc + log.quantity, 0);
    smaBase = sum / historicalLogs.length;
  }

  // Get lat/lng of producer or default NYC coordinates
  const lat = wasteStream.producer?.lat || 40.7128;
  const lng = wasteStream.producer?.lng || -74.0060;

  const weatherForecast = await getOpenMeteoForecast(lat, lng);
  const today = new Date();

  const forecastDays = weatherForecast.slice(0, 7).map((weatherItem, idx) => {
    const forecastDate = new Date(today);
    forecastDate.setDate(forecastDate.getDate() + idx);

    const dayOfWeek = forecastDate.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Multipliers
    const weekendMultiplier = isWeekend ? 1.3 : 1.0;
    const rainMultiplier = weatherItem.isRainy ? 0.7 : 1.0;
    const seasonalityFactor = Math.sin((idx / 7) * Math.PI) * 0.1 + 1.0;

    const predictedKg = Math.round(smaBase * weekendMultiplier * rainMultiplier * seasonalityFactor * 10) / 10;

    return {
      forDate: forecastDate.toISOString().split('T')[0],
      predictedKg,
      factors: {
        smaBaseKg: smaBase,
        isWeekend,
        weekendMultiplier,
        isRainy: weatherItem.isRainy,
        rainSumMm: weatherItem.rainSumMm,
        rainMultiplier,
        seasonalityFactor: Math.round(seasonalityFactor * 100) / 100,
        explanation: `SMA Base ${smaBase}kg × ${isWeekend ? 'Weekend (1.3)' : 'Weekday (1.0)'} × ${weatherItem.isRainy ? 'Rain Signal (0.7)' : 'Clear Signal (1.0)'}`,
      },
    };
  });

  return forecastDays;
}
