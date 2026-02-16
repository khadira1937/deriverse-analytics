'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/lib/context/app-context';
import { DEMO_KPIS, DEMO_EQUITY_CURVE, DEMO_DAILY_PNL, DEMO_SYMBOL_PERFORMANCE } from '@/lib/mock/kpis';
import { KPICard } from '@/components/dashboard/kpi-card';
import { EquityCurveChart } from '@/components/dashboard/equity-curve-chart';
import { DailyPnLChart } from '@/components/dashboard/daily-pnl-chart';
import { SymbolPerformanceCard } from '@/components/dashboard/symbol-performance-card';
import { Card } from '@/components/ui/card';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { dataMode } = useAppContext();
  const [loading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen p-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">
            Trading Dashboard
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {dataMode === 'demo' && 'Using Demo Dataset'}
            {dataMode === 'csv' && 'Using CSV Import (Simulation)'}
            {dataMode === 'on-chain' && 'Using On-chain Data (Disconnected)'}
          </p>
        </motion.div>

        {/* KPI Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <KPICard
              label="Total PnL"
              value={`$${DEMO_KPIS.totalPnL.toLocaleString()}`}
              change={DEMO_KPIS.pnlPercent}
              trend={DEMO_KPIS.totalPnL > 0 ? 'up' : 'down'}
              variant={DEMO_KPIS.totalPnL > 0 ? 'success' : 'warning'}
              description="Cumulative profit/loss across all trades"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Win Rate"
              value={`${DEMO_KPIS.winRate.toFixed(1)}%`}
              description="Percentage of winning trades"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Trade Count"
              value={DEMO_KPIS.tradeCount}
              description="Total number of trades"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Total Volume"
              value={`${(DEMO_KPIS.totalVolume / 1000).toFixed(1)}K`}
              unit="units"
              description="Total traded volume"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Total Fees"
              value={`$${DEMO_KPIS.totalFees.toFixed(2)}`}
              description="Total trading fees paid"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Avg Trade Duration"
              value={`${DEMO_KPIS.avgTradeDuration.toFixed(1)}h`}
              description="Average holding time per trade"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Long/Short Ratio"
              value={DEMO_KPIS.longShortRatio.toFixed(2)}
              description="Ratio of long to short trades"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Largest Gain"
              value={`$${DEMO_KPIS.largestGain.toFixed(2)}`}
              trend="up"
              variant="success"
              description="Biggest single trade win"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Largest Loss"
              value={`$${Math.abs(DEMO_KPIS.largestLoss).toFixed(2)}`}
              trend="down"
              variant="warning"
              description="Biggest single trade loss"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Avg Win"
              value={`$${DEMO_KPIS.avgWin.toFixed(2)}`}
              variant="success"
              description="Average winning trade size"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Avg Loss"
              value={`$${Math.abs(DEMO_KPIS.avgLoss).toFixed(2)}`}
              variant="warning"
              description="Average losing trade size"
            />
          </motion.div>

          <motion.div variants={item}>
            <KPICard
              label="Risk/Reward"
              value={(Math.abs(DEMO_KPIS.avgWin / DEMO_KPIS.avgLoss) || 0).toFixed(2)}
              description="Ratio of avg win to avg loss"
            />
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equity Curve */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card className="glass-panel border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Equity Curve</h2>
              <EquityCurveChart data={DEMO_EQUITY_CURVE} />
            </Card>
          </motion.div>

          {/* Daily PnL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Card className="glass-panel border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Daily P&L</h2>
              <DailyPnLChart data={DEMO_DAILY_PNL} />
            </Card>
          </motion.div>
        </div>

        {/* Symbol Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Card className="glass-panel border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Symbol Performance</h2>
            <SymbolPerformanceCard data={DEMO_SYMBOL_PERFORMANCE} />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
