'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { LanguageSelectorDark } from '@/components/ui/language-selector';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

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
  { baseHref: '/admin', labelKey: 'sidebar.overview', icon: LayoutDashboard },
  { baseHref: '/admin/users', labelKey: 'sidebar.users', icon: Users },
  { baseHref: '/admin/content', labelKey: 'sidebar.content', icon: FileText },
  { baseHref: '/admin/logs', labelKey: 'sidebar.logs', icon: Activity },
  { baseHref: '/admin/health', labelKey: 'sidebar.health', icon: HeartPulse },
];

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const { locale } = useLanguage();

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
            {t('sidebar.title')}
          </span>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{t('sidebar.subtitle')}</p>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-1.5">
        {navItems.map((item) => {
          const href = `${prefixed}${item.baseHref}`;
          const isActive = basePathname === item.baseHref || 
            (item.baseHref !== '/admin' && basePathname.startsWith(item.baseHref));
          return (
            <Link
              key={item.baseHref}
              href={href}
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
                <span className="font-medium">{t(item.labelKey)}</span>
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
            {admin?.role === 'super_admin' ? t('users.roleSuperAdmin') : t('users.roleAdmin')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelectorDark className="flex-1" />
        </div>
        <Link href={`${prefixed}/dashboard`} className="mt-2 block">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-[#2a2a2e]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('sidebar.exitAdmin')}
          </Button>
        </Link>
      </div>
    </aside>
  );
}