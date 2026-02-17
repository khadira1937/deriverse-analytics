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
    feesUsd: partial.feesUsd ?? 0.1,
    durationSec: partial.durationSec ?? 3600,
    tags: partial.tags ?? [],
    notes: partial.notes ?? '',
  };
}

describe('computeMetrics - time based', () => {
  it('computes time-of-day buckets and session performance', () => {
    const trades: NormalizedTrade[] = [
      // Use local-time Date constructor because computeMetrics buckets by getHours() (local hours).
      // overnight
      t({ id: '1', ts: new Date(2026, 0, 1, 2, 0, 0), pnlUsd: 10, feesUsd: 1, durationSec: 7200 }),
      t({ id: '2', ts: new Date(2026, 0, 1, 3, 0, 0), pnlUsd: -5, feesUsd: 1, durationSec: 3600 }),
      // morning
      t({ id: '3', ts: new Date(2026, 0, 1, 6, 0, 0), pnlUsd: 1, feesUsd: 0.5, durationSec: 1800 }),
      // afternoon
      t({ id: '4', ts: new Date(2026, 0, 1, 12, 0, 0), pnlUsd: -1, feesUsd: 0.5, durationSec: 1800 }),
      // night
      t({ id: '5', ts: new Date(2026, 0, 1, 18, 0, 0), pnlUsd: 2, feesUsd: 0.5, durationSec: 1800 }),
    ];

    const m = computeMetrics(trades);

    expect(m.timeOfDay).toHaveLength(24);
    const h2 = m.timeOfDay?.find((b) => b.hour === 2);
    expect(h2?.trades).toBe(1);
    expect(h2?.winRate).toBeCloseTo(100);

    expect(m.sessionPerformance?.overnight.trades).toBe(2);
    expect(m.sessionPerformance?.overnight.winRate).toBeCloseTo(50);
    expect(m.sessionPerformance?.overnight.totalFees).toBeCloseTo(2);
    expect(m.sessionPerformance?.overnight.avgDurationHours).toBeGreaterThan(1);
  });
});
