'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { useAppContext } from '@/lib/context/app-context';
import { DEMO_TRADES } from '@/lib/mock/trades';
import { Trade, OrderSide, TradeOutcome } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Time',
    cell: ({ row }) => {
      const date = new Date(row.getValue('timestamp') as Date);
      return <span className="text-white/80">{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>;
    },
  },
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => (
      <span className="font-medium text-cyan-400">{row.getValue('symbol')}</span>
    ),
  },
  {
    accessorKey: 'side',
    header: 'Side',
    cell: ({ row }) => {
      const side = row.getValue('side') as OrderSide;
      const color = side === 'Long' ? 'text-green-400' : 'text-red-400';
      return <span className={`font-medium ${color}`}>{side}</span>;
    },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => <span>{(row.getValue('size') as number).toLocaleString()}</span>,
  },
  {
    accessorKey: 'entryPrice',
    header: 'Entry',
    cell: ({ row }) => <span>${(row.getValue('entryPrice') as number).toFixed(4)}</span>,
  },
  {
    accessorKey: 'exitPrice',
    header: 'Exit',
    cell: ({ row }) => <span>${(row.getValue('exitPrice') as number).toFixed(4)}</span>,
  },
  {
    accessorKey: 'pnl',
    header: 'PnL',
    cell: ({ row }) => {
      const pnl = row.getValue('pnl') as number;
      const color = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-white/60';
      return <span className={`font-semibold ${color}`}>${pnl.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'pnlPercent',
    header: 'PnL %',
    cell: ({ row }) => {
      const pnlPct = row.getValue('pnlPercent') as number;
      const color = pnlPct > 0 ? 'text-green-400' : pnlPct < 0 ? 'text-red-400' : 'text-white/60';
      return <span className={`font-semibold ${color}`}>{pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>;
    },
  },
  {
    accessorKey: 'fees',
    header: 'Fees',
    cell: ({ row }) => <span className="text-white/60">${(row.getValue('fees') as number).toFixed(2)}</span>,
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => <span className="text-white/60">{(row.getValue('duration') as number).toFixed(1)}h</span>,
  },
  {
    accessorKey: 'orderType',
    header: 'Order Type',
    cell: ({ row }) => <span className="text-white/60">{row.getValue('orderType')}</span>,
  },
];

export default function TradesPage() {
  const { selectedSymbol, setSelectedSymbol } = useAppContext();
  const [filterSide, setFilterSide] = useState<OrderSide | 'all'>('all');
  const [filterOutcome, setFilterOutcome] = useState<TradeOutcome | 'all'>('all');
  const [filterOrderType, setFilterOrderType] = useState<string>('all');

  const filteredTrades = useMemo(() => {
    return DEMO_TRADES.filter((trade) => {
      if (selectedSymbol && trade.symbol !== selectedSymbol) return false;
      if (filterSide !== 'all' && trade.side !== filterSide) return false;
      if (filterOutcome !== 'all' && trade.outcome !== filterOutcome) return false;
      if (filterOrderType !== 'all' && trade.orderType !== filterOrderType) return false;
      return true;
    });
  }, [selectedSymbol, filterSide, filterOutcome, filterOrderType]);

  const handleExport = () => {
    const csv = [
      ['Time', 'Symbol', 'Side', 'Size', 'Entry', 'Exit', 'PnL', 'PnL %', 'Fees', 'Duration', 'Type'].join(','),
      ...filteredTrades.map((trade) =>
        [
          new Date(trade.timestamp).toISOString(),
          trade.symbol,
          trade.side,
          trade.size,
          trade.entryPrice,
          trade.exitPrice,
          trade.pnl,
          trade.pnlPercent,
          trade.fees,
          trade.duration,
          trade.orderType,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Trades exported as CSV');
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
          <h1 className="text-3xl font-bold text-white">Trade History</h1>
          <p className="text-sm text-white/60 mt-1">
            Showing {filteredTrades.length} of {DEMO_TRADES.length} trades
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="glass-panel border-white/10 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Filter className="w-4 h-4 text-cyan-400" />

          <Select value={filterSide} onValueChange={(val) => setFilterSide(val as any)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="All sides" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sides</SelectItem>
              <SelectItem value="Long">Long</SelectItem>
              <SelectItem value="Short">Short</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOutcome} onValueChange={(val) => setFilterOutcome(val as any)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="All outcomes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="Win">Win</SelectItem>
              <SelectItem value="Loss">Loss</SelectItem>
              <SelectItem value="Breakeven">Breakeven</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOrderType} onValueChange={setFilterOrderType}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Limit">Limit</SelectItem>
              <SelectItem value="Market">Market</SelectItem>
              <SelectItem value="IOC">IOC</SelectItem>
              <SelectItem value="Post-only">Post-only</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-2 h-8 text-xs"
            onClick={handleExport}
          >
            <Download className="w-3 h-3" />
            Export CSV
          </Button>
        </motion.div>

        {/* Data Table */}
        <motion.div
          className="glass-panel border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable columns={columns} data={filteredTrades} pageSize={15} />
        </motion.div>
      </div>
    </div>
  );
}
