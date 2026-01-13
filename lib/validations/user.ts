import * as v from 'valibot';
import { SUPPORTED_LANGUAGES, PROFICIENCY_LEVELS } from '@/lib/constants';

const languageCodes = SUPPORTED_LANGUAGES.map((l) => l.code) as [string, ...string[]];
const proficiencyValues = PROFICIENCY_LEVELS.map((p) => p.value) as [string, ...string[]];

export const languagePreferencesSchema = v.pipe(
  v.object({
    motherLanguage: v.picklist(languageCodes),
    learningLanguage: v.picklist(languageCodes),
    proficiencyLevel: v.picklist(proficiencyValues),
  }),
  v.forward(
    v.check(
      (data) => data.motherLanguage !== data.learningLanguage,
      'Mother language and learning language must be different'
    ),
    ['learningLanguage']
  )
);

export const userSettingsSchema = v.object({
  name: v.pipe(v.string('Name is required'), v.minLength(1, 'Name is required'), v.maxLength(100)),
  motherLanguage: v.picklist(languageCodes),
  learningLanguage: v.picklist(languageCodes),
  proficiencyLevel: v.picklist(proficiencyValues),
});

export type LanguagePreferencesInput = v.InferInput<typeof languagePreferencesSchema>;
export type UserSettingsInput = v.InferInput<typeof userSettingsSchema>;
