import { describe, expect, it } from 'vitest';
import { computeBasicMetrics } from './basic';
import type { NormalizedTrade } from '@/lib/domain/trade';

describe('computeBasicMetrics', () => {
  it('computes win rate and pnl', () => {
    const trades: NormalizedTrade[] = [
      {
        id: '1',
        ts: new Date('2026-01-01T00:00:00Z'),
        symbol: 'SOL/USDC',
        side: 'long',
        orderType: 'limit',
        entryPrice: 10,
        exitPrice: 12,
        size: 1,
        pnlUsd: 2,
        feesUsd: 0.1,
        durationSec: 3600,
        tags: [],
        notes: '',
      },
      {
        id: '2',
        ts: new Date('2026-01-02T00:00:00Z'),
        symbol: 'SOL/USDC',
        side: 'short',
        orderType: 'market',
        entryPrice: 10,
        exitPrice: 11,
        size: 1,
        pnlUsd: -1,
        feesUsd: 0.1,
        durationSec: 3600,
        tags: [],
        notes: '',
      },
    ];

    const m = computeBasicMetrics(trades);
    expect(m.kpis.tradeCount).toBe(2);
    expect(m.kpis.totalPnL).toBe(1);
    expect(m.kpis.winRate).toBeCloseTo(50);
    expect(m.kpis.totalFees).toBeCloseTo(0.2);
  });
});
