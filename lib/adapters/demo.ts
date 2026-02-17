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

function splitFees(feesUsd: number, orderType: NormalizedTrade['orderType']) {
  // Deterministic breakdown for demo mode.
  // Rationale: limit/post-only are more maker-heavy; market/ioc are taker-heavy.
  const fees = Math.max(0, feesUsd);
  const makerPct = orderType === 'limit' || orderType === 'post_only' ? 0.7 : orderType === 'market' || orderType === 'ioc' ? 0.1 : 0.4;
  const takerPct = orderType === 'market' || orderType === 'ioc' ? 0.8 : orderType === 'limit' || orderType === 'post_only' ? 0.2 : 0.4;
  const fundingPct = 0.1;

  const maker = +(fees * makerPct).toFixed(4);
  const taker = +(fees * takerPct).toFixed(4);
  const funding = +(fees * fundingPct).toFixed(4);
  // keep exact conservation after rounding
  const other = +(fees - maker - taker - funding).toFixed(4);

  return { maker, taker, funding, other };
}

export function demoTradesToNormalized(trades: Trade[]): NormalizedTrade[] {
  return trades.map((t) => {
    const orderType = mapOrderType(t.orderType);
    const feesUsd = t.fees;
    const breakdown = splitFees(feesUsd, orderType);

    return {
      id: t.id,
      ts: t.timestamp,
      symbol: t.symbol,
      side: t.side === 'Long' ? 'long' : 'short',
      orderType,
      entryPrice: Number.isFinite(t.entryPrice) ? t.entryPrice : null,
      exitPrice: Number.isFinite(t.exitPrice) ? t.exitPrice : null,
      size: Number.isFinite(t.size) ? t.size : null,
      pnlUsd: t.pnl,
      feesUsd,
      feeMakerUsd: breakdown.maker,
      feeTakerUsd: breakdown.taker,
      feeFundingUsd: breakdown.funding,
      durationSec: Number.isFinite(t.duration) ? Math.round(t.duration * 3600) : null,
      tags: t.tags ?? [],
      notes: t.notes ?? '',
    };
  });
}
