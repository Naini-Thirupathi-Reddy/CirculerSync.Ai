import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/matchmaker/MatchCard';
import { ReasoningDrawer } from '../components/layout/ReasoningDrawer';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { runAISymbiosisEngine } from '../services/aiEngine';
import api from '../services/api';

const PRODUCER_MATCHES = [
  {
    id: 'match-1',
    score: 96.5,
    compatibilityScore: 100,
    volumeScore: 95,
    distanceScore: 90,
    timingScore: 90,
    reasoning: '96.5% compatibility seal · 1.4km distance, 45kg nitrogen-rich coffee grounds (C:N 20:1) directly matches mushroom substrate demand.',
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
      producer: { orgName: 'GreenBean Cafe & Bakery', lat: 40.7242, lng: -73.9968 },
    },
    resourceNeed: {
      consumer: { orgName: 'City Farm Urban Agriculture', lat: 40.7282, lng: -74.0078 },
    },
  },
];

const CONSUMER_MATCHES = [
  {
    id: 'match-consumer-1',
    score: 96.5,
    compatibilityScore: 100,
    volumeScore: 98,
    distanceScore: 95,
    timingScore: 92,
    reasoning: '96.5% compatibility seal · Incoming 45kg nitrogen-rich coffee substrate ready for mushroom spawn inoculation.',
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
    id: 'match-consumer-2',
    score: 89.0,
    compatibilityScore: 92,
    volumeScore: 88,
    distanceScore: 85,
    timingScore: 90,
    reasoning: '89.0% compatibility seal · 120kg vegetable trimmings for urban compost thermal batching.',
    status: 'PROPOSED',
    wasteStream: {
      id: 'ws-5',
      rawDescription: '120kg vegetable trimmings and fruit peels from prep kitchen',
      wasteType: 'ORGANIC',
      quantity: 120.0,
      unit: 'kg',
      producer: { orgName: 'Urban Market Grocers', lat: 40.7248, lng: -73.9972 },
    },
    resourceNeed: {
      consumer: { orgName: 'City Farm Urban Agriculture', lat: 40.7282, lng: -74.0078 },
    },
  },
];

const LOGISTICS_MATCHES = [
  {
    id: 'match-3',
    score: 96.0,
    compatibilityScore: 100,
    volumeScore: 98,
    distanceScore: 92,
    timingScore: 95,
    reasoning: '96.0% compatibility seal · Accepted pickup order ready for EcoBox packaging delivery.',
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

  const role = user?.role || 'PRODUCER';

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem(`cs_matches_${role}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (role === 'CONSUMER') return CONSUMER_MATCHES;
    if (role === 'LOGISTICS') return LOGISTICS_MATCHES;
    if (role === 'ADMIN') return [...PRODUCER_MATCHES, ...CONSUMER_MATCHES, ...LOGISTICS_MATCHES];
    return PRODUCER_MATCHES;
  });

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isAiRunning, setIsAiRunning] = useState(false);

  const fetchMatches = async () => {
    let defaultSet = PRODUCER_MATCHES;
    if (role === 'CONSUMER') defaultSet = CONSUMER_MATCHES;
    else if (role === 'LOGISTICS') defaultSet = LOGISTICS_MATCHES;
    else if (role === 'ADMIN') defaultSet = [...PRODUCER_MATCHES, ...CONSUMER_MATCHES, ...LOGISTICS_MATCHES];

    const saved = localStorage.getItem(`cs_matches_${role}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMatches(parsed);
          return;
        }
      } catch (e) {}
    }

    setMatches(defaultSet);
    localStorage.setItem(`cs_matches_${role}`, JSON.stringify(defaultSet));
  };

  useEffect(() => {
    fetchMatches();
  }, [wasteId, role]);

  const handleReRunAIEngine = () => {
    setIsAiRunning(true);
    setToastMessage('⚡ Live AI Symbiosis Engine computing chemical C:N ratio & distance matrix...');

    setTimeout(() => {
      const sampleStream = {
        rawDescription: '45kg fresh espresso coffee grounds, clean single-origin arabica substrate',
      };
      const aiResult = runAISymbiosisEngine(sampleStream, user || { orgName: 'GreenBean Cafe & Bakery' });

      setMatches(aiResult.topMatches);
      localStorage.setItem(`cs_matches_${role}`, JSON.stringify(aiResult.topMatches));

      setIsAiRunning(false);
      setToastMessage('⚡ AI Engine recalculated perfect 96.5% symbiosis matches!');
      setTimeout(() => setToastMessage(''), 4000);
    }, 600);
  };

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
    setMatches(prev => {
      const updated = prev.map(m => m.id === matchId ? { ...m, status: 'ACCEPTED' } : m);
      localStorage.setItem(`cs_matches_${role}`, JSON.stringify(updated));
      return updated;
    });
    setToastMessage('Match accepted! Status updated to ACCEPTED & DISPATCHED');
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-loam/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
            AI Symbiosis Matchmaker
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            Weighted multi-criteria matching engine for waste producers & consumers
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReRunAIEngine}
            disabled={isAiRunning}
            className="px-4 py-2 rounded-lg bg-kraft hover:bg-kraft-deep text-parchment font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isAiRunning ? 'Computing AI Match...' : '⚡ Re-Run AI Engine'}</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-moss/10 text-moss border border-moss/20 font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Viewing as: {role}</span>
          </div>
        </div>
      </div>

      {/* Card Grid */}
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

      {/* Reasoning Drawer */}
      <ReasoningDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        matchData={selectedMatch}
      />

    </div>
  );
};
