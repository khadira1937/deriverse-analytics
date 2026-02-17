'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { useAppContext } from '@/lib/context/app-context';
import { useTrades } from '@/hooks/use-trades';
import { useTradeAnnotations } from '@/hooks/use-trade-annotations';
import { Trade, OrderSide, TradeOutcome } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Filter, CheckCircle2 } from 'lucide-react';
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
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = (row.getValue('tags') as string[]) ?? [];
      if (!tags.length) return <span className="text-white/30">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((t, i) => (
            <Badge
              key={`${t}-${i}`}
              variant="outline"
              className="h-5 px-1.5 text-[10px] border-cyan-400/30 text-cyan-200"
            >
              {t}
            </Badge>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-white/50">+{tags.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = (row.getValue('notes') as string) ?? '';
      if (!notes.trim()) return <span className="text-white/30">—</span>;
      return <span className="text-white/60 line-clamp-1 max-w-[240px]">{notes}</span>;
    },
  },
];

export default function TradesPage() {
  const { selectedSymbol } = useAppContext();
  const { trades: normalizedTrades } = useTrades();
  const { get: getAnn, upsert: upsertAnn } = useTradeAnnotations();

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [annTags, setAnnTags] = useState('');
  const [annNotes, setAnnNotes] = useState('');
  const [annSetupType, setAnnSetupType] = useState('');
  const [annMistakeType, setAnnMistakeType] = useState('');
  const [annReviewed, setAnnReviewed] = useState(false);

  const [filterSide, setFilterSide] = useState<OrderSide | 'all'>('all');
  const [filterOutcome, setFilterOutcome] = useState<TradeOutcome | 'all'>('all');
  const [filterOrderType, setFilterOrderType] = useState<string>('all');
  const [filterAnnotated, setFilterAnnotated] = useState<'all' | 'annotated' | 'reviewed'>('all');

  // Convert normalized trades into the UI Trade model used by the table
  const trades: Trade[] = useMemo(() => {
    return normalizedTrades.map((t) => {
      const entry = t.entryPrice ?? 0;
      const exit = t.exitPrice ?? 0;
      const size = t.size ?? 0;
      const pnl = t.pnlUsd;
      const pnlPercent = entry ? ((exit - entry) / entry) * 100 : 0;
      const duration = t.durationSec ? t.durationSec / 3600 : 0;
      const side: OrderSide = t.side === 'long' ? 'Long' : 'Short';
      const orderType =
        t.orderType === 'limit'
          ? 'Limit'
          : t.orderType === 'market'
            ? 'Market'
            : t.orderType === 'ioc'
              ? 'IOC'
              : t.orderType === 'post_only'
                ? 'Post-only'
                : 'Market';
      const outcome: TradeOutcome = pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven';

      const ann = getAnn(t.id);
      const mergedTags = Array.from(
        new Set([...(t.tags ?? []), ...(ann?.tags ?? [])].filter(Boolean)),
      );
      const mergedNotes = ann?.notes?.trim?.() ? ann.notes : (t.notes ?? '');

      return {
        id: t.id,
        timestamp: t.ts,
        symbol: t.symbol,
        side,
        entryPrice: entry,
        exitPrice: exit,
        size,
        pnl,
        pnlPercent,
        fees: t.feesUsd,
        duration,
        orderType: orderType as any,
        tags: mergedTags,
        notes: mergedNotes,
        outcome,
      };
    });
  }, [normalizedTrades, getAnn]);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (selectedSymbol && trade.symbol !== selectedSymbol) return false;
      if (filterSide !== 'all' && trade.side !== filterSide) return false;
      if (filterOutcome !== 'all' && trade.outcome !== filterOutcome) return false;
      if (filterOrderType !== 'all' && trade.orderType !== filterOrderType) return false;

      if (filterAnnotated !== 'all') {
        const ann = getAnn(trade.id);
        const hasAnn = !!(ann && (ann.notes?.trim() || (ann.tags?.length ?? 0) > 0 || ann.reviewed));
        if (filterAnnotated === 'annotated' && !hasAnn) return false;
        if (filterAnnotated === 'reviewed' && !(ann?.reviewed ?? false)) return false;
      }

      return true;
    });
  }, [trades, selectedSymbol, filterSide, filterOutcome, filterOrderType, filterAnnotated, getAnn]);

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

  const handleExportSummary = () => {
    const summary = {
      exportedAt: new Date().toISOString(),
      filters: {
        symbol: selectedSymbol,
        side: filterSide,
        outcome: filterOutcome,
        orderType: filterOrderType,
      },
      tradeCount: filteredTrades.length,
      totalPnL: filteredTrades.reduce((s, t) => s + t.pnl, 0),
      totalFees: filteredTrades.reduce((s, t) => s + t.fees, 0),
      winRate:
        filteredTrades.length === 0
          ? 0
          : (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100,
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${new Date().toISOString()}.json`;
    a.click();
    toast.success('Summary exported as JSON');
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
            Showing {filteredTrades.length} of {trades.length} trades
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

          <Select value={filterAnnotated} onValueChange={(v) => setFilterAnnotated(v as any)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Annotations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="annotated">Annotated</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 h-8 text-xs"
              onClick={handleExportSummary}
            >
              <Download className="w-3 h-3" />
              Export Summary
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 h-8 text-xs"
              onClick={handleExport}
            >
              <Download className="w-3 h-3" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          className="glass-panel border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={filteredTrades}
            pageSize={15}
            virtualized={filteredTrades.length > 200}
            virtualizedHeight={620}
            onRowClick={(row) => {
              setSelectedTrade(row);
              const ann = getAnn(row.id);
              setAnnTags((ann?.tags ?? row.tags ?? []).join(', '));
              setAnnNotes(ann?.notes ?? row.notes ?? '');
              setAnnSetupType(ann?.setupType ?? '');
              setAnnMistakeType(ann?.mistakeType ?? '');
              setAnnReviewed(ann?.reviewed ?? false);
            }}
          />

          <Drawer open={!!selectedTrade} onOpenChange={(o) => !o && setSelectedTrade(null)}>
            <DrawerContent className="bg-black text-white border-white/10">
              <div className="mx-auto w-full max-w-2xl p-4 space-y-4">
                <DrawerHeader className="p-0">
                  <DrawerTitle className="text-white">Trade Annotation</DrawerTitle>
                  <div className="text-xs text-white/60 mt-1">
                    {selectedTrade?.symbol} • {selectedTrade?.side} • {selectedTrade?.timestamp.toLocaleString()}
                  </div>
                </DrawerHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase text-white/70">Setup</Label>
                    <Input value={annSetupType} onChange={(e) => setAnnSetupType(e.target.value)} className="mt-1 h-9" placeholder="Breakout / Range / ..." />
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-white/70">Mistake</Label>
                    <Input value={annMistakeType} onChange={(e) => setAnnMistakeType(e.target.value)} className="mt-1 h-9" placeholder="Over-trading / Emotional / ..." />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase text-white/70">Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {annTags
                      .split(/[,;]/g)
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 12)
                      .map((t, i) => (
                        <Badge
                          key={`${t}-${i}`}
                          variant="outline"
                          className="h-6 px-2 text-[11px] border-cyan-400/30 text-cyan-200"
                        >
                          {t}
                        </Badge>
                      ))}
                    {!annTags.trim() && <span className="text-xs text-white/40">No tags yet</span>}
                  </div>
                  <Input value={annTags} onChange={(e) => setAnnTags(e.target.value)} className="mt-2 h-9" placeholder="comma separated: scalp, A+, revenge" />
                </div>

                <div>
                  <Label className="text-xs uppercase text-white/70">Notes</Label>
                  <Textarea value={annNotes} onChange={(e) => setAnnNotes(e.target.value)} className="mt-1 min-h-28" placeholder="What happened? What to improve next time?" />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="reviewed" checked={annReviewed} onCheckedChange={(v) => setAnnReviewed(Boolean(v))} />
                  <Label htmlFor="reviewed" className="text-sm text-white/80 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                    Mark as reviewed
                  </Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="h-9" onClick={() => setSelectedTrade(null)}>
                    Close
                  </Button>
                  <Button
                    className="h-9 bg-cyan-500 hover:bg-cyan-600 text-black"
                    onClick={() => {
                      if (!selectedTrade) return;
                      const tags = annTags
                        .split(/[,;]/g)
                        .map((t) => t.trim())
                        .filter(Boolean);
                      upsertAnn(selectedTrade.id, {
                        tags,
                        notes: annNotes,
                        setupType: annSetupType,
                        mistakeType: annMistakeType,
                        reviewed: annReviewed,
                      });
                      toast.success('Annotation saved');
                      setSelectedTrade(null);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </motion.div>
      </div>
    </div>
  );
}
