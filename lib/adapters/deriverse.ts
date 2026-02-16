import type { NormalizedTrade } from '@/lib/domain/trade';

export type DeriverseFetchResult =
  | { ok: true; trades: NormalizedTrade[] }
  | { ok: false; error: string };

export interface DeriverseEnv {
  rpcUrl: string;
  programId: string;
  version: number;
}

type ApiTrade = {
  id: string;
  ts: string;
  symbol: string;
  side: 'long' | 'short';
  orderType: string;
  entryPrice: number | null;
  exitPrice: number | null;
  size: number | null;
  pnlUsd: number;
  feesUsd: number;
  durationSec: number | null;
  tags: string[];
  notes: string;
};

type ApiResponse =
  | { ok: true; trades: ApiTrade[] }
  | { ok: false; error: string };

function lsKey(addr: string) {
  return `derivision.onchain.${addr}`;
}

function mapOrderType(v: string): NormalizedTrade['orderType'] {
  switch (v) {
    case 'limit':
      return 'limit';
    case 'market':
      return 'market';
    case 'ioc':
      return 'ioc';
    case 'post_only':
      return 'post_only';
    default:
      return 'unknown';
  }
}

export async function fetchDeriverseTrades(_env: DeriverseEnv, traderAddress: string): Promise<DeriverseFetchResult> {
  // Browser cache to reduce RPC load
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(lsKey(traderAddress));
      if (raw) {
        const parsed = JSON.parse(raw) as { at: number; trades: ApiTrade[] };
        if (parsed?.at && Date.now() - parsed.at < 30_000 && Array.isArray(parsed.trades)) {
          const trades: NormalizedTrade[] = parsed.trades.map((t) => ({
            id: t.id,
            ts: new Date(t.ts),
            symbol: t.symbol,
            side: t.side,
            orderType: mapOrderType(t.orderType),
            entryPrice: t.entryPrice,
            exitPrice: t.exitPrice,
            size: t.size,
            pnlUsd: t.pnlUsd,
            feesUsd: t.feesUsd,
            durationSec: t.durationSec,
            tags: t.tags ?? [],
            notes: t.notes ?? '',
          }));
          return { ok: true, trades };
        }
      }
    } catch {}
  }

  const res = await fetch(`/api/deriverse/trades?trader=${encodeURIComponent(traderAddress)}&limit=200`);
  const json = (await res.json()) as ApiResponse;

  if (!json.ok) {
    return { ok: false, error: json.error };
  }

  const trades: NormalizedTrade[] = json.trades.map((t) => ({
    id: t.id,
    ts: new Date(t.ts),
    symbol: t.symbol,
    side: t.side,
    orderType: mapOrderType(t.orderType),
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    size: t.size,
    pnlUsd: t.pnlUsd,
    feesUsd: t.feesUsd,
    durationSec: t.durationSec,
    tags: t.tags ?? [],
    notes: t.notes ?? '',
  }));

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(lsKey(traderAddress), JSON.stringify({ at: Date.now(), trades: json.trades }));
    } catch {}
  }

  return { ok: true, trades };
}
