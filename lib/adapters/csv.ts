import type { NormalizedTrade } from '@/lib/domain/trade';

export type CsvImportResult =
  | { ok: true; trades: NormalizedTrade[] }
  | { ok: false; error: string };

// Phase A stub: Phase B will implement full parsing + validation + template
export function parseTradesCsv(_csvText: string): CsvImportResult {
  return { ok: false, error: 'CSV import not implemented yet (Phase B).' };
}
