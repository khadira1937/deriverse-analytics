'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '@/lib/types';
import { loadJournalEntries, saveJournalEntries } from '@/lib/storage/journal-entries';
import { DEMO_JOURNAL_ENTRIES } from '@/lib/mock/journal';

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>(DEMO_JOURNAL_ENTRIES);

  useEffect(() => {
    setEntries(loadJournalEntries(DEMO_JOURNAL_ENTRIES));
  }, []);

  const add = useCallback((entry: JournalEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev];
      saveJournalEntries(next);
      return next;
    });
  }, []);

  const update = useCallback((entry: JournalEntry) => {
    setEntries((prev) => {
      const next = prev.map((e) => (e.id === entry.id ? entry : e));
      saveJournalEntries(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveJournalEntries(next);
      return next;
    });
  }, []);

  return useMemo(() => ({ entries, add, update, remove }), [entries, add, update, remove]);
}
