'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

export type OrderTypePerf = {
  orderType: string;
  trades: number;
  pnl: number;
  winRate: number;
  avgDurationHours: number;
  avgFees: number;
};

function money(n: number) {
  const sign = n > 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function OrderTypeBreakdown({ data }: { data: OrderTypePerf[] }) {
  const rows = [...(data ?? [])].sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/50">
        Compare performance by execution type (PnL, win rate, duration, fees)
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left text-xs uppercase text-white/60">
              <th className="px-3 py-2">Order type</th>
              <th className="px-3 py-2">Trades</th>
              <th className="px-3 py-2">PnL</th>
              <th className="px-3 py-2">Win rate</th>
              <th className="px-3 py-2">Avg duration</th>
              <th className="px-3 py-2">Avg fees</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pnlColor = r.pnl >= 0 ? 'text-green-400' : 'text-red-400';
              return (
                <tr key={r.orderType} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="border-cyan-400/30 text-cyan-200">
                      {r.orderType}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-white/80">{r.trades}</td>
                  <td className={`px-3 py-2 font-semibold ${pnlColor}`}>{money(r.pnl)}</td>
                  <td className="px-3 py-2 text-white/80">{r.winRate.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-white/80">{r.avgDurationHours.toFixed(1)}h</td>
                  <td className="px-3 py-2 text-white/80">${r.avgFees.toFixed(2)}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-white/50">
                  No trades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="rounded-md border border-white/10 bg-white/5 p-2">
            <div className="text-white/50">Best order type (PnL)</div>
            <div className="text-white">
              {rows[0].orderType} • {money(rows[0].pnl)} • {rows[0].trades} trades
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-2">
            <div className="text-white/50">Worst order type (PnL)</div>
            <div className="text-white">
              {rows[rows.length - 1].orderType} • {money(rows[rows.length - 1].pnl)} • {rows[rows.length - 1].trades} trades
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
