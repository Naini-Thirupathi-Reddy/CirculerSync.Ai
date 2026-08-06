import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ForecastChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-mono text-loam/60">
        No forecast data available. Select a waste stream to generate predictive metrics.
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: item.forDate ? item.forDate.slice(5) : item.date,
    predictedKg: item.predictedKg,
    smaBaseKg: item.factors?.smaBaseKg || 30,
    isRainy: item.factors?.isRainy ? 'Rain' : 'Clear',
    explanation: item.factors?.explanation || '',
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5C6E45" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#5C6E45" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#241B14" strokeOpacity={0.1} />
          <XAxis dataKey="date" stroke="#241B14" fontSize={11} fontFamily="IBM Plex Mono" />
          <YAxis stroke="#241B14" fontSize={11} fontFamily="IBM Plex Mono" unit="kg" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#E4DCC8',
              borderColor: '#241B14',
              borderRadius: '8px',
              fontFamily: 'IBM Plex Mono',
              fontSize: '12px',
              color: '#241B14',
            }}
          />
          <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: '11px' }} />
          <Area
            type="monotone"
            dataKey="predictedKg"
            name="7-Day Predicted Output (kg)"
            stroke="#5C6E45"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#predictedGrad)"
          />
          <Area
            type="monotone"
            dataKey="smaBaseKg"
            name="4-Week SMA Baseline (kg)"
            stroke="#C79A5C"
            strokeDasharray="4 4"
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
