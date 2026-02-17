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
  drawdown: z.number(), // percentage
  maxDrawdown: z.number(), // percentage
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

export const FeeCompositionSchema = z.object({
  maker: z.number(),
  taker: z.number(),
  funding: z.number(),
  other: z.number(),
  total: z.number(),
});
export type FeeComposition = z.infer<typeof FeeCompositionSchema>;

export const CumulativeFeesPointSchema = z.object({
  day: z.string(),
  cumFees: z.number(),
});
export type CumulativeFeesPoint = z.infer<typeof CumulativeFeesPointSchema>;

export const OrderTypePerfSchema = z.object({
  orderType: z.string(),
  trades: z.number(),
  pnl: z.number(),
  winRate: z.number(),
});
export type OrderTypePerf = z.infer<typeof OrderTypePerfSchema>;

export const TimeOfDayBucketSchema = z.object({
  hour: z.number().int().min(0).max(23),
  pnl: z.number(),
  trades: z.number(),
  winRate: z.number(),
});
export type TimeOfDayBucket = z.infer<typeof TimeOfDayBucketSchema>;

export const SessionBucketSchema = z.object({
  pnl: z.number(),
  trades: z.number(),
  winRate: z.number(),
  avgDurationHours: z.number(),
  totalFees: z.number(),
});
export type SessionBucket = z.infer<typeof SessionBucketSchema>;

export const SessionPerfSchema = z.object({
  morning: SessionBucketSchema,
  afternoon: SessionBucketSchema,
  night: SessionBucketSchema,
  overnight: SessionBucketSchema,
});
export type SessionPerf = z.infer<typeof SessionPerfSchema>;

export const DirectionBiasSchema = z.object({
  long: z.object({ pnl: z.number(), trades: z.number() }),
  short: z.object({ pnl: z.number(), trades: z.number() }),
});
export type DirectionBias = z.infer<typeof DirectionBiasSchema>;

export const MetricsResultSchema = z.object({
  kpis: KpiSchema,
  equityCurve: z.array(EquityPointSchema),
  daily: z.array(DailyPointSchema),
  symbols: z.array(SymbolPerfSchema),

  // Phase C additions
  feeComposition: FeeCompositionSchema.optional(),
  cumulativeFeesByDay: z.array(CumulativeFeesPointSchema).optional(),
  orderTypePerformance: z.array(OrderTypePerfSchema).optional(),
  timeOfDay: z.array(TimeOfDayBucketSchema).optional(),
  sessionPerformance: SessionPerfSchema.optional(),
  directionBias: DirectionBiasSchema.optional(),
  maxDrawdownPct: z.number().optional(),
});
export type MetricsResult = z.infer<typeof MetricsResultSchema>;
