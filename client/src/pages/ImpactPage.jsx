import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ESGReportExporter } from '../components/impact/ESGReportExporter';
import { Leaf, Droplets, Trash2, DollarSign, ShieldCheck } from 'lucide-react';

export const ImpactPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'PRODUCER';

  // Role-specific impact metrics
  const getImpactData = () => {
    if (role === 'CONSUMER') {
      return {
        title: 'Resource Consumer Sustainability Ledger',
        co2Kg: 98.2,
        waterL: 8450,
        landfillKg: 165,
        savings: '$36.90',
        savingsLabel: 'Virgin Material Purchase Savings',
        description: 'Verified metrics for Mycelium Magic Mushrooms & City Farm urban agriculture intakes.',
      };
    }
    if (role === 'LOGISTICS') {
      return {
        title: 'Eco Logistics Efficiency Ledger',
        co2Kg: 215.0,
        waterL: 14200,
        landfillKg: 340,
        savings: '$112.50',
        savingsLabel: 'Vehicle Miles & Fuel Savings',
        description: 'Optimized spatial cluster routes for Swift Eco Logistics pickups.',
      };
    }
    if (role === 'ADMIN') {
      return {
        title: 'Neighborhood Circular Ecosystem Ledger',
        co2Kg: 457.7,
        waterL: 33825,
        landfillKg: 740,
        savings: '$191.80',
        savingsLabel: 'Cumulative Neighborhood Value Generated',
        description: 'Ecosystem-wide sustainability ledger across 14 neighborhood businesses.',
      };
    }
    // PRODUCER Default
    return {
      title: 'Waste Producer Sustainability Ledger',
      co2Kg: 144.5,
      waterL: 11175,
      landfillKg: 235,
      savings: '$42.50',
      savingsLabel: 'Disposal Fee Savings',
      description: 'Verified environmental metrics for GreenBean Cafe & Bakery waste streams.',
    };
  };

  const impact = getImpactData();

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-loam/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
            Impact Intelligence Engine
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            {impact.description}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-moss/10 text-moss border border-moss/20 font-mono text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Role Ledger: {role}</span>
        </div>
      </div>

      {/* Impact Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-lg bg-moss/10 text-moss shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">CO2 Avoided</div>
            <div className="text-2xl font-display font-bold text-loam mt-0.5">{impact.co2Kg} kg</div>
            <div className="text-[10px] font-mono text-moss font-semibold mt-1">Emissions Prevented</div>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-lg bg-kraft/20 text-kraft-deep shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">Water Preserved</div>
            <div className="text-2xl font-display font-bold text-loam mt-0.5">{impact.waterL.toLocaleString()} L</div>
            <div className="text-[10px] font-mono text-kraft-deep font-semibold mt-1">Process Water Conserved</div>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-lg bg-rust/10 text-rust-deep shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">Landfill Diverted</div>
            <div className="text-2xl font-display font-bold text-loam mt-0.5">{impact.landfillKg} kg</div>
            <div className="text-[10px] font-mono text-rust-deep font-semibold mt-1">Direct Landfill Diversion</div>
          </div>
        </Card>

        <Card className="p-5 flex items-start gap-4">
          <div className="p-3 rounded-lg bg-loam/10 text-loam shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">Financial Value</div>
            <div className="text-2xl font-display font-bold text-loam mt-0.5">{impact.savings}</div>
            <div className="text-[10px] font-mono text-loam/70 font-semibold mt-1 truncate max-w-[130px]" title={impact.savingsLabel}>
              {impact.savingsLabel}
            </div>
          </div>
        </Card>

      </div>

      {/* ESG Report Exporter PDF Download Card */}
      <Card className="p-6">
        <ESGReportExporter impactData={impact} user={user} />
      </Card>

    </div>
  );
};
