'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationInfo;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onSort?: (key: keyof T, direction: SortDirection) => void;
  onPageChange?: (page: number) => void;
  sortKey?: keyof T;
  sortDirection?: SortDirection;
  className?: string;
}

export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  pagination,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  onSort,
  onPageChange,
  sortKey,
  sortDirection,
  className,
}: AdminTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (key: keyof T) => {
    if (!onSort) return;
    
    const newDirection: SortDirection = 
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const getSortIcon = (key: keyof T) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-linear-to-br from-[#141416] to-[#1c1c1f] border border-[#2a2a2e] rounded-2xl shadow-lg shadow-black/20',
        className
      )}
    >
      {searchable && (
        <div className="p-6 border-b border-[#2a2a2e]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-[#1c1c1f] border-[#2a2a2e] text-white placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2e]">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:text-zinc-300 transition-colors',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-[#2a2a2e] hover:bg-[#1c1c1f]/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-sm text-zinc-300',
                      column.className
                    )}
                  >
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '-')
                    }
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2e]">
          <div className="text-sm text-zinc-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="border-[#2a2a2e] text-zinc-400 hover:text-white hover:bg-[#2a2a2e]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-zinc-300 px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="border-[#2a2a2e] text-zinc-400 hover:text-white hover:bg-[#2a2a2e]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}