import { JournalEntry } from '@/lib/types';

const SETUP_TYPES = ['Breakout', 'Retracement', 'Range', 'Reversal', 'Other'] as const;
const MISTAKE_TYPES = ['Over-trading', 'Missed TP', 'Wrong Entry', 'Bad Risk/Reward', 'Emotional', 'None'] as const;

function mulberry32(seed: number) {
  // deterministic PRNG for consistent SSR/CSR output
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMockJournalEntries(count: number = 30, seed = 42): JournalEntry[] {
  const rand = mulberry32(seed);
  const entries: JournalEntry[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date('2026-02-16T00:00:00Z');
    date.setUTCDate(date.getUTCDate() - Math.floor(rand() * 30));

    const titleIdx = Math.floor(rand() * 6);
    const symbolCount = Math.floor(rand() * 3) + 1;
    const setupIdx = Math.floor(rand() * SETUP_TYPES.length);
    const confidence = Math.floor(rand() * 9) + 1;
    const hasOutcome = rand() > 0.3;
    const outcome = hasOutcome ? (rand() > 0.5 ? 'Win' : 'Loss') : null;
    const mistakeIdx = Math.floor(rand() * MISTAKE_TYPES.length);
    const notesIdx = Math.floor(rand() * 5);

    const tags = [
      rand() > 0.5 ? 'scalp' : 'swing',
      rand() > 0.7 ? 'risky' : 'safe',
    ].filter(() => rand() > 0.3);

    entries.push({
      id: `entry-${i}`,
      timestamp: date,
      title: [
        'Breakout on SOL resistance',
        'ETH retrace and bounce',
        'BTC range trade setup',
        'Failed entry on JUP',
        'Morning session review',
        'Lunch time analysis',
      ][titleIdx],
      symbols: ['SOL/USDC', 'BTC/USDC', 'ETH/USDC'].slice(0, symbolCount),
      setupType: SETUP_TYPES[setupIdx],
      confidence,
      outcome,
      mistakeType: MISTAKE_TYPES[mistakeIdx],
      notes: [
        'Good risk/reward ratio, tight stops',
        'Hit resistance but bounced well',
        'Over-leveraged on this one',
        'Excellent entry point, perfect execution',
        'Emotional trading after losses',
      ][notesIdx],
      tags,
      linkedTradeIds: [],
    });
  }

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const DEMO_JOURNAL_ENTRIES = generateMockJournalEntries();
