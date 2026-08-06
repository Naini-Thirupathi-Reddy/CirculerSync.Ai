import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForecastChart } from '../components/predictions/ForecastChart';
import { AlertBanner } from '../components/predictions/AlertBanner';
import { Card } from '../components/ui/Card';
import { TrendingUp, CloudRain, Calendar, Sparkles } from 'lucide-react';
import api from '../services/api';

export const ForecastsPage = () => {
  const navigate = useNavigate();
  const [wasteStreams, setWasteStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/waste')
      .then(res => {
        setWasteStreams(res.data);
        if (res.data.length > 0) {
          setSelectedStream(res.data[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedStream) {
      api.get(`/waste/${selectedStream.id}`)
        .then(res => setForecastData(res.data.forecast || []))
        .catch(err => console.error(err));
    }
  }, [selectedStream]);

  const peakForecast = forecastData.reduce((max, item) => Math.max(max, item.predictedKg || 0), 0);
  const hasRainSignal = forecastData.some(item => item.factors?.isRainy);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="border-b border-loam/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
          Predictive Waste Analytics
        </h1>
        <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
          4-Week SMA • Weekend Multipliers • Open-Meteo Weather Signal
        </p>
      </div>

      {/* Alert Banner */}
      <AlertBanner
        peakKg={peakForecast || 42.5}
        isRainy={hasRainSignal}
        onMatchNow={() => navigate('/matches')}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream Selector List */}
        <Card className="lg:col-span-1 space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-loam/60 pb-2 border-b border-loam/10 flex items-center justify-between">
            <span>Select Waste Stream</span>
            <span className="text-moss">{wasteStreams.length} active</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {wasteStreams.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStream(s)}
                className={`w-full text-left p-3 rounded-md border font-mono text-xs transition-all ${
                  selectedStream?.id === s.id
                    ? 'bg-moss/20 border-moss text-moss-deep dark:text-moss font-bold'
                    : 'bg-parchment/60 border-loam/10 hover:border-moss/40 text-loam'
                }`}
              >
                <div className="flex items-center justify-between font-sans text-sm font-bold truncate">
                  <span>{s.wasteType}</span>
                  <span>{s.quantity} {s.unit}</span>
                </div>
                <div className="text-[11px] text-loam/70 truncate mt-0.5 font-sans">{s.rawDescription}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Forecast Chart Panel */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-loam/10">
            <div>
              <h3 className="font-display font-bold text-lg text-loam">7-Day Waste Output Forecast</h3>
              <p className="text-xs font-mono text-loam/60">
                {selectedStream?.rawDescription || 'Selected stream'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-moss/20 text-moss font-bold">
                SMA Base: {forecastData[0]?.factors?.smaBaseKg || 30}kg
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <ForecastChart data={forecastData} />

          {/* AI Factors Legend */}
          <div className="p-3 bg-parchment/60 rounded border border-loam/10 text-xs font-mono space-y-1.5 text-loam/80">
            <div className="font-bold text-moss uppercase tracking-wider text-[10px]">
              Predictive Model Signal Inputs
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li><strong>4-Week SMA:</strong> Moving average over last 28 days of logged generator volume</li>
              <li><strong>Weekend Boost:</strong> Saturday & Sunday volume scaled by ×1.3 factor</li>
              <li><strong>Open-Meteo Weather:</strong> Precipitation & rain sums fetched from keyless open endpoint</li>
            </ul>
          </div>
        </Card>

      </div>

    </div>
  );
};
