'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { JournalEntry } from '@/lib/types';
import { useJournalEntries } from '@/hooks/use-journal-entries';
import { useTrades } from '@/hooks/use-trades';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function JournalPage() {
  const { entries, add } = useJournalEntries();
  const { trades } = useTrades();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [setupType, setSetupType] = useState('Breakout');
  const [confidence, setConfidence] = useState('5');
  const [notes, setNotes] = useState('');
  const [symbolsRaw, setSymbolsRaw] = useState('');
  const [mistakeType, setMistakeType] = useState('None');
  const [linkedTradeIds, setLinkedTradeIds] = useState<string[]>([]);

  const recentTrades = useMemo(() => trades.slice(0, 50), [trades]);

  const handleAddEntry = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const symbols = symbolsRaw
      .split(/[,;]/g)
      .map((s) => s.trim())
      .filter(Boolean);

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date(),
      title,
      symbols,
      setupType: setupType as any,
      confidence: parseInt(confidence),
      outcome: null,
      mistakeType: mistakeType as any,
      notes,
      tags: [],
      linkedTradeIds,
    };

    add(newEntry);
    toast.success('Entry created successfully');

    // Reset form
    setTitle('');
    setSetupType('Breakout');
    setConfidence('5');
    setNotes('');
    setSymbolsRaw('');
    setMistakeType('None');
    setLinkedTradeIds([]);
    setIsOpen(false);
  };

  // Analytics
  const bySetupType = entries.reduce((acc, e) => {
    const setup = e.setupType;
    acc[setup] = (acc[setup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bestSetup = Object.entries(bySetupType).sort((a, b) => b[1] - a[1])[0];
  const avgConfidence = (entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length).toFixed(1);
  const commonMistakes = entries.reduce((acc, e) => {
    const mistake = e.mistakeType;
    acc[mistake] = (acc[mistake] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen p-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
            <p className="text-sm text-white/60 mt-1">
              Track your trades, setups, and lessons learned
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-black">
                <Plus className="w-4 h-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">New Journal Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pb-20">
                <div>
                  <Label className="text-xs uppercase text-white/70">Title</Label>
                  <Input
                    placeholder="e.g., Failed SOL breakout attempt"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase text-white/70">Setup Type</Label>
                    <Select value={setupType} onValueChange={setSetupType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Breakout', 'Retracement', 'Range', 'Reversal', 'Other'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs uppercase text-white/70">
                      Confidence (1-10)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={confidence}
                      onChange={(e) => setConfidence(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase text-white/70">Symbols (comma separated)</Label>
                  <Input
                    placeholder="SOL/USDC, BTC/USDC"
                    value={symbolsRaw}
                    onChange={(e) => setSymbolsRaw(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase text-white/70">Mistake Type</Label>
                  <Select value={mistakeType} onValueChange={setMistakeType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['None', 'Over-trading', 'Missed TP', 'Wrong Entry', 'Bad Risk/Reward', 'Emotional'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs uppercase text-white/70">Link Trades (optional)</Label>
                  <div className="mt-2 max-h-40 overflow-auto rounded-md border border-white/10 bg-white/5">
                    {recentTrades.length === 0 ? (
                      <div className="p-3 text-xs text-white/60">No trades available in current filters.</div>
                    ) : (
                      recentTrades.map((t) => {
                        const checked = linkedTradeIds.includes(t.id);
                        return (
                          <label key={t.id} className="flex items-center gap-2 px-3 py-2 text-xs border-b border-white/5 cursor-pointer hover:bg-white/5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setLinkedTradeIds((prev) =>
                                  e.target.checked ? [...prev, t.id] : prev.filter((x) => x !== t.id),
                                );
                              }}
                            />
                            <span className="text-white/80">{t.symbol}</span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/60">{t.side.toUpperCase()}</span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/60">{t.ts.toLocaleString()}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase text-white/70">Notes</Label>
                  <Textarea
                    placeholder="What was the setup? What went wrong?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 min-h-24"
                  />
                </div>

              </div>

              <div className="sticky bottom-0 left-0 right-0 pt-3 pb-4 bg-black/70 backdrop-blur border-t border-white/10">
                <Button onClick={handleAddEntry} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
                  Create Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, staggerChildren: 0.05 }}
        >
          {[
            {
              icon: <BarChart3 className="w-4 h-4" />,
              label: 'Total Entries',
              value: entries.length,
            },
            {
              icon: <TrendingUp className="w-4 h-4" />,
              label: 'Avg Confidence',
              value: avgConfidence,
            },
            {
              icon: <TrendingUp className="w-4 h-4" />,
              label: 'Best Setup',
              value: bestSetup?.[0] || 'N/A',
            },
            {
              icon: <AlertCircle className="w-4 h-4" />,
              label: 'Common Mistake',
              value: Object.entries(commonMistakes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card className="glass-panel border-white/10 p-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                  <div className="text-cyan-400">{card.icon}</div>
                  <span className="text-xs uppercase font-semibold">{card.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{card.value}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-white">Recent Entries</h2>
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card className="glass-panel border-white/10 p-4 hover:border-cyan-400/30 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{entry.title}</h3>
                      <p className="text-xs text-white/60 mt-1">
                        {new Date(entry.timestamp).toLocaleDateString()} • {entry.setupType}
                        {entry.symbols.length > 0 && ` • ${entry.symbols.join(', ')}`}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-white/70 mt-2 line-clamp-2">{entry.notes}</p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-semibold text-cyan-400">
                        {entry.confidence}/10
                      </div>
                      <div className="text-xs text-white/60 mt-1">{entry.setupType}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
