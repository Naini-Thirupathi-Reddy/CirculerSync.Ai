import React, { useState, useEffect } from 'react';
import { CommunityNetworkVisualizer } from '../components/network/CommunityNetworkVisualizer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Network, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const CommunityNetworkPage = () => {
  const [members, setMembers] = useState([]);
  const [flows, setFlows] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/network/members'),
      api.get('/network/flows'),
      api.get('/network/gaps'),
    ])
      .then(([mRes, fRes, gRes]) => {
        setMembers(mRes.data);
        setFlows(fRes.data);
        setGaps(gRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="border-b border-loam/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
          Community Network & Symbiosis Visualizer
        </h1>
        <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
          D3 Force-Directed Biological & Technical Material Graph
        </p>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-mycelium rounded-lg border border-loam/10 font-mono text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-moss" />
            <span>Waste Producer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-kraft" />
            <span>Resource Consumer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rust" />
            <span>Logistics Driver</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-loam/70">
          <span>Solid Line = Active Flow</span>
          <span>•</span>
          <span className="text-kraft font-bold">Dashed Line = Symbiosis Gap</span>
        </div>
      </div>

      {/* Full-Bleed D3 Graph */}
      {loading ? (
        <div className="h-[600px] bg-mycelium/40 animate-pulse rounded-xl border border-loam/10" />
      ) : (
        <CommunityNetworkVisualizer
          members={members}
          flows={flows}
          gaps={gaps}
        />
      )}

      {/* Symbiosis Gaps Panel */}
      <Card className="space-y-4 border-l-4 border-l-kraft">
        <div className="flex items-center justify-between pb-2 border-b border-loam/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-kraft" />
            <h3 className="font-display font-bold text-lg text-loam">Identified Symbiosis Gaps</h3>
          </div>
          <span className="font-mono text-xs text-kraft font-bold">
            {gaps.length} Unmatched High-Potential Loops
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gaps.map(gap => (
            <div key={gap.id} className="p-3 bg-parchment/60 rounded border border-loam/10 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between font-bold text-loam">
                <span>{gap.producerOrg}</span>
                <ArrowRight className="w-4 h-4 text-kraft" />
                <span>{gap.consumerOrg}</span>
              </div>
              <div className="flex justify-between text-[11px] text-loam/70 pt-1 border-t border-loam/10">
                <span>Potential: <strong>{gap.potentialMaterial}</strong></span>
                <span className="text-moss">Distance: {gap.distanceKm}km</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
