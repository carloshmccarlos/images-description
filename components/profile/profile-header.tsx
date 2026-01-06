'use client';

import { motion } from 'framer-motion';
import { Calendar, Globe, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  name: string;
  email: string;
  learningLanguage: string;
  learningFlag: string;
  nativeLanguage: string;
  nativeFlag: string;
  proficiencyLevel: string;
  memberSince: Date;
}

export function ProfileHeader({
  name,
  email,
  learningLanguage,
  learningFlag,
  nativeLanguage,
  nativeFlag,
  proficiencyLevel,
  memberSince,
}: ProfileHeaderProps) {
  const { t } = useTranslation('profile');
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const levelLabels: Record<string, string> = {
    beginner: t('levels.beginner'),
    intermediate: t('levels.intermediate'),
    advanced: t('levels.advanced'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_28px] dark:opacity-10" />
        <div className="h-32 bg-linear-to-r from-sky-600 via-teal-500 to-emerald-500 relative overflow-hidden">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[24px_24px]" />
        </div>
        <CardContent className="relative pt-0 pb-8 z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
            <Avatar className="w-28 h-28 border-4 border-white dark:border-zinc-950 shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
              <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-sky-600 to-emerald-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="mt-12 flex-1 space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
              <p className="text-zinc-500 text-lg">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20">
                <Globe className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('header.learning')}</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{learningFlag} {learningLanguage}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('header.native')}</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{nativeFlag} {nativeLanguage}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('header.level')}</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{levelLabels[proficiencyLevel] || proficiencyLevel}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                <Calendar className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('header.memberSince')}</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(memberSince)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
