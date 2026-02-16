import { JournalEntry } from '@/lib/types';

const SETUP_TYPES = ['Breakout', 'Retracement', 'Range', 'Reversal', 'Other'] as const;
const MISTAKE_TYPES = ['Over-trading', 'Missed TP', 'Wrong Entry', 'Bad Risk/Reward', 'Emotional', 'None'] as const;

export function generateMockJournalEntries(count: number = 30): JournalEntry[] {
  const entries: JournalEntry[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

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
      ][Math.floor(Math.random() * 6)],
      symbols: ['SOL/USDC', 'BTC/USDC', 'ETH/USDC'].slice(0, Math.floor(Math.random() * 3) + 1),
      setupType: SETUP_TYPES[Math.floor(Math.random() * SETUP_TYPES.length)],
      confidence: Math.floor(Math.random() * 9) + 1,
      outcome: Math.random() > 0.3 ? (Math.random() > 0.5 ? 'Win' : 'Loss') : null,
      mistakeType: MISTAKE_TYPES[Math.floor(Math.random() * MISTAKE_TYPES.length)],
      notes: [
        'Good risk/reward ratio, tight stops',
        'Hit resistance but bounced well',
        'Over-leveraged on this one',
        'Excellent entry point, perfect execution',
        'Emotional trading after losses',
      ][Math.floor(Math.random() * 5)],
      tags: [
        Math.random() > 0.5 ? 'scalp' : 'swing',
        Math.random() > 0.7 ? 'risky' : 'safe',
      ].filter(() => Math.random() > 0.3),
      linkedTradeIds: [],
    });
  }

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const DEMO_JOURNAL_ENTRIES = generateMockJournalEntries();
