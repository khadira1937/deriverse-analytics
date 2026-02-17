'use client';

import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export type FeeComposition = {
  maker: number;
  taker: number;
  funding: number;
  other: number;
  total: number;
};

const COLORS = {
  maker: 'rgba(34,211,238,0.95)',
  taker: 'rgba(59,130,246,0.85)',
  funding: 'rgba(168,85,247,0.85)',
  other: 'rgba(255,255,255,0.25)',
} as const;

export function FeeCompositionChart({ data }: { data: FeeComposition }) {
  const total = Math.max(0, data?.total ?? 0);
  const slices = [
    { key: 'maker', name: 'Maker', value: Math.max(0, data?.maker ?? 0) },
    { key: 'taker', name: 'Taker', value: Math.max(0, data?.taker ?? 0) },
    { key: 'funding', name: 'Funding', value: Math.max(0, data?.funding ?? 0) },
    { key: 'other', name: 'Other', value: Math.max(0, data?.other ?? 0) },
  ].filter((s) => s.value > 0.0001);

  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
              }}
              formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}`, name]}
            />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={2}
              stroke="rgba(255,255,255,0.06)"
            >
              {slices.map((s) => (
                <Cell key={s.key} fill={(COLORS as any)[s.key] ?? COLORS.other} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/50">Fee composition over selected range</div>
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/50">Total fees</div>
          <div className="text-xl font-bold text-white mt-1">${total.toFixed(2)}</div>
        </div>

        <div className="space-y-2">
          {['maker', 'taker', 'funding', 'other'].map((k) => {
            const v = (data as any)?.[k] ?? 0;
            const percent = pct(v);
            if (v <= 0.0001) return null;

            return (
              <div key={k} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: (COLORS as any)[k] ?? COLORS.other }}
                  />
                  <span className="text-white/70 capitalize">{k}</span>
                </div>
                <div className="text-white">
                  ${Number(v).toFixed(2)} <span className="text-white/50">({percent.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
