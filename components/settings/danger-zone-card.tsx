'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from 'react-i18next';

export function DangerZoneCard() {
  const { t } = useTranslation('settings');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const canDelete = confirmText === 'DELETE';

  async function handleDeleteAccount() {
    if (!canDelete) return;

    setIsDeleting(true);
    try {
      await supabase.auth.signOut();
      toast({ title: t('danger.deletionRequested'), description: t('danger.signedOut') });
      router.push('/');
    } catch {
      toast({ title: t('danger.deleteFailed'), variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border border-red-200 bg-red-50/30 backdrop-blur dark:border-red-900/50 dark:bg-red-950/10 overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-size-[100%_20px]" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 font-semibold tracking-tight text-red-600 dark:text-red-400">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            {t('danger.title')}
          </CardTitle>
          <CardDescription className="text-red-600/70 dark:text-red-400/70 font-medium">
            {t('danger.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/50 dark:bg-zinc-950/50 rounded-2xl border border-red-200/50 dark:border-red-900/30 shadow-sm">
            <div>
              <p className="font-bold text-red-700 dark:text-red-300 tracking-tight">{t('danger.deleteAccount')}</p>
              <p className="text-sm text-zinc-500 font-medium mt-0.5">
                {t('danger.deleteAccountDesc')}
              </p>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="rounded-xl font-bold px-6 h-10 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('danger.deleteButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold tracking-tight">{t('danger.deleteDialogTitle')}</DialogTitle>
                  <DialogDescription className="text-zinc-500 text-base leading-relaxed mt-2">
                    {t('danger.deleteDialogDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('danger.typeToConfirm')}</Label>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl font-bold h-11 px-6">
                    {t('danger.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || isDeleting}
                    className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                  >
                    {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t('danger.deleteAccount')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
