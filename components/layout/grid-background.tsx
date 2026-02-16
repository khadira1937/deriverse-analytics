'use client';

import React from 'react';
import { useAppContext } from '@/lib/context/app-context';
import { motion } from 'framer-motion';

export function GridBackground() {
  const { showGridBackground } = useAppContext();

  if (!showGridBackground) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base grid pattern */}
      <div className="absolute inset-0 grid-bg" />

      {/* Animated lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 197, 255)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(34, 197, 255)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Diagonal lines */}
        <motion.g initial={{ y: 0 }} animate={{ y: 100 }} transition={{ duration: 20, repeat: Infinity }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`diag-${i}`}
              x1={i * 200}
              y1={0}
              x2={i * 200 + 1200}
              y2={800}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </motion.g>

        {/* Horizontal lines */}
        <motion.g initial={{ x: 0 }} animate={{ x: -100 }} transition={{ duration: 15, repeat: Infinity }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`horiz-${i}`}
              x1={0}
              y1={i * 150}
              x2={1200}
              y2={i * 150}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              opacity="0.5"
            />
          ))}
        </motion.g>
      </svg>

      {/* Corner accent glow */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
      />
    </div>
  );
}
