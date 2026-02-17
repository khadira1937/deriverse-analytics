'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export type SessionKey = 'morning' | 'afternoon' | 'night' | 'overnight';

export type SessionBucket = {
  pnl: number;
  trades: number;
  winRate: number;
  avgDurationHours: number;
  totalFees: number;
};

export type SessionPerformance = Record<SessionKey, SessionBucket>;

const labels: Record<SessionKey, { name: string; hours: string }> = {
  overnight: { name: 'Overnight', hours: '00–05' },
  morning: { name: 'Morning', hours: '06–11' },
  afternoon: { name: 'Afternoon', hours: '12–17' },
  night: { name: 'Night', hours: '18–23' },
};

function fmtMoney(n: number) {
  const sign = n > 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function SessionPerformanceCard({ data }: { data: SessionPerformance }) {
  const keys: SessionKey[] = ['overnight', 'morning', 'afternoon', 'night'];

  const best = keys
    .map((k) => ({ k, pnl: data?.[k]?.pnl ?? 0 }))
    .sort((a, b) => b.pnl - a.pnl)[0]?.k;

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/50">
        Session breakdown (local hour buckets) • includes PnL, win rate, duration, fees
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((k) => {
          const b = data?.[k];
          const pnl = b?.pnl ?? 0;
          const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';

          return (
            <Card
              key={k}
              className={`glass-panel border-white/10 p-4 ${best === k ? 'border-cyan-400/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {labels[k].name}{' '}
                    <span className="text-xs text-white/40 font-normal">({labels[k].hours})</span>
                  </div>
                  <div className={`text-xl font-bold mt-1 ${pnlColor}`}>{fmtMoney(pnl)}</div>
                </div>
                {best === k && (
                  <div className="text-[10px] px-2 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-200">
                    Best session
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="text-white/60">Trades</div>
                <div className="text-right text-white">{b?.trades ?? 0}</div>

                <div className="text-white/60">Win rate</div>
                <div className="text-right text-white">{(b?.winRate ?? 0).toFixed(1)}%</div>

                <div className="text-white/60">Avg duration</div>
                <div className="text-right text-white">{(b?.avgDurationHours ?? 0).toFixed(1)}h</div>

                <div className="text-white/60">Fees</div>
                <div className="text-right text-white">${(b?.totalFees ?? 0).toFixed(2)}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
