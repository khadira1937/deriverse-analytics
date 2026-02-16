import { Trade, TradeOutcome } from '@/lib/types';

const SYMBOLS = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'JUP/USDC', 'RAY/USDC', 'ORCA/USDC'] as const;
const ORDER_TYPES = ['Limit', 'Market', 'IOC', 'Post-only'] as const;

function mulberry32(seed: number) {
  // deterministic PRNG for consistent SSR/CSR output
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function genTrade(index: number, rand: () => number): Trade {
  const base = new Date('2026-02-16T00:00:00Z');
  base.setUTCDate(base.getUTCDate() - Math.floor(rand() * 30));
  base.setUTCHours(Math.floor(rand() * 24));
  base.setUTCMinutes(Math.floor(rand() * 60));

  const symbol = SYMBOLS[Math.floor(rand() * SYMBOLS.length)];
  const side = rand() > 0.5 ? 'Long' : 'Short';

  const entryPrice = rand() * 100 + 50;
  const pnlPercent = (rand() - 0.4) * 10;
  const exitPrice = entryPrice * (1 + pnlPercent / 100);

  const size = Math.floor(rand() * 1000) + 100;
  const pnl = (exitPrice - entryPrice) * size;
  const fees = Math.abs(pnl) * (rand() * 0.005 + 0.001);
  const duration = rand() * 24 + 0.5;
  const outcome: TradeOutcome = pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven';

  const tags = rand() > 0.5 ? ['scalp'] : rand() > 0.5 ? ['swing'] : [];
  const notes = rand() > 0.7 ? 'Good risk/reward setup' : '';

  return {
    id: `trade-${index}`,
    timestamp: base,
    symbol,
    side,
    entryPrice: parseFloat(entryPrice.toFixed(4)),
    exitPrice: parseFloat(exitPrice.toFixed(4)),
    size,
    pnl: parseFloat(pnl.toFixed(2)),
    pnlPercent: parseFloat(pnlPercent.toFixed(2)),
    fees: parseFloat(fees.toFixed(2)),
    duration,
    orderType: ORDER_TYPES[Math.floor(rand() * ORDER_TYPES.length)],
    tags,
    notes,
    outcome,
  };
}

export function generateMockTrades(count: number = 150, seed = 1337): Trade[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => genTrade(i, rand)).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}

export const DEMO_TRADES = generateMockTrades();
