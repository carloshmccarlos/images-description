import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { APP_CONFIG } from '@/lib/constants';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 relative overflow-hidden text-center">
      {/* Background Texture */}
      <div className="pointer-events-none fixed inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[36px_36px] dark:opacity-15" />
      
      {/* Decorative Radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">{APP_CONFIG.name}</span>
          </Link>

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">Reset password</h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Enter your email and we&apos;ll send you a reset link to get you back on track.
          </p>
        </div>

        <div className="p-1 rounded-3xl bg-white/40 backdrop-blur-sm border border-zinc-200 shadow-xl shadow-zinc-200/50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:shadow-none">
          <div className="p-6 text-left">
            <ForgotPasswordForm />
          </div>
        </div>

        <Link 
          href="/auth/login" 
          className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-bold text-zinc-500 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
