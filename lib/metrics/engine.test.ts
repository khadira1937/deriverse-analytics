import { describe, expect, it } from 'vitest';
import type { NormalizedTrade } from '@/lib/domain/trade';
import { computeMetrics } from './engine';

function t(partial: Partial<NormalizedTrade> & { id: string; ts: Date; pnlUsd: number }): NormalizedTrade {
  return {
    id: partial.id,
    ts: partial.ts,
    symbol: partial.symbol ?? 'SOL/USDC',
    side: partial.side ?? 'long',
    orderType: partial.orderType ?? 'limit',
    entryPrice: partial.entryPrice ?? 100,
    exitPrice: partial.exitPrice ?? 101,
    size: partial.size ?? 1,
    pnlUsd: partial.pnlUsd,
    feesUsd: partial.feesUsd ?? 0,
    durationSec: partial.durationSec ?? 3600,
    tags: partial.tags ?? [],
    notes: partial.notes ?? '',
  };
}

describe('computeMetrics', () => {
  it('computes equity curve and max drawdown percent', () => {
    // starting equity 10000
    const trades: NormalizedTrade[] = [
      t({ id: '1', ts: new Date('2026-01-01T00:00:00Z'), pnlUsd: 100 }), // equity 10100 peak
      t({ id: '2', ts: new Date('2026-01-02T00:00:00Z'), pnlUsd: -200 }), // equity 9900 dd=1.9802%
      t({ id: '3', ts: new Date('2026-01-03T00:00:00Z'), pnlUsd: 50 }), // equity 9950 dd=1.4851%
    ];

    const m = computeMetrics(trades, { startingEquity: 10000 });
    expect(m.equityCurve).toHaveLength(3);
    expect(m.equityCurve[0].equity).toBe(10100);
    expect(m.equityCurve[1].equity).toBe(9900);

    const dd2 = m.equityCurve[1].drawdown;
    expect(dd2).toBeGreaterThan(1.9);
    expect(dd2).toBeLessThan(2.1);

    expect(m.maxDrawdownPct).toBeGreaterThan(1.9);
  });

  it('computes fee composition and cumulative fees by day', () => {
    const trades: NormalizedTrade[] = [
      t({ id: '1', ts: new Date('2026-01-01T01:00:00Z'), pnlUsd: 1, feesUsd: 0.1 }),
      t({ id: '2', ts: new Date('2026-01-01T02:00:00Z'), pnlUsd: 1, feesUsd: 0.2 }),
      t({ id: '3', ts: new Date('2026-01-02T02:00:00Z'), pnlUsd: 1, feesUsd: 0.3 }),
    ];

    const m = computeMetrics(trades);
    expect(m.feeComposition?.total).toBeCloseTo(0.6);
    expect(m.feeComposition?.other).toBeCloseTo(0.6);
    expect(m.feeComposition?.maker).toBeCloseTo(0);
    expect(m.feeComposition?.taker).toBeCloseTo(0);
    expect(m.feeComposition?.funding).toBeCloseTo(0);
    expect(m.cumulativeFeesByDay).toHaveLength(2);
    expect(m.cumulativeFeesByDay?.[0].cumFees).toBeCloseTo(0.3);
    expect(m.cumulativeFeesByDay?.[1].cumFees).toBeCloseTo(0.6);
  });

  it('computes order type performance', () => {
    const trades: NormalizedTrade[] = [
      t({ id: '1', ts: new Date('2026-01-01T00:00:00Z'), pnlUsd: 5, orderType: 'limit', feesUsd: 1, durationSec: 3600 }),
      t({ id: '2', ts: new Date('2026-01-02T00:00:00Z'), pnlUsd: -1, orderType: 'market', feesUsd: 2, durationSec: 7200 }),
      t({ id: '3', ts: new Date('2026-01-03T00:00:00Z'), pnlUsd: 1, orderType: 'limit', feesUsd: 1, durationSec: 3600 }),
    ];

    const m = computeMetrics(trades);
    const perf = m.orderTypePerformance ?? [];
    const limit = perf.find((p) => p.orderType === 'limit');
    expect(limit?.trades).toBe(2);
    expect(limit?.pnl).toBe(6);
    expect(limit?.winRate).toBeCloseTo(100);
    expect(limit?.avgDurationHours).toBeCloseTo(1);
    expect(limit?.avgFees).toBeCloseTo(1);
  });
});
