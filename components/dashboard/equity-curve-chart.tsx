'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import { EquityCurvePoint } from '@/lib/types';

interface EquityCurveChartProps {
  data: EquityCurvePoint[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const chartData = data.map((point) => ({
    ...point,
    date: formatDate(point.timestamp),
    equity: parseFloat(point.equity.toFixed(2)),
    cumPnL: parseFloat(point.cumPnL.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.4)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.4)"
          style={{ fontSize: '12px' }}
          label={{ value: 'Equity ($)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="#00ffff"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorEquity)"
          name="Equity Curve"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
