'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';
import { valibotResolver } from '@/lib/validations/react-hook-form-valibot-resolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = createClient();
  const { locale } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: valibotResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);
    try {
      const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${redirectBase}/auth/reset-password`,
      });

      if (error) {
        toast.error('Error', { description: error.message });
        return;
      }

      setIsSubmitted(true);
    } catch {
      toast.error('Something went wrong', { description: 'Please try again later' });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Check your email</h3>
          <p className="text-zinc-500 text-base leading-relaxed">
            We&apos;ve sent a password reset link to your inbox. It should arrive within a few minutes.
          </p>
        </div>
        <Link href={`/${locale}/auth/login`}>
          <Button variant="outline" className="mt-4 h-11 px-8 rounded-xl font-bold border-zinc-200 bg-white/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          error={errors.email?.message}
          disabled={isLoading}
          className="h-12 rounded-xl border-zinc-200 bg-white/50 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900/50"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl bg-linear-to-r from-sky-600 to-emerald-500 hover:from-sky-700 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]" 
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Send Reset Link
      </Button>
    </form>
  );
}
