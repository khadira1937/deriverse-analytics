'use client';

import React from 'react';
import Link from 'next/link';
import { Orbit } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
      <div className="relative">
        <Orbit className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-white">Derivision</span>
        <span className="text-xs text-cyan-400 font-medium">Deriverse Analytics</span>
      </div>
    </Link>
  );
}
