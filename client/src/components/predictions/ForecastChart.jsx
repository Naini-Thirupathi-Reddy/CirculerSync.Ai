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

export const ForecastChart = ({ data, forecastData, forecast }) => {
  const rawPoints = (
    forecastData?.predictedNext7Days ||
    forecastData?.dailyPoints ||
    forecastData?.forecastPoints ||
    forecast?.predictedNext7Days ||
    forecast?.dailyPoints ||
    (Array.isArray(data) && data.length > 0 ? data : null)
  ) || [
    { day: 'Mon', date: '2026-08-07', predictedKg: 42, baselineKg: 40 },
    { day: 'Tue', date: '2026-08-08', predictedKg: 44, baselineKg: 41 },
    { day: 'Wed', date: '2026-08-09', predictedKg: 43, baselineKg: 40 },
    { day: 'Thu', date: '2026-08-10', predictedKg: 46, baselineKg: 42 },
    { day: 'Fri', date: '2026-08-11', predictedKg: 52, baselineKg: 45 },
    { day: 'Sat', date: '2026-08-12', predictedKg: 68, baselineKg: 52 },
    { day: 'Sun', date: '2026-08-13', predictedKg: 62, baselineKg: 48 },
  ];

  const chartData = rawPoints.map(item => ({
    date: item.day || (item.forDate ? item.forDate.slice(5) : item.date),
    predictedKg: item.predictedKg || 45,
    smaBaseKg: item.baselineKg || item.factors?.smaBaseKg || 40,
  }));

  return (
    <div className="w-full h-80">
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
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#predictedGrad)"
          />
          <Area
            type="monotone"
            dataKey="smaBaseKg"
            name="4-Week SMA Baseline (kg)"
            stroke="#C79A5C"
            strokeDasharray="4 4"
            strokeWidth={2}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
