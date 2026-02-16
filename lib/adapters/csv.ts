import { z } from 'zod';
import type { NormalizedTrade, NormalizedOrderType, NormalizedSide } from '@/lib/domain/trade';

export type CsvImportResult =
  | { ok: true; trades: NormalizedTrade[] }
  | { ok: false; error: string };

const HEADER_SYNONYMS: Record<string, string[]> = {
  timestamp: ['timestamp', 'time', 'ts', 'date'],
  symbol: ['symbol', 'market', 'pair', 'instrument'],
  side: ['side', 'direction', 'position_side'],
  entry: ['entry', 'entryprice', 'entry_price', 'open', 'openprice', 'avg_entry'],
  exit: ['exit', 'exitprice', 'exit_price', 'close', 'closeprice', 'avg_exit'],
  size: ['size', 'qty', 'quantity', 'amount'],
  pnl: ['pnl', 'profit', 'profit_usd', 'realized_pnl', 'pnl_usd'],
  fees: ['fees', 'fee', 'commission', 'cost', 'fees_usd'],
  duration: ['duration', 'duration_hours', 'holding_hours', 'hold_hours'],
  orderType: ['ordertype', 'order_type', 'type'],
  tags: ['tags', 'tag'],
  notes: ['notes', 'note', 'comment', 'memo'],
};

function normHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '');
}

function findHeaderIndex(headers: string[], key: keyof typeof HEADER_SYNONYMS): number {
  const candidates = new Set(HEADER_SYNONYMS[key].map(normHeader));
  return headers.findIndex((h) => candidates.has(normHeader(h)));
}

function parseCsv(text: string): string[][] {
  // Minimal CSV parser supporting quotes
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (ch === ',' || ch === ';' || ch === '\t')) {
      cur.push(cell.trim());
      cell = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i++;
      cur.push(cell.trim());
      cell = '';
      if (cur.some((c) => c.length > 0)) rows.push(cur);
      cur = [];
      continue;
    }

    cell += ch;
  }

  cur.push(cell.trim());
  if (cur.some((c) => c.length > 0)) rows.push(cur);
  return rows;
}

const IsoOrDateSchema = z.preprocess((v) => {
  if (v instanceof Date) return v;
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}, z.date());

const NumSchema = z.preprocess((v) => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}, z.number());

function parseSide(raw: string): NormalizedSide {
  const s = raw.trim().toLowerCase();
  if (['long', 'buy', 'b'].includes(s)) return 'long';
  if (['short', 'sell', 's'].includes(s)) return 'short';
  // default
  return 'long';
}

function parseOrderType(raw: string): NormalizedOrderType {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '_');
  if (!s) return 'unknown';
  if (s.includes('limit')) return 'limit';
  if (s.includes('market')) return 'market';
  if (s.includes('ioc')) return 'ioc';
  if (s.includes('post')) return 'post_only';
  return 'unknown';
}

export function getCsvTemplate(): string {
  return [
    'timestamp,symbol,side,entry,exit,size,pnl,fees,duration_hours,orderType,tags,notes',
    '2026-02-16T10:00:00Z,SOL/USDC,long,100.0,105.0,2,10,0.2,4.0,limit,"breakout;A+","Clean setup, followed plan"',
    '2026-02-16T12:30:00Z,SOL/USDC,short,105.0,108.0,1,-3,0.15,1.5,market,"reversal","FOMO entry"',
  ].join('\n');
}

