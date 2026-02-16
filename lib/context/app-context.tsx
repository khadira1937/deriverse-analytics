'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DataMode } from '@/lib/types';

interface AppContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  solanaAddress: string;
  setSolanaAddress: (address: string) => void;
  showGridBackground: boolean;
  setShowGridBackground: (show: boolean) => void;
  isCompactMode: boolean;
  setIsCompactMode: (compact: boolean) => void;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;

  // CSV mode
  csvText: string;
  setCsvText: (text: string) => void;
  clearCsvText: () => void;

  // On-chain mode
  onChainRunId: number;
  runOnChain: () => void;
  onChainLoading: boolean;
  setOnChainLoading: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>('demo');
  const [solanaAddress, setSolanaAddress] = useState(
    (process.env.NEXT_PUBLIC_DEFAULT_TRADER_ADDRESS as string | undefined) ?? '',
  );
  const [showGridBackground, setShowGridBackground] = useState(true);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const [csvText, _setCsvText] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('derivision.csvText') ?? '';
  });

  const setCsvText = useCallback((text: string) => {
    _setCsvText(text);
    try {
      window.localStorage.setItem('derivision.csvText', text);
      window.localStorage.setItem('derivision.csvUpdatedAt', String(Date.now()));
    } catch {}
  }, []);

  const clearCsvText = useCallback(() => {
    _setCsvText('');
    try {
      window.localStorage.removeItem('derivision.csvText');
      window.localStorage.setItem('derivision.csvUpdatedAt', String(Date.now()));
    } catch {}
  }, []);

  const [onChainRunId, setOnChainRunId] = useState(0);
  const runOnChain = useCallback(() => setOnChainRunId((x) => x + 1), []);

  const [onChainLoading, setOnChainLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        dataMode,
        setDataMode,
        solanaAddress,
        setSolanaAddress,
        showGridBackground,
        setShowGridBackground,
        isCompactMode,
        setIsCompactMode,
        selectedSymbol,
        setSelectedSymbol,
        dateRange,
        setDateRange,
        csvText,
        setCsvText,
        clearCsvText,
        onChainRunId,
        runOnChain,
        onChainLoading,
        setOnChainLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
