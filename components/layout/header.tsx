'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Settings, User, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { APP_CONFIG } from '@/lib/constants';

interface HeaderProps {
  user: { email: string; name?: string | null } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:bg-zinc-950/95 dark:supports-backdrop-filter:bg-zinc-950/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-xl font-bold">{APP_CONFIG.name}</span>
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Dashboard
              </Link>
              <Link href="/analyze" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Analyze
              </Link>
              <Link href="/saved" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Saved
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-2">
          <Link href="/dashboard" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/analyze" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            Analyze
          </Link>
          <Link href="/saved" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            Saved
          </Link>
        </div>
      )}
    </header>
  );
}
