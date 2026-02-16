'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  description?: string;
  variant?: 'default' | 'warning' | 'success';
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({
  label,
  value,
  change,
  unit = '',
  description,
  variant = 'default',
  loading = false,
  trend,
}: KPICardProps) {
  const variantStyles = {
    default: 'border-white/10 hover:border-cyan-400/30',
    warning: 'border-orange-500/20 hover:border-orange-500/50 bg-orange-500/5',
    success: 'border-green-500/20 hover:border-green-500/50 bg-green-500/5',
  };

  const trendIcon = trend === 'up' ? (
    <TrendingUp className="w-4 h-4 text-green-400" />
  ) : trend === 'down' ? (
    <TrendingDown className="w-4 h-4 text-red-400" />
  ) : null;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`glass-panel p-4 rounded-lg border transition-all cursor-default ${variantStyles[variant]}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              {label}
            </h3>
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-white/40 hover:text-white/60 transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-xs">{description}</TooltipContent>
              </Tooltip>
            )}
          </div>
          {trendIcon}
        </div>

        {loading ? (
          <div className="h-8 bg-white/5 rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-xs text-white/60">{unit}</span>}
          </div>
        )}

        {change !== undefined && (
          <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-white/60'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}% vs last period
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}

export function KPICardSkeleton() {
  return <KPICard label="Loading..." value="-" loading={true} />;
}
