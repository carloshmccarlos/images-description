'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  HeartPulse,
  Menu,
  X,
  Shield,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'super_admin';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/logs', label: 'Activity Logs', icon: Activity },
    { href: '/admin/health', label: 'System Health', icon: HeartPulse },
  ];

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const response = await fetch('/api/admin/verify');
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Admin access required');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
        }

        setAdmin(result.data);
        setIsLoading(false);
      } catch {
        setError('Failed to verify admin access');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    }
    checkAdminAccess();
  }, [router]);

  const initials = admin?.name
    ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : admin?.email?.[0].toUpperCase() || '?';

  if (isLoading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-600 to-rose-500 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            {!error && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-linear-to-br from-violet-600 to-rose-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <p className={cn(
            "text-sm",
            error ? "text-rose-400" : "text-zinc-500 animate-pulse"
          )}>
            {error || 'Verifying admin access...'}
          </p>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#141416]/80 backdrop-blur-xl border-b border-[#2a2a2e]">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-rose-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg font-['Playfair_Display']">Admin</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="text-zinc-400 hover:text-white hover:bg-[#1c1c1f]"
          >
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
              className="fixed inset-0 bg-black/70 z-50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#141416] z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
                  <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-rose-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg font-['Playfair_Display']">Admin</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-zinc-400 hover:text-white hover:bg-[#1c1c1f]"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                          isActive
                            ? 'bg-[#1c1c1f] text-white'
                            : 'text-zinc-400 hover:bg-[#1c1c1f]/50 hover:text-zinc-200'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-[#2a2a2e]">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-linear-to-br from-violet-600 to-rose-500 text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{admin?.name || 'Admin'}</p>
                      <p className="text-sm text-zinc-500 truncate">{admin?.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-[#2a2a2e] text-zinc-400 hover:text-white hover:bg-[#1c1c1f]"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Exit Admin
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-[#141416] border-r border-[#2a2a2e]">
          <div className="p-8 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-violet-600 to-rose-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight font-['Playfair_Display'] text-white">
                Admin
              </span>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative',
                    isActive
                      ? 'bg-linear-to-r from-violet-500/10 to-rose-500/10 text-white'
                      : 'text-zinc-400 hover:bg-[#1c1c1f] hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-violet-500 to-rose-500 rounded-full"
                    />
                  )}
                  <item.icon className={cn('w-5 h-5', isActive && 'text-violet-400')} />
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

          <div className="p-4 m-4 rounded-2xl bg-[#1c1c1f] border border-[#2a2a2e]">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 ring-2 ring-[#2a2a2e]">
                <AvatarFallback className="bg-linear-to-br from-violet-600 to-rose-500 text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-zinc-500 truncate">{admin?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                admin?.role === 'super_admin' 
                  ? "bg-rose-500/20 text-rose-400" 
                  : "bg-violet-500/20 text-violet-400"
              )}>
                {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-zinc-400 hover:text-white hover:bg-[#2a2a2e]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Admin
              </Button>
            </Link>
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
