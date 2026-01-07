'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface LogoutDialogProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LogoutDialog({ variant = 'ghost', size = 'sm', className }: LogoutDialogProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/');
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <LogOut className="w-4 h-4 mr-2" />
          {t('nav.signOut')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('logout.title')}</DialogTitle>
          <DialogDescription>{t('logout.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? t('logout.signingOut') : t('logout.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
