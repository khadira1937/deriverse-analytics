'use client';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type CumulativeFeesPoint = {
  day: string; // YYYY-MM-DD
  cumFees: number;
};

export function CumulativeFeesChart({ data }: { data: CumulativeFeesPoint[] }) {
  const chartData = (data ?? []).map((d) => ({
    ...d,
    label: d.day.slice(5), // MM-DD
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickLine={false}
            minTickGap={18}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Cumulative fees']}
          />
          <Line
            type="monotone"
            dataKey="cumFees"
            stroke="rgba(34,211,238,0.95)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
