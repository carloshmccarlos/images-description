import { z } from 'zod';
import { SUPPORTED_LANGUAGES, PROFICIENCY_LEVELS } from '@/lib/constants';

const languageCodes = SUPPORTED_LANGUAGES.map((l) => l.code) as [string, ...string[]];
const proficiencyValues = PROFICIENCY_LEVELS.map((p) => p.value) as [string, ...string[]];

export const languagePreferencesSchema = z.object({
  motherLanguage: z.enum(languageCodes),
  learningLanguage: z.enum(languageCodes),
  proficiencyLevel: z.enum(proficiencyValues),
}).refine((data) => data.motherLanguage !== data.learningLanguage, {
  message: 'Mother language and learning language must be different',
  path: ['learningLanguage'],
});

export const userSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  motherLanguage: z.enum(languageCodes),
  learningLanguage: z.enum(languageCodes),
  proficiencyLevel: z.enum(proficiencyValues),
});

export type LanguagePreferencesInput = z.infer<typeof languagePreferencesSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
