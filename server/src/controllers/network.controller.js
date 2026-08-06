import { SEED_USERS, SEED_MATCHES, SEED_WASTE_STREAMS, SEED_RESOURCE_NEEDS } from '../utils/mockStore.js';
import { calculateDistanceKm } from '../utils/geospatial.js';

export const getNetworkMembers = async (req, res) => {
  try {
    const members = SEED_USERS.map(u => ({
      id: u.id,
      name: u.name,
      orgName: u.orgName,
      role: u.role,
      lat: u.lat || 40.7128,
      lng: u.lng || -74.0060,
      address: u.address,
    }));
    return res.json(members);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMaterialFlows = async (req, res) => {
  try {
    // Flow edges derived from matches
    const flows = SEED_MATCHES.map(m => {
      const wasteStream = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId) || {};
      const resourceNeed = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId) || {};

      return {
        id: `flow-${m.id}`,
        source: wasteStream.producerId || 'prod-1',
        target: resourceNeed.consumerId || 'cons-1',
        materialType: wasteStream.wasteType || 'ORGANIC',
        volumeKg: wasteStream.quantity || 30.0,
        matchScore: m.score,
        status: m.status,
      };
    });

    return res.json(flows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSymbiosisGaps = async (req, res) => {
  try {
    // Find un-matched or un-connected compatible pairs
    const producers = SEED_USERS.filter(u => u.role === 'PRODUCER');
    const consumers = SEED_USERS.filter(u => u.role === 'CONSUMER');

    const gaps = [];

    producers.forEach(p => {
      consumers.forEach(c => {
        const dist = calculateDistanceKm(p.lat, p.lng, c.lat, c.lng);
        // If nearby (< 5km) and not currently matched
        if (dist <= 5.0) {
          const hasMatched = SEED_MATCHES.some(m => {
            const ws = SEED_WASTE_STREAMS.find(w => w.id === m.wasteStreamId);
            const rn = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId);
            return ws?.producerId === p.id && rn?.consumerId === c.id;
          });

          if (!hasMatched) {
            gaps.push({
              id: `gap-${p.id}-${c.id}`,
              producerId: p.id,
              producerOrg: p.orgName,
              consumerId: c.id,
              consumerOrg: c.orgName,
              distanceKm: dist,
              potentialMaterial: 'Organic Nitrogen / Spent Grounds',
              potentialCo2SavingsKg: Math.round(dist * 12.5),
            });
          }
        }
      });
    });

    return res.json(gaps.slice(0, 5));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
