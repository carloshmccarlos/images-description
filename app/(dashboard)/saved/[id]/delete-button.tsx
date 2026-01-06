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

interface DeleteAnalysisButtonProps {
  id: string;
}

export function DeleteAnalysisButton({ id }: DeleteAnalysisButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/saved/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Analysis deleted');
      router.push('/saved');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="rounded-xl font-bold text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Exploration
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[32px] border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">Delete Exploration?</DialogTitle>
          <DialogDescription className="text-zinc-500 text-base leading-relaxed">
            This will permanently remove this analysis and all its captured vocabulary. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-0 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting} className="rounded-xl font-bold h-11 px-6">
            Keep it
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
