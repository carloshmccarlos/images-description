'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  color?: string;
  height?: number;
  className?: string;
}

export function TimeSeriesChart({
  data,
  title,
  color = '#8b5cf6',
  height = 300,
  className,
}: TimeSeriesChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg p-3 shadow-lg">
          <p className="text-zinc-300 text-sm font-medium">
            {formatTooltipDate(label)}
          </p>
          <p className="text-white font-semibold">
            {payload[0].value.toLocaleString()} {title.toLowerCase()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'bg-linear-to-br from-[#141416] to-[#1c1c1f] border border-[#2a2a2e] rounded-2xl p-6 shadow-lg shadow-black/20',
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-zinc-400">Last 30 days</p>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#2a2a2e" 
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <motion.g
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >
              <Line
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#1c1c1f' }}
                animationDuration={1500}
                animationBegin={300}
              />
            </motion.g>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}