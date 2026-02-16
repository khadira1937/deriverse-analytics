import type { Trade } from '@/lib/types';
import type { NormalizedTrade } from '@/lib/domain/trade';

function mapOrderType(t: Trade['orderType']): NormalizedTrade['orderType'] {
  switch (t) {
    case 'Limit':
      return 'limit';
    case 'Market':
      return 'market';
    case 'IOC':
      return 'ioc';
    case 'Post-only':
      return 'post_only';
    default:
      return 'unknown';
  }
}

export function demoTradesToNormalized(trades: Trade[]): NormalizedTrade[] {
  return trades.map((t) => ({
    id: t.id,
    ts: t.timestamp,
    symbol: t.symbol,
    side: t.side === 'Long' ? 'long' : 'short',
    orderType: mapOrderType(t.orderType),
    entryPrice: Number.isFinite(t.entryPrice) ? t.entryPrice : null,
    exitPrice: Number.isFinite(t.exitPrice) ? t.exitPrice : null,
    size: Number.isFinite(t.size) ? t.size : null,
    pnlUsd: t.pnl,
    feesUsd: t.fees,
    durationSec: Number.isFinite(t.duration) ? Math.round(t.duration * 3600) : null,
    tags: t.tags ?? [],
    notes: t.notes ?? '',
  }));
}
