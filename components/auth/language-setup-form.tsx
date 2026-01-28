'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { languagePreferencesSchema, type LanguagePreferencesInput } from '@/lib/validations/user';
import { valibotResolver } from '@/lib/validations/react-hook-form-valibot-resolver';
import { SUPPORTED_LANGUAGES, PROFICIENCY_LEVELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user-store';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/hooks/use-language';
import { useUpdateUserSettings } from '@/hooks/use-user-settings';

export function LanguageSetupForm() {
  const t = useTranslations('auth');
  const { locale } = useLanguage();
  const router = useRouter();
  const setPreferences = useUserStore((state) => state.setPreferences);
  const { mutateAsync, isPending } = useUpdateUserSettings();

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LanguagePreferencesInput>({
    resolver: valibotResolver(languagePreferencesSchema),
    defaultValues: {
      motherLanguage: 'zh-cn',
      learningLanguage: 'en',
      proficiencyLevel: 'beginner',
    },
  });

  const motherLanguage = watch('motherLanguage');
  const learningLanguage = watch('learningLanguage');
  const proficiencyLevel = watch('proficiencyLevel');

  async function onSubmit(data: LanguagePreferencesInput) {
    try {
      await mutateAsync(data);
      setPreferences({ ...data, name: null });
      toast.success('Preferences saved!');
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to save preferences',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">{t('setup.nativeLanguage')}</Label>
        <Select value={motherLanguage} onValueChange={(value) => setValue('motherLanguage', value)}>
          <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-white/50 focus:ring-sky-500/20 focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 text-base">
            <SelectValue placeholder="Select your native language" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="rounded-xl h-11">
                <span className="mr-3 text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.motherLanguage && (
          <p className="text-sm font-bold text-red-500 ml-1 italic">{errors.motherLanguage.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">{t('setup.learningLanguage')}</Label>
        <Select value={learningLanguage} onValueChange={(value) => setValue('learningLanguage', value)}>
          <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-white/50 focus:ring-sky-500/20 focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 text-base">
            <SelectValue placeholder="Select language to learn" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
            {SUPPORTED_LANGUAGES.filter((lang) => lang.code !== motherLanguage).map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="rounded-xl h-11">
                <span className="mr-3 text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.learningLanguage && (
          <p className="text-sm font-bold text-red-500 ml-1 italic">{errors.learningLanguage.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">{t('setup.proficiencyLevel')}</Label>
        <Select value={proficiencyLevel} onValueChange={(value) => setValue('proficiencyLevel', value)}>
          <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-white/50 focus:ring-sky-500/20 focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 text-base">
            <SelectValue placeholder="Select your level" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
            {PROFICIENCY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value} className="rounded-xl h-14">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-bold text-sm leading-none">{level.label}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider leading-none">{level.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.proficiencyLevel && (
          <p className="text-sm font-bold text-red-500 ml-1 italic">{errors.proficiencyLevel.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 rounded-2xl bg-linear-to-r from-sky-600 to-emerald-500 hover:from-sky-700 hover:to-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]" 
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-6 w-6" />
        )}
        {t('setup.continue')}
      </Button>
    </form>
  );
}
