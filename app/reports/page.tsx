'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTrades } from '@/hooks/use-trades';
import { computeInsights } from '@/lib/insights/insights';
import { EquityCurveChart } from '@/components/dashboard/equity-curve-chart';
import { DailyPnLChart } from '@/components/dashboard/daily-pnl-chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Copy, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ReportsPage() {
  const { metrics, trades } = useTrades();
  const kpis = metrics.kpis;
  const symbolPerformance = metrics.symbols;
  const dailyPnL = metrics.daily;
  const insights = computeInsights({ trades, metrics });

  const handleExportPDF = () => {
    // Use browser print dialog (users can "Save as PDF")
    window.print();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/reports/share/${Math.random().toString(36).slice(2, 9)}`;
    navigator.clipboard.writeText(link);
    toast.success('Report link copied');
  };

  const handleDownloadJSON = () => {
    const reportData = {
      generated: new Date().toISOString(),
      period: 'Last 30 days',
      kpis,
      equityCurve: metrics.equityCurve,
      dailyPnL,
      symbolPerformance,
      feeComposition: metrics.feeComposition,
      cumulativeFeesByDay: metrics.cumulativeFeesByDay,
      orderTypePerformance: metrics.orderTypePerformance,
      timeOfDay: metrics.timeOfDay,
      sessionPerformance: metrics.sessionPerformance,
      directionBias: metrics.directionBias,
      insights,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Report downloaded');
  };

  return (
    <div className="min-h-screen p-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-sm text-white/60 mt-1">
            Generate and export comprehensive trading reports
          </p>
        </motion.div>

        {/* Generate Report Section */}
        <motion.div
          className="glass-panel border-white/10 p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white">Generate Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs uppercase text-white/70 block mb-2">Period</Label>
              <div className="glass-panel-sm p-3 rounded-md border border-white/10 text-sm text-white/80">
                Last 30 days
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase text-white/70 block mb-2">
                From Date
              </Label>
              <Input type="date" className="h-10" />
            </div>
            <div>
              <Label className="text-xs uppercase text-white/70 block mb-2">To Date</Label>
              <Input type="date" className="h-10" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleExportPDF}
              className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-black flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              Export PDF (UI Only)
            </Button>

            <Button
              onClick={handleDownloadJSON}
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
            >
              <FileJson className="w-4 h-4" />
              Download JSON
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                  <Copy className="w-4 h-4" />
                  Share Report
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Share Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-xs text-white/60">
                    Generate a shareable link to this report
                  </p>
                  <Button
                    onClick={handleCopyLink}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Public Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Report Preview */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white">Report Preview</h2>

          {/* Summary Section */}
          <Card className="glass-panel border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total PnL', value: `$${kpis.totalPnL.toLocaleString()}` },
                { label: 'Win Rate', value: `${kpis.winRate.toFixed(1)}%` },
                { label: 'Trade Count', value: kpis.tradeCount },
                { label: 'Total Volume', value: `${(kpis.totalVolume / 1000).toFixed(1)}K` },
                { label: 'Total Fees', value: `$${kpis.totalFees.toFixed(2)}` },
                { label: 'Avg Duration', value: `${kpis.avgTradeDurationHours.toFixed(1)}h` },
              ].map((item, i) => (
                <div key={i} className="glass-panel-sm p-3 rounded-md border border-white/10">
                  <p className="text-xs text-white/60 uppercase font-semibold">{item.label}</p>
                  <p className="text-lg font-bold text-cyan-400 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Charts */}
          <Card className="glass-panel border-white/10 p-6 print:break-inside-avoid">
            <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
            <EquityCurveChart
              data={metrics.equityCurve.map((p) => ({
                timestamp: p.ts,
                equity: p.equity,
                cumPnL: p.cumPnL,
                drawdown: p.drawdown,
                maxDrawdown: p.maxDrawdown,
              }))}
            />
          </Card>

          <Card className="glass-panel border-white/10 p-6 print:break-inside-avoid">
            <h3 className="text-lg font-semibold text-white mb-4">Daily P&L</h3>
            <DailyPnLChart
              data={metrics.daily.map((d) => ({
                date: new Date(d.day),
                pnl: d.pnl,
                trades: d.trades,
              }))}
            />
          </Card>

          {/* Bonus Insights */}
          <Card className="glass-panel border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Insights (Bonus)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-md border border-white/10 p-3">
                <div className="text-xs text-white/50">Max win streak</div>
                <div className="text-lg font-bold text-white">{insights.streaks.maxWin}</div>
              </div>
              <div className="rounded-md border border-white/10 p-3">
                <div className="text-xs text-white/50">Max loss streak</div>
                <div className="text-lg font-bold text-white">{insights.streaks.maxLoss}</div>
              </div>
              <div className="rounded-md border border-white/10 p-3">
                <div className="text-xs text-white/50">Overtrading days</div>
                <div className="text-lg font-bold text-white">{insights.overtrading.flaggedDays.length}</div>
              </div>
              <div className="rounded-md border border-white/10 p-3">
                <div className="text-xs text-white/50">Fees / gross profit</div>
                <div className="text-lg font-bold text-white">
                  {insights.feeDrag.grossProfit > 0 ? `${insights.feeDrag.feeToGrossProfitPct.toFixed(1)}%` : '—'}
                </div>
              </div>
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="glass-panel border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 Winning Trades</h3>

            <div className="space-y-2">
              {symbolPerformance.slice(0, 5).map((symbol, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <span className="font-medium text-cyan-400">{symbol.symbol}</span>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${symbol.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {symbol.pnl >= 0 ? '+' : ''}${symbol.pnl.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/60">{symbol.trades} trades</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Analysis */}
          <Card className="glass-panel border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Largest Gain', value: `$${kpis.largestGain.toFixed(2)}` },
                { label: 'Largest Loss', value: `$${kpis.largestLoss.toFixed(2)}` },
                { label: 'Avg Win', value: `$${kpis.avgWin.toFixed(2)}` },
                { label: 'Avg Loss', value: `$${kpis.avgLoss.toFixed(2)}` },
                { label: 'Risk/Reward', value: kpis.riskReward.toFixed(2) },
                { label: 'Long/Short Ratio', value: kpis.longShortRatio.toFixed(2) },
              ].map((item, i) => (
                <div key={i} className="glass-panel-sm p-3 rounded-md border border-white/10">
                  <p className="text-xs text-white/60 uppercase font-semibold">{item.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Note */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-sm text-blue-400">
              📊 This is a preview of your trading report. Export to PDF or JSON to share with others or archive your performance metrics.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
