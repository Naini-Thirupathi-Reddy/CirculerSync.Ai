import React, { useState, useEffect } from 'react';
import { CommunityNetworkVisualizer } from '../components/network/CommunityNetworkVisualizer';
import { Card } from '../components/ui/Card';
import { Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';

const DEFAULT_MEMBERS = [
  { id: 'user-1', orgName: 'GreenBean Cafe & Bakery', role: 'PRODUCER', address: '142 Mercer St, NY' },
  { id: 'user-2', orgName: 'Roasters Choice Coffee', role: 'PRODUCER', address: '202 Lafayette St, NY' },
  { id: 'user-3', orgName: 'Craft Harvest Bistro', role: 'PRODUCER', address: '55 Spring St, NY' },
  { id: 'user-4', orgName: 'Artisan Bakery Co', role: 'PRODUCER', address: '88 Prince St, NY' },
  { id: 'user-5', orgName: 'Urban Market Grocers', role: 'PRODUCER', address: '310 Broome St, NY' },
  { id: 'user-6', orgName: 'EcoBrew Microbrewery', role: 'PRODUCER', address: '180 Mott St, NY' },
  { id: 'user-7', orgName: 'Mycelium Magic Mushrooms', role: 'CONSUMER', address: '88 Broad St, NY' },
  { id: 'user-8', orgName: 'City Farm Urban Agriculture', role: 'CONSUMER', address: '45 Grand St, NY' },
  { id: 'user-9', orgName: 'EcoBox Sustainable Packaging', role: 'CONSUMER', address: '12 Mott St, NY' },
  { id: 'user-10', orgName: 'Metro Compost Operations', role: 'CONSUMER', address: '500 Canal St, NY' },
  { id: 'user-11', orgName: 'Swift Eco Logistics', role: 'LOGISTICS', address: '75 Hudson St, NY' },
];

const DEFAULT_FLOWS = [
  { id: 'flow-1', source: 'user-1', target: 'user-7', materialType: 'ORGANIC', volumeKg: 45 },
  { id: 'flow-2', source: 'user-2', target: 'user-8', materialType: 'ORGANIC', volumeKg: 60 },
  { id: 'flow-3', source: 'user-3', target: 'user-9', materialType: 'CARDBOARD', volumeKg: 85 },
  { id: 'flow-4', source: 'user-4', target: 'user-8', materialType: 'ORGANIC', volumeKg: 30 },
  { id: 'flow-5', source: 'user-5', target: 'user-10', materialType: 'ORGANIC', volumeKg: 120 },
  { id: 'flow-6', source: 'user-6', target: 'user-8', materialType: 'ORGANIC', volumeKg: 150 },
];

const DEFAULT_GAPS = [
  { id: 'gap-1', producerId: 'user-2', consumerId: 'user-7', producerOrg: 'Roasters Choice Coffee', consumerOrg: 'Mycelium Magic Mushrooms', potentialMaterial: 'Coffee Chaff Substrate', distanceKm: 1.2 },
  { id: 'gap-2', producerId: 'user-4', consumerId: 'user-10', producerOrg: 'Artisan Bakery Co', consumerOrg: 'Metro Compost Operations', potentialMaterial: 'Flour Sweepings', distanceKm: 0.9 },
  { id: 'gap-3', producerId: 'user-6', consumerId: 'user-7', producerOrg: 'EcoBrew Microbrewery', consumerOrg: 'Mycelium Magic Mushrooms', potentialMaterial: 'Spent Barley Substrate', distanceKm: 1.5 },
];

export const CommunityNetworkPage = () => {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [flows, setFlows] = useState(DEFAULT_FLOWS);
  const [gaps, setGaps] = useState(DEFAULT_GAPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/network/members'),
      api.get('/network/flows'),
      api.get('/network/gaps'),
    ])
      .then(([mRes, fRes, gRes]) => {
        if (mRes.data && mRes.data.length > 0) setMembers(mRes.data);
        if (fRes.data && fRes.data.length > 0) setFlows(fRes.data);
        if (gRes.data && gRes.data.length > 0) setGaps(gRes.data);
      })
      .catch(err => console.warn('Using client fallback network data'));
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
      <CommunityNetworkVisualizer
        members={members}
        flows={flows}
        gaps={gaps}
      />

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
