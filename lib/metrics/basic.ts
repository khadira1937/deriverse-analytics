import type { NormalizedTrade } from '@/lib/domain/trade';
import type { MetricsResult, Kpis, EquityPoint, DailyPoint, SymbolPerf } from '@/lib/domain/metrics';

function dayKey(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function computeBasicMetrics(trades: NormalizedTrade[]): MetricsResult {
  const sorted = [...trades].sort((a, b) => a.ts.getTime() - b.ts.getTime());

  const tradeCount = sorted.length;
  const totalPnL = sorted.reduce((s, t) => s + t.pnlUsd, 0);
  const totalFees = sorted.reduce((s, t) => s + t.feesUsd, 0);
  const wins = sorted.filter((t) => t.pnlUsd > 0);
  const losses = sorted.filter((t) => t.pnlUsd < 0);

  const winRate = tradeCount ? (wins.length / tradeCount) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnlUsd, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnlUsd, 0) / losses.length : 0;
  const largestGain = wins.length ? Math.max(...wins.map((t) => t.pnlUsd)) : 0;
  const largestLoss = losses.length ? Math.min(...losses.map((t) => t.pnlUsd)) : 0;

  const longCount = sorted.filter((t) => t.side === 'long').length;
  const shortCount = sorted.filter((t) => t.side === 'short').length;
  const longShortRatio = shortCount ? longCount / shortCount : longCount ? Infinity : 0;

  const totalVolume = sorted.reduce((s, t) => s + (t.size ?? 0), 0);
  const avgTradeDurationHours = tradeCount
    ? sorted.reduce((s, t) => s + ((t.durationSec ?? 0) / 3600), 0) / tradeCount
    : 0;

  const riskReward = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : 0;

  const kpis: Kpis = {
    totalPnL,
    pnlPercent: 0,
    winRate,
    tradeCount,
    totalVolume,
    totalFees,
    avgTradeDurationHours,
    longShortRatio: Number.isFinite(longShortRatio) ? longShortRatio : longCount,
    largestGain,
    largestLoss: Math.abs(largestLoss),
    avgWin,
    avgLoss: Math.abs(avgLoss),
    riskReward,
  };

  // Equity curve (assumes starting equity 0 for now; can be upgraded)
  let cumPnL = 0;
  let peak = 0;
  let maxDrawdown = 0;
  const equityCurve: EquityPoint[] = sorted.map((t) => {
    cumPnL += t.pnlUsd;
    peak = Math.max(peak, cumPnL);
    const drawdown = peak - cumPnL;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    return {
      ts: t.ts,
      cumPnL,
      equity: cumPnL,
      drawdown,
      maxDrawdown,
    };
  });

  // Daily pnl
  const dailyMap = new Map<string, { pnl: number; trades: number }>();
  for (const t of sorted) {
    const key = dayKey(t.ts);
    const cur = dailyMap.get(key) ?? { pnl: 0, trades: 0 };
    cur.pnl += t.pnlUsd;
    cur.trades += 1;
    dailyMap.set(key, cur);
  }
  const daily: DailyPoint[] = [...dailyMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, v]) => ({ day, pnl: v.pnl, trades: v.trades }));

  // Symbol perf
  const sym = new Map<string, { pnl: number; trades: number; wins: number; volume: number }>();
  for (const t of sorted) {
    const cur = sym.get(t.symbol) ?? { pnl: 0, trades: 0, wins: 0, volume: 0 };
    cur.pnl += t.pnlUsd;
    cur.trades += 1;
    cur.wins += t.pnlUsd > 0 ? 1 : 0;
    cur.volume += t.size ?? 0;
    sym.set(t.symbol, cur);
  }
  const symbols: SymbolPerf[] = [...sym.entries()].map(([symbol, v]) => ({
    symbol,
    trades: v.trades,
    pnl: v.pnl,
    winRate: v.trades ? (v.wins / v.trades) * 100 : 0,
    volume: v.volume,
  }));

  return { kpis, equityCurve, daily, symbols };
}
