'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES, PROFICIENCY_LEVELS } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { UserSettings } from '@/hooks/use-user-settings';

interface LanguageSettingsCardProps {
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
}

export function LanguageSettingsCard({
  motherLanguage: initialMother,
  learningLanguage: initialLearning,
  proficiencyLevel: initialLevel,
}: LanguageSettingsCardProps) {
  const t = useTranslations('settings');
  const [motherLanguage, setMotherLanguage] = useState(initialMother);
  const [learningLanguage, setLearningLanguage] = useState(initialLearning);
  const [proficiencyLevel, setProficiencyLevel] = useState(initialLevel);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const hasChanges =
    motherLanguage !== initialMother ||
    learningLanguage !== initialLearning ||
    proficiencyLevel !== initialLevel;

  async function handleSave() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motherLanguage, learningLanguage, proficiencyLevel }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(t('language.saved'));
      queryClient.setQueryData<UserSettings>(queryKeys.userSettings, (current) => {
        if (!current) return current;
        return {
          ...current,
          motherLanguage,
          learningLanguage,
          proficiencyLevel,
        };
      });
      router.refresh();
    } catch {
      toast.error(t('language.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20">
              <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            {t('language.title')}
          </CardTitle>
          <CardDescription className="text-zinc-500">
            {t('language.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('language.nativeLanguage')}</Label>
            <Select value={motherLanguage} onValueChange={setMotherLanguage}>
              <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('language.learningLanguage')}</Label>
            <Select value={learningLanguage} onValueChange={setLearningLanguage}>
              <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                {SUPPORTED_LANGUAGES.filter((lang) => lang.code !== motherLanguage).map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('language.proficiencyLevel')}</Label>
            <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
              <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value} className="rounded-lg">
                    {level.label} - {level.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-linear-to-r from-sky-600 to-emerald-500 hover:from-sky-700 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('language.saveChanges')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
