'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadTradeAnnotations,
  saveTradeAnnotations,
  type TradeAnnotation,
  type TradeAnnotationsMap,
} from '@/lib/storage/trade-annotations';

export function useTradeAnnotations() {
  const [map, setMap] = useState<TradeAnnotationsMap>({});

  useEffect(() => {
    setMap(loadTradeAnnotations());
  }, []);

  const get = useCallback((tradeId: string): TradeAnnotation | undefined => map[tradeId], [map]);

  const upsert = useCallback((tradeId: string, ann: TradeAnnotation) => {
    setMap((prev) => {
      const next = { ...prev, [tradeId]: { ...ann, updatedAt: Date.now() } };
      saveTradeAnnotations(next);
      return next;
    });
  }, []);

  const remove = useCallback((tradeId: string) => {
    setMap((prev) => {
      const next = { ...prev };
      delete next[tradeId];
      saveTradeAnnotations(next);
      return next;
    });
  }, []);

  return useMemo(() => ({ map, get, upsert, remove }), [map, get, upsert, remove]);
}
