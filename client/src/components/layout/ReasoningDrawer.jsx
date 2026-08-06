import React from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const ReasoningDrawer = ({ isOpen, onClose, matchData }) => {
  if (!isOpen || !matchData) return null;

  const {
    score = 92.5,
    compatibilityScore = 100,
    volumeScore = 90,
    distanceScore = 85,
    timingScore = 90,
    reasoning = '',
    wasteStream = {},
    resourceNeed = {},
  } = matchData;

  const weights = [
    { label: 'Material Compatibility', weight: '40%', score: compatibilityScore, desc: 'Keyword taxonomy match for biological & technical nutrient loop' },
    { label: 'Volume Capacity Fit', weight: '30%', score: volumeScore, desc: 'Proportional batch size matching consumer minimum intake' },
    { label: 'Proximity Distance', weight: '20%', score: distanceScore, desc: 'Haversine geographical radius score (reduces transport emissions)' },
    { label: 'Pickup Timing Window', weight: '10%', score: timingScore, desc: 'Overlap between producer pickup availability & consumer need' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-loam/40 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-mycelium border-l-2 border-kraft text-loam p-6 overflow-y-auto shadow-2xl flex flex-col font-mono text-sm">
          
          {/* Header styled like a lab notebook */}
          <div className="flex items-center justify-between pb-4 border-b border-loam/20">
            <div className="flex items-center gap-2 text-moss-deep dark:text-moss font-bold">
              <Sparkles className="w-5 h-5" />
              <span className="uppercase tracking-wider text-xs">AI Reasoning Breakdown</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-parchment transition-colors"
            >
              <X className="w-5 h-5 text-loam" />
            </button>
          </div>

          {/* Stamped Score Header */}
          <div className="my-6 p-4 rounded-lg bg-parchment border border-loam/15">
            <div className="text-xs uppercase text-kraft-deep font-semibold tracking-wider">
              Composite Compatibility Seal
            </div>
            <div className="text-4xl font-display font-bold text-moss my-1">
              {score}%
            </div>
            <p className="text-xs text-loam/80 italic leading-relaxed">
              "{reasoning || 'Automated symbiosis match calculated using non-blackbox multi-criteria decision analysis.'}"
            </p>
          </div>

          {/* Sub-score weighted breakdown grid */}
          <div className="space-y-4 my-2 flex-1">
            <div className="text-xs uppercase font-bold tracking-widest text-loam/60 border-b border-loam/10 pb-1">
              Weighted Criteria Breakdown
            </div>

            {weights.map((item, idx) => (
              <div key={idx} className="p-3 bg-parchment/60 rounded border border-loam/10 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="text-loam">{item.label}</span>
                  <span className="text-moss font-mono">{item.weight} weight</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-mycelium rounded-full h-2 overflow-hidden border border-loam/10">
                  <div
                    className="bg-moss h-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-loam/70 pt-0.5">
                  <span>{item.desc}</span>
                  <span className="font-bold">{item.score}/100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stream & Consumer Metadata */}
          <div className="mt-6 pt-4 border-t border-loam/20 text-xs space-y-2 bg-parchment/40 p-3 rounded">
            <div className="flex justify-between">
              <span className="text-loam/60">Waste Stream ID:</span>
              <span className="font-mono">{wasteStream.id || 'WS-4829'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-loam/60">Material Type:</span>
              <span className="font-mono font-bold text-moss">{wasteStream.wasteType || 'ORGANIC'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-loam/60">Producer:</span>
              <span>{wasteStream.producer?.orgName || 'GreenBean Cafe'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-loam/60">Consumer Target:</span>
              <span>{resourceNeed.consumer?.orgName || 'Mycelium Farms'}</span>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-6 pt-2">
            <Button variant="primary" className="w-full" onClick={onClose}>
              Close Lab Notebook
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
