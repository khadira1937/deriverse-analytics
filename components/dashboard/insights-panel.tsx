'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, TrendingUp, Clock } from 'lucide-react';
import type { Insights } from '@/lib/insights/insights';

export function InsightsPanel({ insights }: { insights: Insights }) {
  const { streaks, overtrading, feeDrag, bestWorstHour } = insights;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="glass-panel border-white/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Streaks
          </h3>
          <Badge variant="outline" className="border-white/10 text-white/70">
            current
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Current win streak</div>
            <div className="text-lg font-bold text-green-400">{streaks.currentWin}</div>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Current loss streak</div>
            <div className="text-lg font-bold text-red-400">{streaks.currentLoss}</div>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Max win streak</div>
            <div className="text-lg font-bold text-white">{streaks.maxWin}</div>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Max loss streak</div>
            <div className="text-lg font-bold text-white">{streaks.maxLoss}</div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel border-white/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Fee Drag
          </h3>
          {feeDrag.warning ? (
            <Badge className="bg-yellow-500/20 text-yellow-200 border border-yellow-500/30">High</Badge>
          ) : (
            <Badge variant="outline" className="border-white/10 text-white/70">OK</Badge>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Gross profit</span>
            <span className="text-white font-semibold">${feeDrag.grossProfit.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Total fees</span>
            <span className="text-white font-semibold">${feeDrag.totalFees.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Fees / gross profit</span>
            <span className={`font-semibold ${feeDrag.warning ? 'text-yellow-300' : 'text-white'}`}>
              {feeDrag.grossProfit > 0 ? `${feeDrag.feeToGrossProfitPct.toFixed(1)}%` : '—'}
            </span>
          </div>
          {feeDrag.warning && (
            <div className="mt-3 rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <div>
                  Fees are eating a large portion of your gross profits. Consider reducing overtrading or improving execution.
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-panel border-white/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Time Edge
          </h3>
          <Badge variant="outline" className="border-white/10 text-white/70">hour</Badge>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Best hour</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-white font-semibold">
                {bestWorstHour.bestHour ? `${String(bestWorstHour.bestHour.hour).padStart(2, '0')}:00` : '—'}
              </div>
              <div className="text-green-400 font-semibold">
                {bestWorstHour.bestHour ? `$${bestWorstHour.bestHour.pnl.toFixed(2)}` : ''}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Worst hour</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-white font-semibold">
                {bestWorstHour.worstHour ? `${String(bestWorstHour.worstHour.hour).padStart(2, '0')}:00` : '—'}
              </div>
              <div className="text-red-400 font-semibold">
                {bestWorstHour.worstHour ? `$${bestWorstHour.worstHour.pnl.toFixed(2)}` : ''}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 p-3">
            <div className="text-xs text-white/50">Overtrading days</div>
            <div className="text-white font-semibold mt-1">
              {overtrading.flaggedDays.length ? overtrading.flaggedDays.length : '0'}
              <span className="text-white/50 font-normal"> (≥ {overtrading.threshold} trades/day)</span>
            </div>
            {overtrading.flaggedDays.length > 0 && (
              <div className="mt-2 text-xs text-white/60">
                Top: {overtrading.flaggedDays[0].day} ({overtrading.flaggedDays[0].trades})
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
