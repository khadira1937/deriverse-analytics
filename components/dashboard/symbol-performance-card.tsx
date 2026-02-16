'use client';

import React, { useState } from 'react';
import { SymbolPerformance } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SymbolPerformanceCardProps {
  data: SymbolPerformance[];
}

export function SymbolPerformanceCard({ data }: SymbolPerformanceCardProps) {
  const sortedDesc = [...data].sort((a, b) => b.pnl - a.pnl);
  const sortedAsc = [...data].sort((a, b) => a.pnl - b.pnl);

  // Prefer showing actual winners/losers when possible (prevents “losers” list looking like duplicates)
  const topWinners = sortedDesc.filter((s) => s.pnl >= 0).slice(0, 5);
  const topLosers = sortedAsc.filter((s) => s.pnl < 0).slice(0, 5);

  // Fallbacks if dataset is all-positive or all-negative
  const winners = topWinners.length ? topWinners : sortedDesc.slice(0, 5);
  const losers = topLosers.length ? topLosers : sortedAsc.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Winners */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Top Winners
        </h3>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <Table className="text-xs">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="h-8 text-white/70">Symbol</TableHead>
                <TableHead className="h-8 text-right text-white/70">Trades</TableHead>
                <TableHead className="h-8 text-right text-white/70">PnL</TableHead>
                <TableHead className="h-8 text-right text-white/70">Win %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((symbol) => (
                <TableRow key={symbol.symbol} className="border-white/5 hover:bg-white/5">
                  <TableCell className="py-2 font-medium text-cyan-400">
                    {symbol.symbol}
                  </TableCell>
                  <TableCell className="text-right text-white/80">{symbol.trades}</TableCell>
                  <TableCell className="text-right font-semibold text-green-400">
                    ${symbol.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-white/80">
                    {symbol.winRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Top Losers */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Top Losers
        </h3>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <Table className="text-xs">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="h-8 text-white/70">Symbol</TableHead>
                <TableHead className="h-8 text-right text-white/70">Trades</TableHead>
                <TableHead className="h-8 text-right text-white/70">PnL</TableHead>
                <TableHead className="h-8 text-right text-white/70">Win %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {losers.map((symbol) => (
                <TableRow key={symbol.symbol} className="border-white/5 hover:bg-white/5">
                  <TableCell className="py-2 font-medium text-cyan-400">
                    {symbol.symbol}
                  </TableCell>
                  <TableCell className="text-right text-white/80">{symbol.trades}</TableCell>
                  <TableCell className="text-right font-semibold text-red-400">
                    ${symbol.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-white/80">
                    {symbol.winRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
