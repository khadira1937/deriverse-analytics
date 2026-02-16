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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>('demo');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [showGridBackground, setShowGridBackground] = useState(true);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

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
