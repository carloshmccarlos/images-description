'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { analysisTasks, savedAnalyses, userStats, users } from '@/lib/db/schema';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { checkDailyLimit } from '@/lib/actions/usage/check-daily-limit';
import { incrementUsage } from '@/lib/actions/usage/increment-usage';
import { analyzeImage as runAnalysis } from '@/lib/ai/siliconflow-client';
import { uploadToR2, generateImageKey } from '@/lib/storage/r2-client';
import { IMAGE_CONFIG } from '@/lib/constants';
import { imageUploadSchema } from '@/lib/validations/image';
import * as v from 'valibot';
import type { VocabularyItem } from '@/lib/types/analysis';

interface AnalyzeImageResult {
  success: boolean;
  data?: {
    id: string;
    imageUrl: string;
    description: string;
    descriptionNative: string | null;
    learningLanguage: string | null;
    motherLanguage: string | null;
    vocabulary: VocabularyItem[];
  };
  error?: string;
  taskId?: string;
  taskStatus?: string;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
    canAnalyze: boolean;
  };
}

function canUploadToR2(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET_NAME &&
      process.env.CLOUDFLARE_R2_ENDPOINT &&
      process.env.CLOUDFLARE_R2_PUBLIC_URL
  );
}

export async function analyzeImageUpload(
  input: v.InferInput<typeof imageUploadSchema>
): Promise<AnalyzeImageResult> {
  let taskId: string | null = null;

  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const validated = v.safeParse(imageUploadSchema, input);
    if (!validated.success) {
      const maybeFile = (input as { file?: unknown })?.file;
      if (!(maybeFile instanceof File)) {
        return { success: false, error: 'No image provided' };
      }
      if (!IMAGE_CONFIG.supportedTypes.includes(maybeFile.type as typeof IMAGE_CONFIG.supportedTypes[number])) {
        return { success: false, error: 'Invalid file type. Supported: JPG, PNG, WEBP' };
      }
      if (maybeFile.size > IMAGE_CONFIG.maxSizeBytes) {
        return { success: false, error: `File too large. Max size: ${IMAGE_CONFIG.maxSizeKB}KB` };
      }
      return { success: false, error: 'Invalid image provided' };
    }

    const file = validated.output.file;

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await db
      .delete(analysisTasks)
      .where(and(
        eq(analysisTasks.userId, user.id),
        inArray(analysisTasks.status, ['pending', 'analyzing']),
        lt(analysisTasks.createdAt, thirtyMinutesAgo)
      ));

    await db
      .delete(analysisTasks)
      .where(and(
        eq(analysisTasks.userId, user.id),
        inArray(analysisTasks.status, ['completed', 'error']),
        lt(analysisTasks.createdAt, oneDayAgo)
      ));

    const [existingTask] = await db
      .select()
      .from(analysisTasks)
      .where(and(
        eq(analysisTasks.userId, user.id),
        inArray(analysisTasks.status, ['pending', 'analyzing'])
      ))
      .limit(1);

    if (existingTask) {
      return {
        success: false,
        error: 'You have an ongoing analysis. Please wait for it to complete.',
        taskId: existingTask.id,
        taskStatus: existingTask.status,
      };
    }

    const usageResult = await checkDailyLimit({});
    if (!usageResult.success) {
      return { success: false, error: usageResult.error ?? 'Failed to check usage' };
    }

    if (!usageResult.data?.canAnalyze) {
      return { success: false, error: 'Daily limit reached', usage: usageResult.data };
    }

    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
    if (!dbUser) {
      return { success: false, error: 'Please complete your language setup first' };
    }

    const [task] = await db
      .insert(analysisTasks)
      .values({
        userId: user.id,
        status: 'analyzing',
      })
      .returning();

    taskId = task.id;

    const usageIncrement = await incrementUsage({});
    if (!usageIncrement.success) {
      await db
        .update(analysisTasks)
        .set({
          status: 'error',
          errorMessage: usageIncrement.error ?? 'Failed to update usage',
          updatedAt: new Date(),
        })
        .where(eq(analysisTasks.id, taskId));
      return { success: false, error: usageIncrement.error ?? 'Failed to update usage' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    const analysis = await runAnalysis(
      base64Image,
      dbUser.learningLanguage || 'en',
      dbUser.motherLanguage || 'zh-cn',
      dbUser.proficiencyLevel || 'beginner'
    );

    let imageUrl = base64Image;
    try {
      if (canUploadToR2()) {
        const key = generateImageKey(user.id, file.name);
        imageUrl = await uploadToR2(buffer, key, file.type);
      }
    } catch (uploadError) {
      console.warn('R2 upload failed after analysis, using base64:', uploadError);
    }

    const [saved] = await db
      .insert(savedAnalyses)
      .values({
        userId: user.id,
        imageUrl,
        description: analysis.description,
        descriptionNative: analysis.descriptionNative,
        learningLanguage: dbUser.learningLanguage,
        motherLanguage: dbUser.motherLanguage,
        vocabulary: analysis.vocabulary,
      })
      .returning();

    await db
      .update(analysisTasks)
      .set({
        status: 'completed',
        imageUrl,
        description: analysis.description,
        vocabulary: analysis.vocabulary,
        savedAnalysisId: saved.id,
        updatedAt: new Date(),
      })
      .where(eq(analysisTasks.id, taskId));

    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id));
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalWordsLearned: stats.totalWordsLearned + analysis.vocabulary.length,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, user.id));
    }

    return {
      success: true,
      data: {
        id: saved.id,
        imageUrl,
        description: analysis.description,
        descriptionNative: analysis.descriptionNative ?? null,
        learningLanguage: dbUser.learningLanguage ?? null,
        motherLanguage: dbUser.motherLanguage ?? null,
        vocabulary: analysis.vocabulary,
      },
    };
  } catch (error) {
    console.error('Error analyzing image:', error);

    if (taskId) {
      await db
        .update(analysisTasks)
        .set({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        })
        .where(eq(analysisTasks.id, taskId));
    }

    return { success: false, error: 'Failed to analyze image' };
  }
}
