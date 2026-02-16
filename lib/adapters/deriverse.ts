import type { NormalizedTrade } from '@/lib/domain/trade';

export type DeriverseFetchResult =
  | { ok: true; trades: NormalizedTrade[] }
  | { ok: false; error: string };

export interface DeriverseEnv {
  rpcUrl: string;
  programId: string;
  version: number;
}

// Phase A stub: Phase D will implement SDK fetch + mapping.
export async function fetchDeriverseTrades(_env: DeriverseEnv, _traderAddress: string): Promise<DeriverseFetchResult> {
  return { ok: false, error: 'On-chain Deriverse fetch not implemented yet (Phase D).' };
}
