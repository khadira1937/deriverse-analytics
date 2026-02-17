import type { NormalizedTrade } from '@/lib/domain/trade';
import type {
  MetricsResult,
  Kpis,
  EquityPoint,
  DailyPoint,
  SymbolPerf,
} from '@/lib/domain/metrics';

function dayKey(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function computeMetrics(trades: NormalizedTrade[], opts?: { startingEquity?: number }): MetricsResult {
  const startingEquity = opts?.startingEquity ?? 10_000;
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

  // Volume: if price+size present, treat as notional; otherwise sum size.
  const totalVolume = sorted.reduce((s, t) => {
    if (t.entryPrice != null && t.size != null) return s + t.entryPrice * t.size;
    return s + (t.size ?? 0);
  }, 0);

  const avgTradeDurationHours = tradeCount
    ? sorted.reduce((s, t) => s + ((t.durationSec ?? 0) / 3600), 0) / tradeCount
    : 0;

  const riskReward = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : 0;

  // Equity curve + drawdown (%)
  let cumPnL = 0;
  let equity = startingEquity;
  let peakEquity = startingEquity;
  let maxDrawdownPct = 0;

  const equityCurve: EquityPoint[] = sorted.map((t) => {
    cumPnL += t.pnlUsd;
    equity = startingEquity + cumPnL;
    peakEquity = Math.max(peakEquity, equity);

    const drawdownPct = peakEquity > 0 ? ((peakEquity - equity) / peakEquity) * 100 : 0;
    maxDrawdownPct = Math.max(maxDrawdownPct, drawdownPct);

    return {
      ts: t.ts,
      cumPnL,
      equity,
      drawdown: drawdownPct,
      maxDrawdown: maxDrawdownPct,
    };
  });

  // Daily PnL
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

  // Symbol performance
  const sym = new Map<string, { pnl: number; trades: number; wins: number; volume: number }>();
  for (const t of sorted) {
    const cur = sym.get(t.symbol) ?? { pnl: 0, trades: 0, wins: 0, volume: 0 };
    cur.pnl += t.pnlUsd;
    cur.trades += 1;
    cur.wins += t.pnlUsd > 0 ? 1 : 0;
    if (t.entryPrice != null && t.size != null) cur.volume += t.entryPrice * t.size;
    else cur.volume += t.size ?? 0;
    sym.set(t.symbol, cur);
  }
  const symbols: SymbolPerf[] = [...sym.entries()]
    .map(([symbol, v]) => ({
      symbol,
      trades: v.trades,
      pnl: v.pnl,
      winRate: v.trades ? (v.wins / v.trades) * 100 : 0,
      volume: v.volume,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  // Fee composition (best-effort)
  // If fee breakdown exists (demo mode or enriched sources), aggregate it.
  // Otherwise, keep everything under "other".
  const makerFees = sorted.reduce((s, t) => s + (t.feeMakerUsd ?? 0), 0);
  const takerFees = sorted.reduce((s, t) => s + (t.feeTakerUsd ?? 0), 0);
  const fundingFees = sorted.reduce((s, t) => s + (t.feeFundingUsd ?? 0), 0);
  const derived = makerFees + takerFees + fundingFees;
  const otherFees = Math.max(0, totalFees - derived);

  // Cumulative fees series per day
  let cumFees = 0;
  const cumulativeFeesByDay: Array<{ day: string; cumFees: number }> = [];
  for (const d of daily) {
    const feesForDay = sorted
      .filter((t) => dayKey(t.ts) === d.day)
      .reduce((s, t) => s + t.feesUsd, 0);
    cumFees += feesForDay;
    cumulativeFeesByDay.push({ day: d.day, cumFees });
  }

  // Order type performance
  const orderMap = new Map<string, { trades: number; pnl: number; winRate: number; wins: number }>();
  for (const t of sorted) {
    const key = t.orderType;
    const cur = orderMap.get(key) ?? { trades: 0, pnl: 0, winRate: 0, wins: 0 };
    cur.trades += 1;
    cur.pnl += t.pnlUsd;
    cur.wins += t.pnlUsd > 0 ? 1 : 0;
    orderMap.set(key, cur);
  }
  const orderTypePerformance = [...orderMap.entries()].map(([orderType, v]) => ({
    orderType,
    trades: v.trades,
    pnl: v.pnl,
    winRate: v.trades ? (v.wins / v.trades) * 100 : 0,
  }));

  // Time-of-day buckets (0..23) and sessions
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, pnl: 0, trades: 0, wins: 0, winRate: 0 }));
  const sessionBuckets = {
    morning: { pnl: 0, trades: 0, wins: 0, winRate: 0, durHours: 0, avgDurationHours: 0, totalFees: 0 }, // 06-11
    afternoon: { pnl: 0, trades: 0, wins: 0, winRate: 0, durHours: 0, avgDurationHours: 0, totalFees: 0 }, // 12-17
    night: { pnl: 0, trades: 0, wins: 0, winRate: 0, durHours: 0, avgDurationHours: 0, totalFees: 0 }, // 18-23
    overnight: { pnl: 0, trades: 0, wins: 0, winRate: 0, durHours: 0, avgDurationHours: 0, totalFees: 0 }, // 00-05
  };

  for (const t of sorted) {
    const h = t.ts.getHours();
    const isWin = t.pnlUsd > 0;

    hourBuckets[h].pnl += t.pnlUsd;
    hourBuckets[h].trades += 1;
    hourBuckets[h].wins += isWin ? 1 : 0;

    const session =
      h >= 6 && h <= 11
        ? 'morning'
        : h >= 12 && h <= 17
          ? 'afternoon'
          : h >= 18 && h <= 23
            ? 'night'
            : 'overnight';

    sessionBuckets[session].pnl += t.pnlUsd;
    sessionBuckets[session].trades += 1;
    sessionBuckets[session].wins += isWin ? 1 : 0;
    sessionBuckets[session].durHours += (t.durationSec ?? 0) / 3600;
    sessionBuckets[session].totalFees += t.feesUsd;
  }

  for (const b of hourBuckets) {
    b.winRate = b.trades ? (b.wins / b.trades) * 100 : 0;
    // drop internal
    delete (b as any).wins;
  }

  for (const key of Object.keys(sessionBuckets) as Array<keyof typeof sessionBuckets>) {
    const b = sessionBuckets[key];
    b.winRate = b.trades ? (b.wins / b.trades) * 100 : 0;
    b.avgDurationHours = b.trades ? b.durHours / b.trades : 0;
    // drop internals
    delete (b as any).wins;
    delete (b as any).durHours;
  }

  // Directional bias
  const longPnL = sorted.filter((t) => t.side === 'long').reduce((s, t) => s + t.pnlUsd, 0);
  const shortPnL = sorted.filter((t) => t.side === 'short').reduce((s, t) => s + t.pnlUsd, 0);
  const directionBias = {
    long: { trades: longCount, pnl: longPnL },
    short: { trades: shortCount, pnl: shortPnL },
  };

  // PnL percent: use starting equity baseline to avoid nonsense
  const pnlPercent = startingEquity > 0 ? (totalPnL / startingEquity) * 100 : 0;

  const kpis: Kpis = {
    totalPnL,
    pnlPercent: clamp(pnlPercent, -10_000, 10_000),
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

  return {
    kpis,
    equityCurve,
    daily,
    symbols,
    // extended fields
    feeComposition: {
      maker: makerFees,
      taker: takerFees,
      funding: fundingFees,
      other: otherFees,
      total: totalFees,
    },
    cumulativeFeesByDay,
    orderTypePerformance,
    timeOfDay: hourBuckets,
    sessionPerformance: sessionBuckets,
    directionBias,
    maxDrawdownPct: maxDrawdownPct,
  } as MetricsResult;
}
