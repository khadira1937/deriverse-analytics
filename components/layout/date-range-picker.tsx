'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppContext } from '@/lib/context/app-context';

export function DateRangePicker({ className }: { className?: string }) {
  const { dateRange, setDateRange } = useAppContext();

  const label = React.useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'LLL dd, y')} – ${format(dateRange.to, 'LLL dd, y')}`;
    }
    if (dateRange.from) return `${format(dateRange.from, 'LLL dd, y')} – …`;
    return 'Date Range';
  }, [dateRange.from, dateRange.to]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={cn('h-8 text-xs gap-2 justify-start', className)}
        >
          <CalendarIcon className="w-3 h-3" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
          numberOfMonths={2}
          initialFocus
        />
        <div className="flex items-center justify-between gap-2 p-3 border-t border-white/10">
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => setDateRange({ from: undefined, to: undefined })}>
            Clear
          </Button>
          <div className="text-[11px] text-white/50">Filters apply across pages</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
