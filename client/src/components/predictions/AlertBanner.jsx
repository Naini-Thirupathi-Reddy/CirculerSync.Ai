import React from 'react';
import { AlertTriangle, CloudRain, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const AlertBanner = ({ peakKg = 40, isRainy = false, onMatchNow }) => {
  return (
    <div className="p-4 rounded-lg bg-rust/15 border-2 border-rust/30 text-loam font-mono text-xs shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded bg-rust text-parchment shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-rust-deep dark:text-rust text-sm flex items-center gap-2">
            <span>Predictive Waste Alert</span>
            {isRainy && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-900 dark:text-blue-200">
                <CloudRain className="w-3 h-3" />
                Open-Meteo Rain Signal (-30%)
              </span>
            )}
          </div>
          <p className="text-loam/90 leading-relaxed font-sans">
            You'll likely generate ~<strong className="font-mono text-moss">{peakKg}kg</strong> of material this weekend — match now?
          </p>
        </div>
      </div>

      <Button variant="secondary" size="sm" onClick={onMatchNow} className="gap-1.5 shrink-0 w-full sm:w-auto">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Match now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
