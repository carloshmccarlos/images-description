import { z } from 'zod';
import { IMAGE_CONFIG } from '@/lib/constants';

export const imageUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => IMAGE_CONFIG.supportedTypes.includes(file.type as typeof IMAGE_CONFIG.supportedTypes[number]),
    'File must be JPG, PNG, or WEBP'
  ).refine(
    (file) => file.size <= IMAGE_CONFIG.maxSizeBytes,
    `File must be less than ${IMAGE_CONFIG.maxSizeKB}KB`
  ),
});

export const analyzeImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  motherLanguage: z.string().min(2),
  learningLanguage: z.string().min(2),
  proficiencyLevel: z.string(),
});

export const vocabularyItemSchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  pronunciation: z.string(),
  exampleSentence: z.string(),
  category: z.string().optional(),
});

export const analysisResultSchema = z.object({
  description: z.string(),
  vocabulary: z.array(vocabularyItemSchema),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type AnalyzeImageInput = z.infer<typeof analyzeImageSchema>;
export type VocabularyItemInput = z.infer<typeof vocabularyItemSchema>;
export type AnalysisResultInput = z.infer<typeof analysisResultSchema>;
