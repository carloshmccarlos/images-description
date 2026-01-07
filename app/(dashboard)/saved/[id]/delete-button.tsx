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
import { useTranslation } from 'react-i18next';

interface DeleteAnalysisButtonProps {
  id: string;
}

export function DeleteAnalysisButton({ id }: DeleteAnalysisButtonProps) {
  const { t } = useTranslation('saved');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const deleteMutation = useDeleteSavedAnalysis();

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('delete.success', 'Analysis deleted'));
        setIsOpen(false);
        router.push('/saved');
      },
      onError: () => {
        toast.error(t('delete.error', 'Failed to delete'));
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
          {t('delete.button', 'Delete Exploration')}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[32px] border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {t('delete.title', 'Delete Exploration?')}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-base leading-relaxed">
            {t('delete.description', 'This will permanently remove this analysis and all its captured vocabulary. This action cannot be undone.')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-0 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteMutation.isPending}
            className="rounded-xl font-bold h-11 px-6"
          >
            {t('delete.cancel', 'Keep it')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete.confirm', 'Delete Permanently')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
