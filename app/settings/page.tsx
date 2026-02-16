'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/lib/context/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Eye,
  Grid3x3,
  Palette,
  Lock,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const {
    showGridBackground,
    setShowGridBackground,
    isCompactMode,
    setIsCompactMode,
  } = useAppContext();

  const handleReset = () => {
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen p-6 pb-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/60 mt-1">
            Customize your trading analytics experience
          </p>
        </motion.div>

        {/* Visual Settings */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Visual Settings
          </h2>

          <Card className="glass-panel border-white/10 p-6 space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Dark Theme</Label>
                <p className="text-sm text-white/60 mt-1">
                  Always use dark theme (light theme coming soon)
                </p>
              </div>
              <Switch checked={true} disabled className="opacity-50" />
            </div>

            {/* Grid Background Toggle */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" />
                    Animated Grid Background
                  </Label>
                  <p className="text-sm text-white/60 mt-1">
                    Show animated 3D grid background on all pages
                  </p>
                </div>
                <Switch
                  checked={showGridBackground}
                  onCheckedChange={setShowGridBackground}
                />
              </div>
            </div>

            {/* Compact Mode */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-white font-medium">Compact Mode</Label>
                  <p className="text-sm text-white/60 mt-1">
                    Use condensed spacing and smaller text sizes
                  </p>
                </div>
                <Switch
                  checked={isCompactMode}
                  onCheckedChange={setIsCompactMode}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Data Settings */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Display Settings
          </h2>

          <Card className="glass-panel border-white/10 p-6 space-y-6">
            {/* Decimal Places */}
            <div>
              <Label className="text-white font-medium block mb-2">Decimal Places</Label>
              <Select defaultValue="4">
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 decimals (price only)</SelectItem>
                  <SelectItem value="4">4 decimals (standard)</SelectItem>
                  <SelectItem value="8">8 decimals (precision)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-white/60 mt-2">
                Default decimal places for prices and values
              </p>
            </div>

            {/* Currency */}
            <div className="border-t border-white/10 pt-6">
              <Label className="text-white font-medium block mb-2">Currency Display</Label>
              <Select defaultValue="usd">
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="sol">SOL</SelectItem>
                  <SelectItem value="btc">BTC</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-white/60 mt-2">
                Primary currency for displaying values
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Data Mode Info */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            Data Modes Explained
          </h2>

          <Card className="glass-panel border-white/10 p-6 space-y-4">
            <div className="space-y-3">
              {[
                {
                  mode: 'Demo Dataset',
                  desc: 'Mock trading data for testing and visualization. No real trades or on-chain data.',
                },
                {
                  mode: 'CSV Import',
                  desc: 'Upload your trading history as CSV. Format: timestamp, symbol, side, entry, exit, size, pnl, fees.',
                },
                {
                  mode: 'On-chain Data',
                  desc: 'Connect your Solana wallet (read-only) to pull real trading history from the Deriverse on-chain program (Program ID + Version).',
                },
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-cyan-400/50 pl-4 py-2">
                  <p className="font-medium text-white">{item.mode}</p>
                  <p className="text-sm text-white/60 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Security & Privacy */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Security & Privacy
          </h2>

          <Card className="glass-panel border-white/10 p-6 space-y-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <p className="text-sm text-green-400 flex items-start gap-2">
                <span className="text-lg leading-none">✓</span>
                <span>
                  <strong>No Private Keys Stored:</strong> We never store, request, or have access to
                  your private keys. Connection is read-only and restricted to viewing trade history.
                </span>
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-white/80 font-medium">Data Storage:</p>
              <ul className="text-white/60 space-y-1 list-disc list-inside">
                <li>Chart data and journal entries stored locally in browser</li>
                <li>CSV imports processed client-side only</li>
                <li>No data sent to external servers (except for optional cloud sync)</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="space-y-3 border-t border-white/10 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
          >
            Reset to Default Settings
          </Button>

          <Button
            variant="destructive"
            className="w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Clear All Data (Coming Soon)
          </Button>
        </motion.div>

        {/* Notice */}
        <motion.div
          className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Settings are saved to your browser. Clearing browser data will reset these preferences.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
