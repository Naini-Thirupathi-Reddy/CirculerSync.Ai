import { SEED_PICKUP_JOBS, SEED_MATCHES, SEED_WASTE_STREAMS, SEED_RESOURCE_NEEDS, SEED_USERS, SEED_IMPACT_LOGS } from '../utils/mockStore.js';
import { optimizePickupRoutes } from '../services/routing.service.js';
import { calculateImpactForMatch } from '../services/impact.service.js';

let pickupJobs = [...SEED_PICKUP_JOBS];
let impactLogs = [...SEED_IMPACT_LOGS];

function enrichJob(job) {
  const match = SEED_MATCHES.find(m => m.id === job.matchId) || job.match;
  const wasteStream = SEED_WASTE_STREAMS.find(w => w.id === match?.wasteStreamId) || match?.wasteStream;
  const producer = SEED_USERS.find(u => u.id === wasteStream?.producerId) || wasteStream?.producer;

  const resourceNeed = SEED_RESOURCE_NEEDS.find(r => r.id === match?.resourceNeedId) || match?.resourceNeed;
  const consumer = SEED_USERS.find(u => u.id === resourceNeed?.consumerId) || resourceNeed?.consumer;

  const driver = SEED_USERS.find(u => u.id === job.driverId) || job.driver;

  return {
    ...job,
    driver,
    match: {
      ...match,
      wasteStream: { ...wasteStream, producer },
      resourceNeed: { ...resourceNeed, consumer },
    },
  };
}

export const getPickupJobs = async (req, res) => {
  try {
    const enriched = pickupJobs.map(enrichJob);
    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, PICKED_UP, DELIVERED

    const job = pickupJobs.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ error: 'Pickup job not found' });
    }

    job.status = status;

    // If job delivered, create or update ImpactLog automatically
    let createdImpact = null;
    if (status === 'DELIVERED') {
      const enrichedJob = enrichJob(job);
      const impactData = calculateImpactForMatch(enrichedJob.match);

      createdImpact = {
        id: `imp-${Date.now()}`,
        matchId: job.matchId,
        match: enrichedJob.match,
        co2SavedKg: impactData.co2SavedKg,
        waterSavedL: impactData.waterSavedL,
        landfillDivertedKg: impactData.landfillDivertedKg,
        producerSavings: impactData.producerSavings,
        consumerSavings: impactData.consumerSavings,
        createdAt: new Date().toISOString(),
      };

      impactLogs.unshift(createdImpact);
    }

    return res.json({
      job: enrichJob(job),
      impactLog: createdImpact,
      message: `Pickup job status updated to ${status}`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getOptimizedRoute = async (req, res) => {
  try {
    const enrichedJobs = pickupJobs.map(enrichJob).filter(j => j.status !== 'DELIVERED');
    const optimized = optimizePickupRoutes(enrichedJobs);
    return res.json({
      date: req.params.date || new Date().toISOString().split('T')[0],
      totalStops: optimized.length,
      stops: optimized,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
