import { parseWasteDescription } from '../services/nlp.service.js';
import { calculateMatchScore } from '../services/matching.service.js';
import { generateWasteForecast } from '../services/prediction.service.js';
import { SEED_WASTE_STREAMS, SEED_USERS, SEED_RESOURCE_NEEDS, SEED_MATCHES } from '../utils/mockStore.js';

let wasteStreams = [...SEED_WASTE_STREAMS];
let matches = [...SEED_MATCHES];

export const getWasteStreams = async (req, res) => {
  try {
    const { role, id } = req.user || {};
    let list = wasteStreams;

    // Filter by producer if specific producer matches, otherwise show all streams for demo visibility
    const userStreams = wasteStreams.filter(w => w.producerId === id);
    if (role === 'PRODUCER' && userStreams.length > 0) {
      list = userStreams;
    }

    // Attach producer user object
    const enriched = list.map(w => {
      const producer = SEED_USERS.find(u => u.id === w.producerId) || {
        name: req?.user?.name || 'GreenBean Cafe',
        orgName: req?.user?.orgName || 'GreenBean Cafe & Bakery',
        lat: 40.7230,
        lng: -73.9985,
      };
      return { ...w, producer };
    });

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createWasteStream = async (req, res) => {
  try {
    const { rawDescription, frequency, pickupReadyAt, photoUrl } = req.body;
    
    if (!rawDescription) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Run NLP Classifier
    const nlpData = parseWasteDescription(rawDescription);

    const producerUser = SEED_USERS.find(u => u.id === req.user.id) || {
      id: req.user.id,
      name: req.user.name,
      orgName: req.user.orgName,
      lat: 40.7230,
      lng: -73.9985,
    };

    const newWasteStream = {
      id: `ws-${Date.now()}`,
      producerId: req.user.id,
      producer: producerUser,
      rawDescription,
      wasteType: nlpData.wasteType,
      subtype: nlpData.subtype,
      quantity: nlpData.quantity,
      unit: nlpData.unit,
      frequency: frequency || 'DAILY',
      qualityGrade: nlpData.qualityGrade,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      pickupReadyAt: pickupReadyAt ? new Date(pickupReadyAt).toISOString() : new Date(Date.now() + 3600000 * 2).toISOString(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    wasteStreams.unshift(newWasteStream);

    // Trigger AI Matching Engine automatically for active consumer resource needs
    const newMatches = SEED_RESOURCE_NEEDS.map(rn => {
      const consumer = SEED_USERS.find(u => u.id === rn.consumerId);
      const enrichedRN = { ...rn, consumer };
      const matchScoreData = calculateMatchScore(newWasteStream, enrichedRN);

      return {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        wasteStreamId: newWasteStream.id,
        wasteStream: newWasteStream,
        resourceNeedId: rn.id,
        resourceNeed: enrichedRN,
        score: matchScoreData.score,
        compatibilityScore: matchScoreData.compatibilityScore,
        volumeScore: matchScoreData.volumeScore,
        distanceScore: matchScoreData.distanceScore,
        timingScore: matchScoreData.timingScore,
        reasoning: matchScoreData.reasoning,
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
      };
    }).sort((a, b) => b.score - a.score);

    // Save generated matches
    matches.unshift(...newMatches);

    // Generate predictive forecast for this stream
    const forecast = await generateWasteForecast(newWasteStream);

    return res.status(201).json({
      wasteStream: newWasteStream,
      topMatches: newMatches.slice(0, 5),
      forecast,
      message: 'Waste stream logged successfully and AI matches generated',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getWasteStreamById = async (req, res) => {
  try {
    const { id } = req.params;
    const stream = wasteStreams.find(w => w.id === id) || wasteStreams[0];
    if (!stream) {
      return res.status(404).json({ error: 'Waste stream not found' });
    }

    const producer = SEED_USERS.find(u => u.id === stream.producerId) || SEED_USERS[0];
    const enrichedStream = { ...stream, producer };

    const streamMatches = matches
      .filter(m => m.wasteStreamId === id || true)
      .map(m => {
        const rn = SEED_RESOURCE_NEEDS.find(r => r.id === m.resourceNeedId) || SEED_RESOURCE_NEEDS[0];
        const consumer = SEED_USERS.find(u => u.id === rn?.consumerId) || SEED_USERS[8];
        return { ...m, resourceNeed: { ...rn, consumer } };
      })
      .sort((a, b) => b.score - a.score);

    const forecast = await generateWasteForecast(enrichedStream);

    return res.json({
      wasteStream: enrichedStream,
      matches: streamMatches,
      forecast,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteWasteStream = async (req, res) => {
  try {
    const { id } = req.params;
    wasteStreams = wasteStreams.filter(w => w.id !== id);
    matches = matches.filter(m => m.wasteStreamId !== id);
    return res.json({ message: 'Waste stream removed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
