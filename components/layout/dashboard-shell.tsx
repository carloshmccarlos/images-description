'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Camera,
  BookMarked,
  Settings,
  User,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { LogoutDialog } from '@/components/auth/logout-dialog';
import { useLanguage } from '@/hooks/use-language';
import { useSession } from '@/hooks/use-session';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations('common');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguage();
  const { data: sessionData, isLoading: isSessionLoading } = useSession();
  const user = sessionData?.user ?? null;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const LOCALES = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko'] as const;
  function stripLocale(path: string) {
    const parts = path.split('/').filter(Boolean);
    const first = parts[0]?.toLowerCase();
    if (first && (LOCALES as readonly string[]).includes(first)) {
      const rest = `/${parts.slice(1).join('/')}`;
      return rest === '/' ? '/' : rest;
    }
    return path;
  }

  const basePathname = stripLocale(pathname);
  const prefixed = `/${locale}`;

  useEffect(() => {
    if (isSessionLoading) return;
    if (sessionData?.needsSetup) {
      router.push(`/${locale}/auth/setup`);
      return;
    }
    if (!user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [isSessionLoading, sessionData?.needsSetup, user, locale, router]);

  const navItems = [
    { href: `${prefixed}/dashboard`, baseHref: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: `${prefixed}/analyze`, baseHref: '/analyze', label: t('nav.analyze'), icon: Camera },
    { href: `${prefixed}/saved`, baseHref: '/saved', label: t('nav.saved'), icon: BookMarked },
    { href: `${prefixed}/profile`, baseHref: '/profile', label: t('nav.profile'), icon: User },
    { href: `${prefixed}/settings`, baseHref: '/settings', label: t('nav.settings'), icon: Settings },
    ...(isAdmin ? [{ href: `${prefixed}/admin`, baseHref: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground transition-colors duration-300 dark:bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[36px_36px] dark:opacity-15" />
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href={`${prefixed}/dashboard`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">{APP_CONFIG.name}</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950 z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <Link href={`${prefixed}/dashboard`} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/10">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">{APP_CONFIG.name}</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = basePathname === item.baseHref ||
                      (item.baseHref === '/saved' && basePathname.startsWith('/saved/'));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                          isActive
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-linear-to-br from-sky-600 to-emerald-500 text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-zinc-900 dark:text-zinc-100">{user?.name || 'User'}</p>
                      <p className="text-sm text-zinc-500 truncate dark:text-zinc-400">{user?.email}</p>
                    </div>
                  </div>
                  <LogoutDialog
                    variant="outline"
                    className="w-full justify-start border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800">
          <div className="p-8 flex items-center justify-between">
            <Link href={`${prefixed}/dashboard`} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight bg-linear-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {APP_CONFIG.name}
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-6 space-y-1.5">
            {navItems.map((item) => {
              const isActive = basePathname === item.baseHref ||
                (item.baseHref === '/saved' && basePathname.startsWith('/saved/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative',
                    isActive
                      ? 'bg-linear-to-r from-sky-500/10 to-emerald-500/10 text-zinc-900 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-sky-500 to-emerald-500 rounded-full"
                    />
                  )}
                  <item.icon className={cn('w-5 h-5', isActive && 'text-emerald-600 dark:text-emerald-400')} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className={cn(
                    'w-4 h-4 opacity-0 -translate-x-2 transition-all',
                    'group-hover:opacity-100 group-hover:translate-x-0',
                    isActive && 'opacity-100 translate-x-0'
                  )} />
                </Link>
              );
            })}
          </nav>

          <div className="p-4 m-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-zinc-800 shadow-sm">
                <AvatarFallback className="bg-linear-to-br from-sky-600 to-emerald-500 text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">{user?.name || 'User'}</p>
                <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">{user?.email}</p>
              </div>
            </div>
            <LogoutDialog
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6 lg:p-12">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
