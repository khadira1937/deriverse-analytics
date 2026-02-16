import { z } from 'zod';

export const KpiSchema = z.object({
  totalPnL: z.number(),
  pnlPercent: z.number().optional(),
  winRate: z.number(),
  tradeCount: z.number(),
  totalVolume: z.number(),
  totalFees: z.number(),
  avgTradeDurationHours: z.number(),
  longShortRatio: z.number(),
  largestGain: z.number(),
  largestLoss: z.number(),
  avgWin: z.number(),
  avgLoss: z.number(),
  riskReward: z.number(),
});
export type Kpis = z.infer<typeof KpiSchema>;

export const EquityPointSchema = z.object({
  ts: z.date(),
  cumPnL: z.number(),
  equity: z.number(),
  drawdown: z.number(),
  maxDrawdown: z.number(),
});
export type EquityPoint = z.infer<typeof EquityPointSchema>;

export const DailyPointSchema = z.object({
  day: z.string(), // YYYY-MM-DD
  pnl: z.number(),
  trades: z.number(),
});
export type DailyPoint = z.infer<typeof DailyPointSchema>;

export const SymbolPerfSchema = z.object({
  symbol: z.string(),
  trades: z.number(),
  pnl: z.number(),
  winRate: z.number(),
  volume: z.number(),
});
export type SymbolPerf = z.infer<typeof SymbolPerfSchema>;

export const MetricsResultSchema = z.object({
  kpis: KpiSchema,
  equityCurve: z.array(EquityPointSchema),
  daily: z.array(DailyPointSchema),
  symbols: z.array(SymbolPerfSchema),
});
export type MetricsResult = z.infer<typeof MetricsResultSchema>;
