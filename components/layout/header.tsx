'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Database, Orbit } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from './logo';
import { DateRangePicker } from './date-range-picker';
import { CsvImportDialog } from './csv-import-dialog';

export function Header() {
  const pathname = usePathname();
  const {
    dataMode,
    setDataMode,
    solanaAddress,
    setSolanaAddress,
    selectedSymbol,
    setSelectedSymbol,
  } = useAppContext();
  const [isAddressValid, setIsAddressValid] = useState(true);

  const validateSolanaAddress = (addr: string) => {
    const trimmed = addr.trim();
    // Solana base58 addresses are typically 32..44 chars.
    const isValid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
    setIsAddressValid(isValid || trimmed === '');
    return isValid || trimmed === '';
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // keep raw for UX but validate trimmed
    setSolanaAddress(value);
    validateSolanaAddress(value);
  };

  const handleDataModeChange = (mode: DataMode) => {
    setDataMode(mode);
    const modeLabels: Record<DataMode, string> = {
      'demo': 'Demo Dataset',
      'csv': 'CSV Import',
      'on-chain': 'Deriverse On-chain',
    };
    toast.info(`Switched to ${modeLabels[mode]}`);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/trades', label: 'Trades' },
    { href: '/journal', label: 'Journal' },
    { href: '/reports', label: 'Reports' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg">
      <div className="mx-auto px-4 py-3 lg:px-6">
        {/* Row 1: Logo and Nav */}
        <div className="flex items-center justify-between gap-8 mb-3">
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/settings">
              <Button size="sm" variant="ghost" className="gap-2">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 2: Data controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Data Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/50 uppercase">Data:</span>
            <div className="flex gap-1">
              {['demo', 'csv', 'on-chain'].map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={dataMode === mode ? 'default' : 'outline'}
                  className={`text-xs h-8 px-3 ${
                    dataMode === mode ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : ''
                  }`}
                  onClick={() => handleDataModeChange(mode as DataMode)}
                >
                  {mode === 'demo' && <Database className="w-3 h-3 mr-1" />}
                  {mode === 'csv' && <Orbit className="w-3 h-3 mr-1" />}
                  {mode === 'on-chain' && <Orbit className="w-3 h-3 mr-1" />}
                  {mode === 'demo' ? 'Demo' : mode === 'csv' ? 'CSV' : 'On-chain'}
                </Button>
              ))}
            </div>
          </div>

          {/* CSV Import */}
          {dataMode === 'csv' && <CsvImportDialog />}

          {/* Solana Address Input (on-chain only) */}
          {dataMode === 'on-chain' && (
            <Input
              type="text"
              placeholder="SOL address (base58)"
              value={solanaAddress}
              onChange={handleAddressChange}
              className={`h-8 text-xs w-40 ${
                !isAddressValid && solanaAddress ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
          )}

          {/* Symbol Filter */}
          <Select value={selectedSymbol || 'all'} onValueChange={(val) => setSelectedSymbol(val === 'all' ? null : val)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="All symbols" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All symbols</SelectItem>
              {['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'JUP/USDC', 'RAY/USDC', 'ORCA/USDC', 'INSTR-0', 'INSTR-1', 'INSTR-2', 'INSTR-3'].map(
                (symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <DateRangePicker />
        </div>
      </div>
    </header>
  );
}
