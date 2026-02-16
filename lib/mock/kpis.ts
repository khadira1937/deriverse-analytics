import { DashboardKPIs, DailyPnLPoint, EquityCurvePoint, SymbolPerformance, TimeOfDayPerformance } from '@/lib/types';
import { DEMO_TRADES } from './trades';

export function calculateKPIs(): DashboardKPIs {
  const trades = DEMO_TRADES;
  const winTrades = trades.filter((t) => t.pnl > 0);
  const lossTrades = trades.filter((t) => t.pnl < 0);

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalVolume = trades.reduce((sum, t) => sum + t.size, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);

  return {
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    pnlPercent: parseFloat(((totalPnL / (totalVolume * 50)) * 100).toFixed(2)),
    winRate: parseFloat(((winTrades.length / trades.length) * 100).toFixed(2)),
    tradeCount: trades.length,
    totalVolume: parseFloat(totalVolume.toFixed(2)),
    totalFees: parseFloat(totalFees.toFixed(2)),
    avgTradeDuration: parseFloat(
      (trades.reduce((sum, t) => sum + t.duration, 0) / trades.length).toFixed(2),
    ),
    longShortRatio: parseFloat(
      (trades.filter((t) => t.side === 'Long').length / trades.filter((t) => t.side === 'Short').length).toFixed(2),
    ),
    largestGain: parseFloat(Math.max(...trades.map((t) => t.pnl)).toFixed(2)),
    largestLoss: parseFloat(Math.min(...trades.map((t) => t.pnl)).toFixed(2)),
    avgWin: parseFloat((winTrades.reduce((sum, t) => sum + t.pnl, 0) / winTrades.length).toFixed(2)) || 0,
    avgLoss: parseFloat((lossTrades.reduce((sum, t) => sum + t.pnl, 0) / lossTrades.length).toFixed(2)) || 0,
  };
}

export function generateEquityCurve(): EquityCurvePoint[] {
  const trades = DEMO_TRADES;
  const sortedTrades = [...trades].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let cumPnL = 0;
  let maxEquity = 10000;
  const points: EquityCurvePoint[] = [];

  sortedTrades.forEach((trade) => {
    cumPnL += trade.pnl;
    const equity = 10000 + cumPnL;
    maxEquity = Math.max(maxEquity, equity);
    const drawdown = ((maxEquity - equity) / maxEquity) * 100;

    points.push({
      timestamp: trade.timestamp,
      equity,
      cumPnL,
      drawdown,
      maxDrawdown: drawdown,
    });
  });

  return points;
}

export function generateDailyPnL(): DailyPnLPoint[] {
  const trades = DEMO_TRADES;
  const dailyMap = new Map<string, { pnl: number; trades: number }>();

  trades.forEach((trade) => {
    const dateKey = trade.timestamp.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey) || { pnl: 0, trades: 0 };
    dailyMap.set(dateKey, {
      pnl: existing.pnl + trade.pnl,
      trades: existing.trades + 1,
    });
  });

  return Array.from(dailyMap.entries())
    .map(([date, { pnl, trades }]) => ({
      date: new Date(date),
      pnl: parseFloat(pnl.toFixed(2)),
      trades,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function generateSymbolPerformance(): SymbolPerformance[] {
  const trades = DEMO_TRADES;
  const symbolMap = new Map<string, { pnl: number; trades: number; wins: number; volume: number }>();

  trades.forEach((trade) => {
    const existing = symbolMap.get(trade.symbol) || { pnl: 0, trades: 0, wins: 0, volume: 0 };
    symbolMap.set(trade.symbol, {
      pnl: existing.pnl + trade.pnl,
      trades: existing.trades + 1,
      wins: existing.wins + (trade.pnl > 0 ? 1 : 0),
      volume: existing.volume + trade.size,
    });
  });

  return Array.from(symbolMap.entries())
    .map(([symbol, { pnl, trades, wins, volume }]) => ({
      symbol,
      trades,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(((pnl / (volume * 50)) * 100).toFixed(2)),
      winRate: parseFloat(((wins / trades) * 100).toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

export function generateTimeOfDayPerformance(): TimeOfDayPerformance[] {
  const trades = DEMO_TRADES;
  const timeSlots = [
    { time: '00:00-04:00', label: 'Morning' },
    { time: '04:00-12:00', label: 'Morning' },
    { time: '12:00-18:00', label: 'Afternoon' },
    { time: '18:00-24:00', label: 'Night' },
  ];

  const result: TimeOfDayPerformance[] = [];

  for (let hour = 0; hour < 24; hour += 3) {
    const dayTrades = trades.filter((t) => {
      const h = t.timestamp.getHours();
      return h >= hour && h < hour + 3;
    });

    const session = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Night';
    const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);

    result.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      [session]: parseFloat(pnl.toFixed(2)),
      Morning: session === 'Morning' ? parseFloat(pnl.toFixed(2)) : 0,
      Afternoon: session === 'Afternoon' ? parseFloat(pnl.toFixed(2)) : 0,
      Night: session === 'Night' ? parseFloat(pnl.toFixed(2)) : 0,
    });
  }

  return result;
}

export const DEMO_KPIS = calculateKPIs();
export const DEMO_EQUITY_CURVE = generateEquityCurve();
export const DEMO_DAILY_PNL = generateDailyPnL();
export const DEMO_SYMBOL_PERFORMANCE = generateSymbolPerformance();
export const DEMO_TIME_OF_DAY = generateTimeOfDayPerformance();
