import * as v from 'valibot';
import { IMAGE_CONFIG } from '@/lib/constants';

export const imageUploadSchema = v.object({
  file: v.pipe(
    v.file(),
    v.mimeType(IMAGE_CONFIG.supportedTypes),
    v.maxSize(IMAGE_CONFIG.maxSizeBytes)
  ),
});

export const analyzeImageSchema = v.object({
  imageUrl: v.pipe(v.string(), v.url()),
  motherLanguage: v.pipe(v.string(), v.minLength(2)),
  learningLanguage: v.pipe(v.string(), v.minLength(2)),
  proficiencyLevel: v.pipe(v.string(), v.minLength(1)),
});

export const vocabularyItemSchema = v.object({
  word: v.pipe(v.string(), v.minLength(1)),
  translation: v.pipe(v.string(), v.minLength(1)),
  pronunciation: v.string(),
  exampleSentence: v.string(),
  category: v.optional(v.string()),
});

export const analysisResultSchema = v.object({
  description: v.pipe(v.string(), v.minLength(1)),
  vocabulary: v.array(vocabularyItemSchema),
});

export type ImageUploadInput = v.InferInput<typeof imageUploadSchema>;
export type AnalyzeImageInput = v.InferInput<typeof analyzeImageSchema>;
export type VocabularyItemInput = v.InferInput<typeof vocabularyItemSchema>;
export type AnalysisResultInput = v.InferInput<typeof analysisResultSchema>;
