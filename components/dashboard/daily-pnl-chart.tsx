'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DailyPnLPoint } from '@/lib/types';

interface DailyPnLChartProps {
  data: DailyPnLPoint[];
}

export function DailyPnLChart({ data }: DailyPnLChartProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const chartData = data.map((point) => ({
    ...point,
    date: formatDate(point.date),
    pnl: parseFloat(point.pnl.toFixed(2)),
  }));

  const bestDay = Math.max(...chartData.map((d) => d.pnl));
  const worstDay = Math.min(...chartData.map((d) => d.pnl));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="glass-panel-sm p-3 rounded-md border border-green-500/20">
          <p className="text-white/60 text-xs">Best Day</p>
          <p className="text-green-400 font-semibold">${bestDay.toFixed(2)}</p>
        </div>
        <div className="glass-panel-sm p-3 rounded-md border border-red-500/20">
          <p className="text-white/60 text-xs">Worst Day</p>
          <p className="text-red-400 font-semibold">${worstDay.toFixed(2)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(0,255,255,0.3)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl > 0 ? '#10b981' : entry.pnl < 0 ? '#ef4444' : '#6b7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
