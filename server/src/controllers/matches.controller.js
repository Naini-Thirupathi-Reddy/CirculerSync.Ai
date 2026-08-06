import { SEED_MATCHES, SEED_WASTE_STREAMS, SEED_RESOURCE_NEEDS, SEED_USERS, SEED_PICKUP_JOBS } from '../utils/mockStore.js';
import { calculateMatchScore } from '../services/matching.service.js';

let matches = [...SEED_MATCHES];
let pickupJobs = [...SEED_PICKUP_JOBS];

export const getMatches = async (req, res) => {
  try {
    const { wasteId } = req.query;
    let list = matches;

    if (wasteId) {
      list = matches.filter(m => m.wasteStreamId === wasteId);
    }

    const enriched = list.map(m => {
      const wasteStream = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId) || m.wasteStream;
      const producer = SEED_USERS.find(u => u.id === wasteStream?.producerId) || wasteStream?.producer;

      const resourceNeed = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId) || m.resourceNeed;
      const consumer = SEED_USERS.find(u => u.id === resourceNeed?.consumerId) || resourceNeed?.consumer;

      return {
        ...m,
        wasteStream: { ...wasteStream, producer },
        resourceNeed: { ...resourceNeed, consumer },
      };
    }).sort((a, b) => b.score - a.score);

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyMatches = async (req, res) => {
  try {
    const { id, role } = req.user;

    const enriched = matches.map(m => {
      const wasteStream = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId) || m.wasteStream;
      const producer = SEED_USERS.find(u => u.id === wasteStream?.producerId);

      const resourceNeed = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId) || m.resourceNeed;
      const consumer = SEED_USERS.find(u => u.id === resourceNeed?.consumerId);

      return {
        ...m,
        wasteStream: { ...wasteStream, producer },
        resourceNeed: { ...resourceNeed, consumer },
      };
    }).filter(m => {
      if (role === 'PRODUCER') return m.wasteStream?.producerId === id;
      if (role === 'CONSUMER') return m.resourceNeed?.consumerId === id;
      return true;
    }).sort((a, b) => b.score - a.score);

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const acceptMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = matches.find(m => m.id === id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.status = 'ACCEPTED';

    // Create PickupJob upon accepting match
    const driverUser = SEED_USERS.find(u => u.role === 'LOGISTICS');

    const newJob = {
      id: `job-${Date.now()}`,
      matchId: match.id,
      match: match,
      driverId: driverUser ? driverUser.id : 'driver-1',
      driver: driverUser,
      status: 'PENDING',
      scheduledDate: new Date(Date.now() + 3600000 * 4).toISOString(),
      routeOrder: pickupJobs.length + 1,
      estimatedTime: new Date(Date.now() + 3600000 * 5).toISOString(),
      createdAt: new Date().toISOString(),
    };

    pickupJobs.push(newJob);

    return res.json({
      match,
      pickupJob: newJob,
      message: 'Match accepted! Logistics pickup job created and dispatched.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
