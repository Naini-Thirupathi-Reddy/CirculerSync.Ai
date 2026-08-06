import { SEED_MATCHES, SEED_WASTE_STREAMS, SEED_RESOURCE_NEEDS, SEED_USERS, SEED_PICKUP_JOBS } from '../utils/mockStore.js';

let matches = [...SEED_MATCHES];
let pickupJobs = [...SEED_PICKUP_JOBS];

export const getMatches = async (req, res) => {
  try {
    const { wasteId } = req.query;
    const { role, id } = req.user || {};

    let list = matches;
    if (wasteId) {
      list = matches.filter(m => m.wasteStreamId === wasteId);
    } else if (role === 'PRODUCER') {
      list = matches.filter(m => {
        const ws = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId);
        return ws?.producerId === id || m.wasteStreamId === 'ws-1' || m.wasteStreamId === 'ws-2';
      });
    } else if (role === 'CONSUMER') {
      list = matches.filter(m => {
        const rn = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId);
        return rn?.consumerId === id || m.resourceNeedId === 'rn-1' || m.resourceNeedId === 'rn-2';
      });
    }

    const enriched = list.map(m => {
      const wasteStream = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId) || m.wasteStream || SEED_WASTE_STREAMS[0];
      const producer = SEED_USERS.find(u => u.id === wasteStream?.producerId) || wasteStream?.producer || SEED_USERS[0];

      const resourceNeed = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId) || m.resourceNeed || SEED_RESOURCE_NEEDS[0];
      const consumer = SEED_USERS.find(u => u.id === resourceNeed?.consumerId) || resourceNeed?.consumer || SEED_USERS[8];

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
    const { id, role } = req.user || {};

    let list = matches;
    if (role === 'PRODUCER') {
      list = matches.filter(m => m.wasteStreamId === 'ws-1' || m.wasteStreamId === 'ws-2' || m.wasteStreamId === 'ws-3');
    } else if (role === 'CONSUMER') {
      list = matches.filter(m => m.resourceNeedId === 'rn-1' || m.resourceNeedId === 'rn-2' || m.resourceNeedId === 'rn-3');
    }

    const enriched = list.map(m => {
      const wasteStream = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId) || m.wasteStream || SEED_WASTE_STREAMS[0];
      const producer = SEED_USERS.find(u => u.id === wasteStream?.producerId) || SEED_USERS[0];

      const resourceNeed = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId) || m.resourceNeed || SEED_RESOURCE_NEEDS[0];
      const consumer = SEED_USERS.find(u => u.id === resourceNeed?.consumerId) || SEED_USERS[8];

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

export const acceptMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = matches.find(m => m.id === id) || matches[0];

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.status = 'ACCEPTED';

    const driverUser = SEED_USERS.find(u => u.role === 'LOGISTICS') || SEED_USERS[14];

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
