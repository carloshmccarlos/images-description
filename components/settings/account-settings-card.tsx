'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AccountSettingsCardProps {
  name: string;
  email: string;
}

export function AccountSettingsCard({ name: initialName, email }: AccountSettingsCardProps) {
  const { t } = useTranslation('settings');
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const hasChanges = name !== initialName;

  async function handleSave() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(t('account.profileUpdated'));
      router.refresh();
    } catch {
      toast.error(t('account.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            {t('account.title')}
          </CardTitle>
          <CardDescription className="text-zinc-500">
            {t('account.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('account.displayName')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('account.enterName')}
              className="h-12 rounded-xl border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('account.email')}</Label>
            <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Mail className="w-4 h-4 text-zinc-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">{email}</span>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
              {t('account.emailCannotChange')}
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-linear-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/10 transition-all active:scale-[0.98]"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('account.updateProfile')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
