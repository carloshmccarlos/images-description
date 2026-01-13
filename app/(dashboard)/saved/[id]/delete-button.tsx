'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { useDeleteSavedAnalysis } from '@/hooks/use-saved-analyses';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/hooks/use-language';

interface DeleteAnalysisButtonProps {
  id: string;
}

export function DeleteAnalysisButton({ id }: DeleteAnalysisButtonProps) {
  const t = useTranslations('saved');
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const deleteMutation = useDeleteSavedAnalysis();

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('delete.success'));
        setIsOpen(false);
        router.push(`/${locale}/saved`);
      },
      onError: () => {
        toast.error(t('delete.error'));
      },
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-xl font-bold text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('delete.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[32px] border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {t('delete.title')}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-base leading-relaxed">
            {t('delete.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-0 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteMutation.isPending}
            className="rounded-xl font-bold h-11 px-6"
          >
            {t('delete.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
