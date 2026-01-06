'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-3 p-6 md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-2xl p-5',
    'backdrop-blur-xl border shadow-2xl',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
    'data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white/90 dark:bg-zinc-900/90',
          'border-zinc-200/60 dark:border-zinc-700/60',
          'shadow-zinc-200/50 dark:shadow-black/30',
        ],
        destructive: [
          'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/90 dark:to-rose-950/90',
          'border-red-200/60 dark:border-red-800/60',
          'shadow-red-200/30 dark:shadow-red-900/30',
        ],
        success: [
          'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/90 dark:to-teal-950/90',
          'border-emerald-200/60 dark:border-emerald-800/60',
          'shadow-emerald-200/30 dark:shadow-emerald-900/30',
        ],
        warning: [
          'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/90 dark:to-yellow-950/90',
          'border-amber-200/60 dark:border-amber-800/60',
          'shadow-amber-200/30 dark:shadow-amber-900/30',
        ],
        info: [
          'bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/90 dark:to-sky-950/90',
          'border-blue-200/60 dark:border-blue-800/60',
          'shadow-blue-200/30 dark:shadow-blue-900/30',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconVariants = cva(
  'shrink-0 mt-0.5',
  {
    variants: {
      variant: {
        default: 'text-zinc-500 dark:text-zinc-400',
        destructive: 'text-red-500 dark:text-red-400',
        success: 'text-emerald-500 dark:text-emerald-400',
        warning: 'text-amber-500 dark:text-amber-400',
        info: 'text-blue-500 dark:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  showIcon?: boolean;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant, showIcon = true, children, ...props }, ref) => {
  const Icon = variantIcons[variant || 'default'];
  
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {showIcon && (
        <div className={cn(iconVariants({ variant }), 'animate-toast-icon')}>
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
      )}
      {children}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3',
      'text-xs font-semibold tracking-wide uppercase',
      'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
      'hover:bg-zinc-800 dark:hover:bg-zinc-100',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'transition-all duration-200 active:scale-95',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-3 top-3 rounded-full p-1.5',
      'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
      'hover:bg-zinc-100 dark:hover:bg-zinc-800',
      'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
      'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
      'transition-all duration-200',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      'text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100',
      'animate-toast-content',
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      'text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed',
      'animate-toast-content animation-delay-75',
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastPropsExport = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastPropsExport as ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