export function parseTradesCsv(csvText: string): CsvImportResult {
  const text = csvText.trim();
  if (!text) return { ok: false, error: 'CSV is empty. Please upload a file or paste CSV content.' };

  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { ok: false, error: 'CSV must include a header row and at least 1 trade row.' };
  }

  const headers = rows[0];

  const idxTimestamp = findHeaderIndex(headers, 'timestamp');
  const idxSymbol = findHeaderIndex(headers, 'symbol');
  const idxSide = findHeaderIndex(headers, 'side');
  const idxEntry = findHeaderIndex(headers, 'entry');
  const idxExit = findHeaderIndex(headers, 'exit');
  const idxSize = findHeaderIndex(headers, 'size');
  const idxPnl = findHeaderIndex(headers, 'pnl');
  const idxFees = findHeaderIndex(headers, 'fees');
  const idxDuration = findHeaderIndex(headers, 'duration');
  const idxOrderType = findHeaderIndex(headers, 'orderType');
  const idxTags = findHeaderIndex(headers, 'tags');
  const idxNotes = findHeaderIndex(headers, 'notes');

  const missing: string[] = [];
  if (idxTimestamp === -1) missing.push('timestamp');
  if (idxSymbol === -1) missing.push('symbol');
  if (idxSide === -1) missing.push('side');
  if (idxPnl === -1) missing.push('pnl');

  if (missing.length) {
    return {
      ok: false,
      error: `Missing required CSV column(s): ${missing.join(', ')}. Download the template for the recommended format.`,
    };
  }

  const trades: NormalizedTrade[] = [];
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    const rawTimestamp = row[idxTimestamp] ?? '';
    const rawSymbol = row[idxSymbol] ?? '';
    const rawSide = row[idxSide] ?? '';
    const rawPnl = row[idxPnl] ?? '';

    const tsParsed = IsoOrDateSchema.safeParse(rawTimestamp);
    if (!tsParsed.success) {
      errors.push(`Row ${r + 1}: invalid timestamp "${rawTimestamp}"`);
      continue;
    }

    const symbol = rawSymbol.trim();
    if (!symbol) {
      errors.push(`Row ${r + 1}: symbol is empty`);
      continue;
    }

    const pnlParsed = NumSchema.safeParse(rawPnl);
    if (!pnlParsed.success) {
      errors.push(`Row ${r + 1}: invalid pnl "${rawPnl}"`);
      continue;
    }

    const feesVal = idxFees >= 0 ? NumSchema.safeParse(row[idxFees] ?? '') : null;
    const entryVal = idxEntry >= 0 ? NumSchema.safeParse(row[idxEntry] ?? '') : null;
    const exitVal = idxExit >= 0 ? NumSchema.safeParse(row[idxExit] ?? '') : null;
    const sizeVal = idxSize >= 0 ? NumSchema.safeParse(row[idxSize] ?? '') : null;
    const durationVal = idxDuration >= 0 ? NumSchema.safeParse(row[idxDuration] ?? '') : null;

    const orderTypeRaw = idxOrderType >= 0 ? (row[idxOrderType] ?? '') : '';
    const tagsRaw = idxTags >= 0 ? (row[idxTags] ?? '') : '';
    const notesRaw = idxNotes >= 0 ? (row[idxNotes] ?? '') : '';

    const tags = tagsRaw
      ? tagsRaw
          .split(/[;,]/g)
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const trade: NormalizedTrade = {
      id: `csv-${r}`,
      ts: tsParsed.data,
      symbol,
      side: parseSide(rawSide),
      orderType: parseOrderType(orderTypeRaw),
      entryPrice: entryVal?.success ? entryVal.data : null,
      exitPrice: exitVal?.success ? exitVal.data : null,
      size: sizeVal?.success ? sizeVal.data : null,
      pnlUsd: pnlParsed.data,
      feesUsd: feesVal?.success ? feesVal.data : 0,
      durationSec: durationVal?.success ? Math.round(durationVal.data * 3600) : null,
      tags,
      notes: notesRaw?.trim?.() ? String(notesRaw).trim() : '',
    };

    trades.push(trade);
  }

  if (!trades.length) {
    return {
      ok: false,
      error: errors.length
        ? `CSV import failed. First errors: ${errors.slice(0, 3).join(' | ')}`
        : 'CSV import produced 0 trades.',
    };
  }

  if (errors.length) {
    // partial import: still return ok, but include a hint in the error string? better: fail hard.
    return {
      ok: false,
      error: `CSV has ${errors.length} invalid row(s). Fix them and retry. First errors: ${errors.slice(0, 5).join(' | ')}`,
    };
  }

  // newest first (match app feel)
  trades.sort((a, b) => b.ts.getTime() - a.ts.getTime());
  return { ok: true, trades };
}
