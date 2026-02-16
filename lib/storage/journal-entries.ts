import { z } from 'zod';
import type { JournalEntry } from '@/lib/types';

const LS_KEY = 'derivision.journalEntries.v1';

// We store timestamps as ISO strings in localStorage
const StoredJournalEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  title: z.string(),
  symbols: z.array(z.string()),
  setupType: z.string(),
  confidence: z.number(),
  outcome: z.any().nullable(),
  mistakeType: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  linkedTradeIds: z.array(z.string()),
});

type StoredJournalEntry = z.infer<typeof StoredJournalEntrySchema>;

export function loadJournalEntries(fallback: JournalEntry[]): JournalEntry[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;

    const out: JournalEntry[] = [];
    for (const item of parsed) {
      const res = StoredJournalEntrySchema.safeParse(item);
      if (!res.success) continue;
      const e = res.data;
      out.push({
        id: e.id,
        timestamp: new Date(e.timestamp),
        title: e.title,
        symbols: e.symbols,
        setupType: e.setupType as any,
        confidence: e.confidence,
        outcome: e.outcome as any,
        mistakeType: e.mistakeType as any,
        notes: e.notes,
        tags: e.tags,
        linkedTradeIds: e.linkedTradeIds,
      });
    }

    return out.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch {
    return fallback;
  }
}

export function saveJournalEntries(entries: JournalEntry[]) {
  if (typeof window === 'undefined') return;
  const stored: StoredJournalEntry[] = entries.map((e) => ({
    ...e,
    timestamp: new Date(e.timestamp).toISOString(),
  })) as any;

  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(stored));
  } catch {}
}
