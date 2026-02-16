import type { NormalizedTrade } from '@/lib/domain/trade';
import type { MetricsResult } from '@/lib/domain/metrics';

export type Insights = {
  streaks: {
    currentWin: number;
    currentLoss: number;
    maxWin: number;
    maxLoss: number;
  };
  overtrading: {
    flaggedDays: Array<{ day: string; trades: number }>;
    threshold: number;
  };
  feeDrag: {
    grossProfit: number;
    totalFees: number;
    feeToGrossProfitPct: number; // 0..inf
    warning: boolean;
  };
  bestWorstHour: {
    bestHour: { hour: number; pnl: number; trades: number } | null;
    worstHour: { hour: number; pnl: number; trades: number } | null;
  };
};

function dayKey(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function computeStreaks(trades: NormalizedTrade[]) {
  const sorted = [...trades].sort((a, b) => a.ts.getTime() - b.ts.getTime());
  let currentWin = 0;
  let currentLoss = 0;
  let maxWin = 0;
  let maxLoss = 0;

  for (const t of sorted) {
    if (t.pnlUsd > 0) {
      currentWin += 1;
      currentLoss = 0;
    } else if (t.pnlUsd < 0) {
      currentLoss += 1;
      currentWin = 0;
    } else {
      // breakeven breaks streaks
      currentWin = 0;
      currentLoss = 0;
    }
    maxWin = Math.max(maxWin, currentWin);
    maxLoss = Math.max(maxLoss, currentLoss);
  }

  // Determine current streak from tail
  currentWin = 0;
  currentLoss = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    if (t.pnlUsd > 0) {
      if (currentLoss > 0) break;
      currentWin++;
    } else if (t.pnlUsd < 0) {
      if (currentWin > 0) break;
      currentLoss++;
    } else {
      break;
    }
  }

  return { currentWin, currentLoss, maxWin, maxLoss };
}

export function computeOvertrading(trades: NormalizedTrade[], threshold = 25) {
  const map = new Map<string, number>();
  for (const t of trades) {
    const k = dayKey(t.ts);
    map.set(k, (map.get(k) ?? 0) + 1);
  }

  const flaggedDays = [...map.entries()]
    .filter(([, c]) => c >= threshold)
    .map(([day, trades]) => ({ day, trades }))
    .sort((a, b) => b.trades - a.trades);

  return { flaggedDays, threshold };
}

export function computeFeeDrag(metrics: MetricsResult, feeWarningPct = 20) {
  const grossProfit = (metrics as any).kpis
    ? Math.max(0, (metrics as any).kpis.totalPnL) // fallback; will be refined below
    : 0;

  // better gross profit: sum of positive pnl from symbols is not available; use trades via caller ideally
  // We'll compute from time-of-day if available? Not reliable. Keep simple here.

  const totalFees = metrics.kpis.totalFees;

  const denom = grossProfit > 0 ? grossProfit : 0;
  const feeToGrossProfitPct = denom > 0 ? (totalFees / denom) * 100 : 0;
  const warning = denom > 0 ? feeToGrossProfitPct >= feeWarningPct : false;

  return { grossProfit, totalFees, feeToGrossProfitPct, warning };
}

export function computeBestWorstHour(metrics: MetricsResult) {
  const buckets = metrics.timeOfDay ?? [];
  if (!buckets.length) return { bestHour: null, worstHour: null };

  const nonEmpty = buckets.filter((b) => b.trades > 0);
  if (!nonEmpty.length) return { bestHour: null, worstHour: null };

  const bestHour = nonEmpty.reduce((best, cur) => (cur.pnl > best.pnl ? cur : best));
  const worstHour = nonEmpty.reduce((worst, cur) => (cur.pnl < worst.pnl ? cur : worst));

  return { bestHour, worstHour };
}

export function computeInsights(args: { trades: NormalizedTrade[]; metrics: MetricsResult }): Insights {
  const { trades, metrics } = args;

  const streaks = computeStreaks(trades);
  const overtrading = computeOvertrading(trades, 25);

  // Fee drag: compute gross profit properly from trades
  const grossProfit = trades.reduce((s, t) => (t.pnlUsd > 0 ? s + t.pnlUsd : s), 0);
  const totalFees = metrics.kpis.totalFees;
  const feeToGrossProfitPct = grossProfit > 0 ? (totalFees / grossProfit) * 100 : 0;
  const feeDrag = {
    grossProfit,
    totalFees,
    feeToGrossProfitPct,
    warning: grossProfit > 0 ? feeToGrossProfitPct >= 20 : false,
  };

  const bestWorstHour = computeBestWorstHour(metrics);

  return { streaks, overtrading, feeDrag, bestWorstHour };
}
