import { endOfDay, startOfDay } from 'date-fns';

import type { NormalizedTrade } from '@/lib/domain/trade';

export type TradeFilters = {
  symbol?: string | null;
  from?: Date;
  to?: Date;
};

function toStart(d?: Date) {
  return d ? startOfDay(d).getTime() : undefined;
}

function toEndInclusive(d?: Date) {
  // Treat "to" as inclusive through the end of that calendar day.
  // This matches trader expectations and avoids excluding trades on the selected end date.
  return d ? endOfDay(d).getTime() : undefined;
}

export function filterTrades(trades: NormalizedTrade[], filters: TradeFilters): NormalizedTrade[] {
  const symbol = filters.symbol ?? null;
  const fromMs = toStart(filters.from);
  const toMs = toEndInclusive(filters.to);

  if (!symbol && fromMs === undefined && toMs === undefined) return trades;

  return trades.filter((t) => {
    if (symbol && t.symbol !== symbol) return false;
    const ms = t.ts.getTime();
    if (fromMs !== undefined && ms < fromMs) return false;
    if (toMs !== undefined && ms > toMs) return false;
    return true;
  });
}
