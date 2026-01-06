'use client';

import { Toaster as Sonner } from 'sonner';

interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export function Toaster({ position = 'top-center' }: ToasterProps) {
  return (
    <Sonner
      position={position}
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            'group flex items-start gap-4 w-full p-4 rounded-2xl',
            'backdrop-blur-xl border shadow-2xl',
            'bg-white/90 dark:bg-zinc-900/90',
            'border-zinc-200/60 dark:border-zinc-700/60',
            'shadow-zinc-200/50 dark:shadow-black/30',
            'data-[type=success]:bg-gradient-to-br data-[type=success]:from-emerald-50 data-[type=success]:to-teal-50',
            'data-[type=success]:dark:from-emerald-950/90 data-[type=success]:dark:to-teal-950/90',
            'data-[type=success]:border-emerald-200/60 data-[type=success]:dark:border-emerald-800/60',
            'data-[type=error]:bg-gradient-to-br data-[type=error]:from-red-50 data-[type=error]:to-rose-50',
            'data-[type=error]:dark:from-red-950/90 data-[type=error]:dark:to-rose-950/90',
            'data-[type=error]:border-red-200/60 data-[type=error]:dark:border-red-800/60',
            'data-[type=warning]:bg-gradient-to-br data-[type=warning]:from-amber-50 data-[type=warning]:to-yellow-50',
            'data-[type=warning]:dark:from-amber-950/90 data-[type=warning]:dark:to-yellow-950/90',
            'data-[type=warning]:border-amber-200/60 data-[type=warning]:dark:border-amber-800/60',
            'data-[type=info]:bg-gradient-to-br data-[type=info]:from-blue-50 data-[type=info]:to-sky-50',
            'data-[type=info]:dark:from-blue-950/90 data-[type=info]:dark:to-sky-950/90',
            'data-[type=info]:border-blue-200/60 data-[type=info]:dark:border-blue-800/60',
          ].join(' '),
          title: 'text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100',
          description: 'text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed',
          actionButton: [
            'inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3',
            'text-xs font-semibold tracking-wide uppercase',
            'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
            'hover:bg-zinc-800 dark:hover:bg-zinc-100',
            'transition-all duration-200 active:scale-95',
          ].join(' '),
          cancelButton: [
            'inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3',
            'text-xs font-medium',
            'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
            'hover:bg-zinc-200 dark:hover:bg-zinc-700',
            'transition-all duration-200',
          ].join(' '),
          closeButton: [
            'absolute right-2 top-2 rounded-full p-1.5',
            'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            'opacity-0 group-hover:opacity-100',
            'transition-all duration-200',
          ].join(' '),
          success: 'text-emerald-600 dark:text-emerald-400',
          error: 'text-red-600 dark:text-red-400',
          warning: 'text-amber-600 dark:text-amber-400',
          info: 'text-blue-600 dark:text-blue-400',
        },
      }}
    />
  );
}
