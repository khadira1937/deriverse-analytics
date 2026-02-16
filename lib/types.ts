export type OrderType = 'Limit' | 'Market' | 'IOC' | 'Post-only';
export type OrderSide = 'Long' | 'Short';
export type TradeOutcome = 'Win' | 'Loss' | 'Breakeven';
export type SetupType = 'Breakout' | 'Retracement' | 'Range' | 'Reversal' | 'Other';
export type MistakeType = 'Over-trading' | 'Missed TP' | 'Wrong Entry' | 'Bad Risk/Reward' | 'Emotional' | 'None';
export type DataMode = 'on-chain' | 'csv' | 'demo';
export type TimeSession = 'Morning' | 'Afternoon' | 'Night';

export interface Trade {
  id: string;
  timestamp: Date;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  duration: number; // in hours
  orderType: OrderType;
  tags: string[];
  notes: string;
  outcome: TradeOutcome;
}

export interface Position {
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  unrealizedFees: number;
  openTime: Date;
}

export interface Fee {
  timestamp: Date;
  symbol: string;
  maker: number;
  taker: number;
  other: number;
  total: number;
}

export interface JournalEntry {
  id: string;
  timestamp: Date;
  title: string;
  symbols: string[];
  setupType: SetupType;
  confidence: number; // 1-10
  outcome: TradeOutcome | null;
  mistakeType: MistakeType;
  notes: string;
  tags: string[];
  linkedTradeIds: string[];
}

export interface DashboardKPIs {
  totalPnL: number;
  pnlPercent: number;
  winRate: number;
  tradeCount: number;
  totalVolume: number;
  totalFees: number;
  avgTradeDuration: number;
  longShortRatio: number;
  largestGain: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
}

export interface EquityCurvePoint {
  timestamp: Date;
  equity: number;
  cumPnL: number;
  drawdown: number;
  maxDrawdown: number;
}

export interface DailyPnLPoint {
  date: Date;
  pnl: number;
  trades: number;
}

export interface TimeOfDayPerformance {
  time: string;
  Morning: number;
  Afternoon: number;
  Night: number;
}

export interface SymbolPerformance {
  symbol: string;
  trades: number;
  pnl: number;
  pnlPercent: number;
  winRate: number;
  volume: number;
}
