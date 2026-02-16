import { Trade, TradeOutcome } from '@/lib/types';

const SYMBOLS = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'JUP/USDC', 'RAY/USDC', 'ORCA/USDC'];
const ORDER_TYPES = ['Limit', 'Market', 'IOC', 'Post-only'] as const;

function generateRandomTrade(index: number): Trade {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));

  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side = Math.random() > 0.5 ? 'Long' : 'Short';
  const entryPrice = Math.random() * 100 + 50;
  const pnlPercent = (Math.random() - 0.4) * 10;
  const exitPrice = entryPrice * (1 + pnlPercent / 100);
  const size = Math.floor(Math.random() * 1000) + 100;
  const pnl = (exitPrice - entryPrice) * size;
  const fees = Math.abs(pnl) * (Math.random() * 0.005 + 0.001);
  const duration = Math.random() * 24 + 0.5;
  const outcome: TradeOutcome = pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven';

  return {
    id: `trade-${index}`,
    timestamp: date,
    symbol,
    side,
    entryPrice: parseFloat(entryPrice.toFixed(4)),
    exitPrice: parseFloat(exitPrice.toFixed(4)),
    size,
    pnl: parseFloat(pnl.toFixed(2)),
    pnlPercent: parseFloat(pnlPercent.toFixed(2)),
    fees: parseFloat(fees.toFixed(2)),
    duration,
    orderType: ORDER_TYPES[Math.floor(Math.random() * ORDER_TYPES.length)],
    tags: Math.random() > 0.5 ? ['scalp'] : Math.random() > 0.5 ? ['swing'] : [],
    notes: Math.random() > 0.7 ? 'Good risk/reward setup' : '',
    outcome,
  };
}

export function generateMockTrades(count: number = 150): Trade[] {
  return Array.from({ length: count }, (_, i) => generateRandomTrade(i)).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}

export const DEMO_TRADES = generateMockTrades();
