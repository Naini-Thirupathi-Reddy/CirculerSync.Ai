import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/matchmaker/MatchCard';
import { ReasoningDrawer } from '../components/layout/ReasoningDrawer';
import { Sparkles, Filter, Recycle } from 'lucide-react';
import api from '../services/api';

export const MatchesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const wasteId = searchParams.get('wasteId');

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url = wasteId ? `/matches?wasteId=${wasteId}` : '/matches/my';
      const res = await api.get(url);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      setToastMessage('Pickup requested');
      fetchMatches();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error(err);
    }
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
