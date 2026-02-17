'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '@/lib/context/app-context';
import { DEMO_TRADES } from '@/lib/mock/trades';
import { demoTradesToNormalized } from '@/lib/adapters/demo';
import { parseTradesCsv } from '@/lib/adapters/csv';
import { fetchDeriverseTrades } from '@/lib/adapters/deriverse';
import type { NormalizedTrade } from '@/lib/domain/trade';
import { computeMetrics } from '@/lib/metrics/engine';
import { filterTrades } from '@/lib/selectors/filtered-trades';

export function useTrades() {
  const {
    dataMode,
    solanaAddress,
    selectedSymbol,
    dateRange,
    csvText,
    setCsvText,
    onChainRunId,
    setOnChainLoading,
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseTrades, setBaseTrades] = useState<NormalizedTrade[]>([]);
  const [baseVersion, setBaseVersion] = useState(0);

  const metricsCacheRef = useRef(new Map<string, ReturnType<typeof computeMetrics>>());

  const setCsv = (text: string) => setCsvText(text);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      if (dataMode === 'on-chain') setOnChainLoading(true);

      try {
        if (dataMode === 'demo') {
          const normalized = demoTradesToNormalized(DEMO_TRADES);
          if (!cancelled) {
            setBaseTrades(normalized);
            setBaseVersion((v) => v + 1);
          }
          return;
        }

        if (dataMode === 'csv') {
          const parsed = parseTradesCsv(csvText);
          if (!parsed.ok) throw new Error(parsed.error);
          if (!cancelled) {
            setBaseTrades(parsed.trades);
            setBaseVersion((v) => v + 1);
          }
          return;
        }

        // on-chain (only fetch when user explicitly runs analyze)
        if (onChainRunId === 0) {
          if (!cancelled) {
            setBaseTrades([]);
            setBaseVersion((v) => v + 1);
            setError('Click Analyze to fetch on-chain data.');
          }
          return;
        }

        const trimmed = (solanaAddress ?? '').trim();
        if (!trimmed) throw new Error('Please enter a Solana address.');
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
          throw new Error('Invalid Solana address (base58).');
        }
        const env = {
          rpcUrl: process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
          programId: process.env.DERIVERSE_PROGRAM_ID ?? '',
          version: Number(process.env.DERIVERSE_VERSION ?? '6'),
        };
        const res = await fetchDeriverseTrades(env, trimmed);
        if (!res.ok) throw new Error(res.error);
        if (!cancelled) {
          setBaseTrades(res.trades);
          setBaseVersion((v) => v + 1);
        }
      } catch (e: any) {
        if (!cancelled) {
          setBaseTrades([]);
          setBaseVersion((v) => v + 1);
          setError(e?.message ?? 'Failed to load trades');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          if (dataMode === 'on-chain') setOnChainLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataMode, solanaAddress, csvText, onChainRunId, setOnChainLoading]);

  const filteredTrades = useMemo(() => {
    return filterTrades(baseTrades, {
      symbol: selectedSymbol,
      from: dateRange.from,
      to: dateRange.to,
    });
  }, [baseTrades, selectedSymbol, dateRange.from, dateRange.to]);

  const metricsKey = useMemo(() => {
    const from = dateRange.from ? dateRange.from.toISOString() : null;
    const to = dateRange.to ? dateRange.to.toISOString() : null;
    return JSON.stringify({ baseVersion, selectedSymbol: selectedSymbol ?? null, from, to });
  }, [baseVersion, selectedSymbol, dateRange.from, dateRange.to]);

  const metrics = useMemo(() => {
    const cache = metricsCacheRef.current;
    const hit = cache.get(metricsKey);
    if (hit) return hit;

    const computed = computeMetrics(filteredTrades);

    cache.set(metricsKey, computed);
    // simple LRU-ish cap
    if (cache.size > 25) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return computed;
  }, [filteredTrades, metricsKey]);

  return {
    trades: filteredTrades,
    metrics,
    loading,
    error,
    setCsv,
  };
}
