'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = 'neutral',
  className,
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400';
      case 'down':
        return 'text-rose-400';
      default:
        return 'text-zinc-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-linear-to-br from-[#141416] to-[#1c1c1f] border border-[#2a2a2e] rounded-2xl p-6 shadow-lg shadow-black/20',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium">{title}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="font-['Playfair_Display'] text-4xl font-bold bg-linear-to-br from-white to-zinc-300 bg-clip-text text-transparent"
        >
          {formatValue(value)}
        </motion.div>

        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-zinc-500 ml-1">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}