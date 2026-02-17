'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type TimeOfDayPoint = {
  hour: number;
  pnl: number;
  trades: number;
  winRate: number;
};

function hourLabel(h: number) {
  return String(h).padStart(2, '0');
}

export function TimeOfDayChart({ data }: { data: TimeOfDayPoint[] }) {
  const chartData = (data ?? []).map((d) => ({
    ...d,
    hourLabel: hourLabel(d.hour),
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/50">
          PnL distribution by execution hour • green = profit, red = loss
        </div>
        <div className="text-xs text-white/50">0–23h</div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="hourLabel"
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              tickLine={false}
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
              formatter={(value: any, name: any, props: any) => {
                if (name === 'pnl') return [`$${Number(value).toFixed(2)}`, 'PnL'];
                return [value, name];
              }}
              labelFormatter={(label) => `Hour: ${label}:00`}
            />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px] text-white/60">
        <div className="rounded-md border border-white/10 bg-white/5 p-2">
          <div className="text-white/50">Best hour (PnL)</div>
          <div className="text-white">
            {chartData.length
              ? (() => {
                  const best = [...chartData].sort((a, b) => b.pnl - a.pnl)[0];
                  return `${best.hourLabel}:00 • $${best.pnl.toFixed(2)} • ${best.trades} trades`;
                })()
              : '—'}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-2">
          <div className="text-white/50">Worst hour (PnL)</div>
          <div className="text-white">
            {chartData.length
              ? (() => {
                  const worst = [...chartData].sort((a, b) => a.pnl - b.pnl)[0];
                  return `${worst.hourLabel}:00 • $${worst.pnl.toFixed(2)} • ${worst.trades} trades`;
                })()
              : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
