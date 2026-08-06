import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ForecastChart } from '../components/predictions/ForecastChart';
import { AlertBanner } from '../components/predictions/AlertBanner';
import { Card } from '../components/ui/Card';
import { TrendingUp, CloudRain, Calendar, Sparkles } from 'lucide-react';
import api from '../services/api';

const DEFAULT_STREAMS = [
  { id: 'ws-1', rawDescription: '45kg fresh espresso coffee grounds', wasteType: 'ORGANIC', quantity: 45 },
  { id: 'ws-2', rawDescription: '60kg spent coffee chaff and grounds', wasteType: 'ORGANIC', quantity: 60 },
  { id: 'ws-3', rawDescription: '85kg clean corrugated cardboard boxes', wasteType: 'CARDBOARD', quantity: 85 },
];

const DEFAULT_FORECAST = {
  wasteStreamId: 'ws-1',
  historicalAverage: 42.5,
  predictedNext7Days: [
    { day: 'Mon', date: '2026-08-07', predictedKg: 42, baselineKg: 40, isWeekend: false, weatherImpact: 0 },
    { day: 'Tue', date: '2026-08-08', predictedKg: 44, baselineKg: 41, isWeekend: false, weatherImpact: 0 },
    { day: 'Wed', date: '2026-08-09', predictedKg: 43, baselineKg: 40, isWeekend: false, weatherImpact: 0 },
    { day: 'Thu', date: '2026-08-10', predictedKg: 46, baselineKg: 42, isWeekend: false, weatherImpact: 0 },
    { day: 'Fri', date: '2026-08-11', predictedKg: 52, baselineKg: 45, isWeekend: false, weatherImpact: 0 },
    { day: 'Sat', date: '2026-08-12', predictedKg: 68, baselineKg: 52, isWeekend: true, weatherImpact: 0 },
    { day: 'Sun', date: '2026-08-13', predictedKg: 62, baselineKg: 48, isWeekend: true, weatherImpact: 0 },
  ],
  weatherSignal: {
    condition: 'Rain Shower (-30% foot traffic expected on Thu)',
    impactFactor: -0.3,
  },
  trendDirection: 'UP',
  confidenceScore: 92,
};

export const ForecastsPage = () => {
  const { user } = useAuth();
  const [streams, setStreams] = useState(DEFAULT_STREAMS);
  const [selectedId, setSelectedId] = useState('ws-1');
  const [forecast, setForecast] = useState(DEFAULT_FORECAST);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/waste/${id}`);
      if (res.data && res.data.forecast) {
        setForecast(res.data.forecast);
      }
    } catch (err) {
      console.warn('Using client fallback forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(selectedId);
  }, [selectedId]);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-loam/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
            Predictive Waste Analytics
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            7-day predictive forecast combining 4-week SMA, weekend multipliers & weather signals
          </p>
        </div>

        {/* Waste Stream Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono font-bold text-loam uppercase">Stream:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-parchment border border-loam/20 text-loam text-xs font-mono focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {streams.map(s => (
              <option key={s.id} value={s.id}>
                {s.rawDescription.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner weatherSignal={forecast.weatherSignal} />

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-moss/10 text-moss">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">Historical 4-Wk Average</div>
            <div className="text-xl font-display font-bold text-loam">{forecast.historicalAverage} kg/day</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-kraft/20 text-kraft-deep">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">Weekend Multiplier</div>
            <div className="text-xl font-display font-bold text-loam">+30% Surge</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rust/10 text-rust-deep">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-loam/60 font-bold">Forecast Confidence</div>
            <div className="text-xl font-display font-bold text-loam">{forecast.confidenceScore}% Acc</div>
          </div>
        </Card>
      </div>

      {/* Forecast Recharts Area Graph */}
      <Card className="p-6">
        <ForecastChart forecastData={forecast} />
      </Card>

    </div>
  );
};
