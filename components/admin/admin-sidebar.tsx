'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  HeartPulse,
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

interface AdminSidebarProps {
  admin: AdminUser;
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/logs', label: 'Activity Logs', icon: Activity },
  { href: '/admin/health', label: 'System Health', icon: HeartPulse },
];

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();

  const initials = admin?.name
    ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : admin?.email?.[0].toUpperCase() || '?';

  return (
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
  );
}