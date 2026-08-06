import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/matchmaker/MatchCard';
import { ReasoningDrawer } from '../components/layout/ReasoningDrawer';
import { Sparkles } from 'lucide-react';
import api from '../services/api';

const DEFAULT_MATCHES = [
  {
    id: 'match-1',
    score: 94.5,
    compatibilityScore: 100,
    volumeScore: 95,
    distanceScore: 90,
    timingScore: 90,
    reasoning: '94.5% compatibility seal · 1.4km distance, 45kg nitrogen-rich coffee grounds directly matches mushroom substrate demand.',
    status: 'PROPOSED',
    wasteStream: {
      id: 'ws-1',
      rawDescription: '45kg fresh espresso coffee grounds, clean single-origin arabica substrate',
      wasteType: 'ORGANIC',
      quantity: 45.0,
      unit: 'kg',
      producer: { orgName: 'GreenBean Cafe & Bakery', lat: 40.7230, lng: -73.9985 },
    },
    resourceNeed: {
      consumer: { orgName: 'Mycelium Magic Mushrooms', lat: 40.7265, lng: -74.0062 },
    },
  },
  {
    id: 'match-2',
    score: 91.0,
    compatibilityScore: 100,
    volumeScore: 90,
    distanceScore: 85,
    timingScore: 90,
    reasoning: '91.0% compatibility seal · 1.8km distance, 60kg volume fits urban farm soil amendment window.',
    status: 'PROPOSED',
    wasteStream: {
      id: 'ws-2',
      rawDescription: '60kg spent coffee chaff and espresso grounds',
      wasteType: 'ORGANIC',
      quantity: 60.0,
      unit: 'kg',
      producer: { orgName: 'Roasters Choice Coffee', lat: 40.7242, lng: -73.9968 },
    },
    resourceNeed: {
      consumer: { orgName: 'City Farm Urban Agriculture', lat: 40.7282, lng: -74.0078 },
    },
  },
  {
    id: 'match-3',
    score: 96.0,
    compatibilityScore: 100,
    volumeScore: 98,
    distanceScore: 92,
    timingScore: 95,
    reasoning: '96.0% compatibility seal · 2.1km distance, 85kg clean corrugated cardboard ready for eco-packaging re-pulping.',
    status: 'ACCEPTED',
    wasteStream: {
      id: 'ws-3',
      rawDescription: '85kg clean corrugated cardboard boxes',
      wasteType: 'CARDBOARD',
      quantity: 85.0,
      unit: 'kg',
      producer: { orgName: 'Craft Harvest Bistro', lat: 40.7208, lng: -74.0042 },
    },
    resourceNeed: {
      consumer: { orgName: 'EcoBox Sustainable Packaging', lat: 40.7152, lng: -73.9928 },
    },
  },
];

export const MatchesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const wasteId = searchParams.get('wasteId');

  const [matches, setMatches] = useState(DEFAULT_MATCHES);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchMatches = async () => {
    try {
      const url = wasteId ? `/matches?wasteId=${wasteId}` : '/matches/my';
      const res = await api.get(url);
      if (res.data && res.data.length > 0) {
        setMatches(res.data);
      }
    } catch (err) {
      console.warn('Using client fallback matches');
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [wasteId, user]);

  const handleOpenReasoning = (match) => {
    setSelectedMatch(match);
    setShowDrawer(true);
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      await api.post(`/matches/${matchId}/accept`);
    } catch (err) {
      console.warn(err);
    }
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'ACCEPTED' } : m));
    setToastMessage('Pickup requested');
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification per Voice Guideline */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-loam/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
          AI Symbiosis Matchmaker
        </h1>
        <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
          Weighted multi-criteria matching engine for waste producers & consumers
        </p>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-mycelium/40 animate-pulse rounded-lg border border-loam/10" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-loam/20 rounded-xl space-y-3 bg-mycelium/30">
          <Sparkles className="w-10 h-10 text-loam/40 mx-auto" />
          <h3 className="font-display font-bold text-lg text-loam">No matches yet</h3>
          <p className="text-xs font-mono text-loam/70 max-w-sm mx-auto">
            No matches found for your current criteria. Log new waste streams or expand intake windows to start matching.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              onOpenReasoning={handleOpenReasoning}
              onAcceptMatch={handleAcceptMatch}
            />
          ))}
        </div>
      )}

      {/* Reasoning Drawer */}
      <ReasoningDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        matchData={selectedMatch}
      />

    </div>
  );
};
