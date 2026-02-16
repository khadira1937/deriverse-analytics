import { describe, expect, it } from 'vitest';
import { computeInsights } from './insights';
import type { NormalizedTrade } from '@/lib/domain/trade';
import { computeMetrics } from '../metrics/engine';

function t(id: string, ts: string, pnl: number): NormalizedTrade {
  return {
    id,
    ts: new Date(ts),
    symbol: 'SOL/USDC',
    side: 'long',
    orderType: 'limit',
    entryPrice: 100,
    exitPrice: 101,
    size: 1,
    pnlUsd: pnl,
    feesUsd: 1,
    durationSec: 3600,
    tags: [],
    notes: '',
  };
}

describe('computeInsights', () => {
  it('computes streaks', () => {
    const trades = [
      t('1', '2026-01-01T00:00:00Z', 1),
      t('2', '2026-01-02T00:00:00Z', 2),
      t('3', '2026-01-03T00:00:00Z', -1),
      t('4', '2026-01-04T00:00:00Z', -1),
      t('5', '2026-01-05T00:00:00Z', 1),
    ];
    const metrics = computeMetrics(trades);
    const ins = computeInsights({ trades, metrics });
    expect(ins.streaks.maxWin).toBe(2);
    expect(ins.streaks.maxLoss).toBe(2);
    expect(ins.streaks.currentWin).toBe(1);
  });

  it('computes fee drag warning', () => {
    const trades = [
      t('1', '2026-01-01T00:00:00Z', 10),
      t('2', '2026-01-02T00:00:00Z', 0),
    ];
    const metrics = computeMetrics(trades);
    // totalFees=2, grossProfit=10 => 20%
    const ins = computeInsights({ trades, metrics });
    expect(ins.feeDrag.feeToGrossProfitPct).toBeCloseTo(20);
    expect(ins.feeDrag.warning).toBe(true);
  });
});
