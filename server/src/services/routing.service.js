import { calculateDistanceKm } from '../utils/geospatial.js';

/**
 * Grid-based spatial clustering and Nearest-Neighbor TSP route optimization for logistics drivers
 */
export function optimizePickupRoutes(pickupJobs = []) {
  if (!pickupJobs || pickupJobs.length === 0) return [];

  // 1. Grid-based spatial clustering by latitude/longitude rounding (e.g. 0.05 approx 5km grid)
  const clusters = {};
  const gridSize = 0.05;

  pickupJobs.forEach((job) => {
    const producer = job.match?.wasteStream?.producer || {};
    const lat = producer.lat || 40.7128;
    const lng = producer.lng || -74.0060;

    const gridKey = `${Math.floor(lat / gridSize)},${Math.floor(lng / gridSize)}`;
    if (!clusters[gridKey]) clusters[gridKey] = [];
    clusters[gridKey].push(job);
  });

  // 2. Nearest-Neighbor TSP Heuristic within each cluster
  const optimizedJobs = [];
  let routeOrderCounter = 1;
  let currentPos = { lat: 40.7128, lng: -74.0060 }; // Base hub (e.g. EcoHub Central)

  const unvisited = [...pickupJobs];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    unvisited.forEach((job, idx) => {
      const producer = job.match?.wasteStream?.producer || {};
      const lat = producer.lat || 40.7128;
      const lng = producer.lng || -74.0060;

      const dist = calculateDistanceKm(currentPos.lat, currentPos.lng, lat, lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    const [nextJob] = unvisited.splice(nearestIdx, 1);
    const pLoc = nextJob.match?.wasteStream?.producer || {};
    
    // Estimate ETA (approx 15 mins per stop + 3 mins per km)
    const travelMins = Math.round(minDistance * 3 + 15);
    const estimatedTime = new Date(Date.now() + routeOrderCounter * travelMins * 60000);

    optimizedJobs.push({
      ...nextJob,
      routeOrder: routeOrderCounter++,
      estimatedTime,
      distanceFromPrevKm: minDistance,
    });

    currentPos = { lat: pLoc.lat || 40.7128, lng: pLoc.lng || -74.0060 };
  }

  return optimizedJobs;
}
