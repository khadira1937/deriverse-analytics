'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/lib/context/app-context';
import { DEMO_TRADES } from '@/lib/mock/trades';
import { demoTradesToNormalized } from '@/lib/adapters/demo';
import { parseTradesCsv } from '@/lib/adapters/csv';
import { fetchDeriverseTrades } from '@/lib/adapters/deriverse';
import type { NormalizedTrade } from '@/lib/domain/trade';
import { computeBasicMetrics } from '@/lib/metrics/basic';

export type TradeFilters = {
  symbol?: string | null;
  from?: Date;
  to?: Date;
  // Phase A: placeholder for later
  side?: 'long' | 'short' | null;
  orderType?: string | null;
};

function applyDateRange(trades: NormalizedTrade[], from?: Date, to?: Date) {
  return trades.filter((t) => {
    const ms = t.ts.getTime();
    if (from && ms < from.getTime()) return false;
    if (to && ms > to.getTime()) return false;
    return true;
  });
}

function applySymbol(trades: NormalizedTrade[], symbol?: string | null) {
  if (!symbol) return trades;
  return trades.filter((t) => t.symbol === symbol);
}

export function useTrades() {
  const { dataMode, solanaAddress, selectedSymbol, dateRange, csvText, setCsvText } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseTrades, setBaseTrades] = useState<NormalizedTrade[]>([]);

  const setCsv = (text: string) => setCsvText(text);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (dataMode === 'demo') {
          const normalized = demoTradesToNormalized(DEMO_TRADES);
          if (!cancelled) setBaseTrades(normalized);
          return;
        }

        if (dataMode === 'csv') {
          const parsed = parseTradesCsv(csvText);
          if (!parsed.ok) throw new Error(parsed.error);
          if (!cancelled) setBaseTrades(parsed.trades);
          return;
        }

        // on-chain
        if (!solanaAddress) throw new Error('Please enter a Solana address.');
        const env = {
          rpcUrl: process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
          programId: process.env.DERIVERSE_PROGRAM_ID ?? '',
          version: Number(process.env.DERIVERSE_VERSION ?? '6'),
        };
        const res = await fetchDeriverseTrades(env, solanaAddress);
        if (!res.ok) throw new Error(res.error);
        if (!cancelled) setBaseTrades(res.trades);
      } catch (e: any) {
        if (!cancelled) {
          setBaseTrades([]);
          setError(e?.message ?? 'Failed to load trades');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataMode, solanaAddress, csvText]);

  const filteredTrades = useMemo(() => {
    const afterSymbol = applySymbol(baseTrades, selectedSymbol);
    return applyDateRange(afterSymbol, dateRange.from, dateRange.to);
  }, [baseTrades, selectedSymbol, dateRange.from, dateRange.to]);

  const metrics = useMemo(() => computeBasicMetrics(filteredTrades), [filteredTrades]);

  return {
    trades: filteredTrades,
    metrics,
    loading,
    error,
    setCsv,
  };
}
