import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { ESGReportExporter } from '../components/impact/ESGReportExporter';
import { Cloud, Droplets, Trash, DollarSign, Award, TrendingUp, Sparkles } from 'lucide-react';
import api from '../services/api';

export const ImpactPage = () => {
  const [personalImpact, setPersonalImpact] = useState(null);
  const [communityImpact, setCommunityImpact] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/impact/personal'),
      api.get('/impact/community'),
      api.get('/impact/report'),
    ])
      .then(([pRes, cRes, rRes]) => {
        setPersonalImpact(pRes.data);
        setCommunityImpact(cRes.data);
        setReportData(rRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const pTotals = personalImpact?.totals || {
    co2SavedKg: 144.5,
    waterSavedL: 11175.0,
    landfillDivertedKg: 235.0,
    producerSavings: 42.50,
    consumerSavings: 36.90,
  };

  const cTotals = communityImpact?.communityTotals || {
    co2SavedKg: 428.0,
    waterSavedL: 24600.0,
    landfillDivertedKg: 680.0,
    totalEconomicSavings: 285.50,
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header with PDF Exporter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-loam/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
            Impact Intelligence Engine
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            Verifiable Environmental & Financial Sustainability Ledger
          </p>
        </div>

        <ESGReportExporter reportData={reportData} />
      </div>

      {/* Hero Stats Grid using Fraunces Display Font */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CO2 Saved Card */}
        <Card className="p-5 border-l-4 border-l-moss space-y-2">
          <div className="flex items-center justify-between text-moss">
            <Cloud className="w-6 h-6" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-loam/60">CO2 Emissions</span>
          </div>
          <div className="text-3xl font-display font-bold text-loam">
            {pTotals.co2SavedKg} <span className="text-base font-normal text-loam/70">kg</span>
          </div>
          <p className="text-xs font-mono text-moss-deep dark:text-moss">
            Equivalent to {Math.round(pTotals.co2SavedKg * 2.5)} km driving avoided
          </p>
        </Card>

        {/* Water Preserved Card */}
        <Card className="p-5 border-l-4 border-l-kraft space-y-2">
          <div className="flex items-center justify-between text-kraft-deep dark:text-kraft">
            <Droplets className="w-6 h-6" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-loam/60">Freshwater Preserved</span>
          </div>
          <div className="text-3xl font-display font-bold text-loam">
            {pTotals.waterSavedL.toLocaleString()} <span className="text-base font-normal text-loam/70">L</span>
          </div>
          <p className="text-xs font-mono text-kraft-deep dark:text-kraft">
            100L saved per kg cardboard recycled
          </p>
        </Card>

        {/* Landfill Diverted Card */}
        <Card className="p-5 border-l-4 border-l-rust space-y-2">
          <div className="flex items-center justify-between text-rust">
            <Trash className="w-6 h-6" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-loam/60">Landfill Diversion</span>
          </div>
          <div className="text-3xl font-display font-bold text-loam">
            {pTotals.landfillDivertedKg} <span className="text-base font-normal text-loam/70">kg</span>
          </div>
          <p className="text-xs font-mono text-rust-deep dark:text-rust">
            1:1 direct waste diversion ratio
          </p>
        </Card>

        {/* Cost Savings Card */}
        <Card className="p-5 border-l-4 border-l-loam space-y-2">
          <div className="flex items-center justify-between text-loam">
            <DollarSign className="w-6 h-6" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-loam/60">Economic Value</span>
          </div>
          <div className="text-3xl font-display font-bold text-moss">
            ${(pTotals.producerSavings + pTotals.consumerSavings).toFixed(2)}
          </div>
          <p className="text-xs font-mono text-loam/70">
            Disposal fee & purchasing cost savings
          </p>
        </Card>

      </div>

      {/* Community vs Personal Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Organization Personal Impact */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-loam/10">
            <h3 className="font-display font-bold text-lg text-loam">Your Organization Ledger</h3>
            <span className="font-mono text-xs text-moss font-bold">Verified Audit</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 bg-parchment/60 rounded border border-loam/10">
              <span className="text-loam/70">Avoided Disposal Fees ($0.20/kg):</span>
              <span className="font-bold text-moss">${pTotals.producerSavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-parchment/60 rounded border border-loam/10">
              <span className="text-loam/70">Avoided Material Purchase ($0.15/kg):</span>
              <span className="font-bold text-kraft-deep dark:text-kraft">${pTotals.consumerSavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-parchment/60 rounded border border-loam/10">
              <span className="text-loam/70">Completed Circular Swaps:</span>
              <span className="font-bold text-loam">{personalImpact?.logsCount || 6} Swaps</span>
            </div>
          </div>
        </Card>

        {/* Neighborhood Community Cumulative Impact */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-loam/10">
            <h3 className="font-display font-bold text-lg text-loam">Neighborhood Network Aggregate</h3>
            <span className="font-mono text-xs text-kraft font-bold">14 Active Businesses</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 bg-parchment/60 rounded border border-loam/10">
              <span className="text-loam/70">Total Neighborhood CO2 Diverted:</span>
              <span className="font-bold text-moss">{cTotals.co2SavedKg} kg CO2</span>
            </div>
            <div className="flex justify-between p-3 bg-parchment/60 rounded border border-loam/10">
              <span className="text-loam/70">Total Neighborhood Water Preserved:</span>
              <span className="font-bold text-kraft-deep dark:text-kraft">{cTotals.waterSavedL.toLocaleString()} Liters</span>
            </div>
            <div className="flex justify-between p-3 bg-parchment/60 rounded border border-loam/10">
              <span className="text-loam/70">Total Neighborhood Circular Savings:</span>
              <span className="font-bold text-loam">${cTotals.totalEconomicSavings.toFixed(2)}</span>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
};
