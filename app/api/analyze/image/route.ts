import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, savedAnalyses, userStats, analysisTasks } from '@/lib/db/schema';
import { eq, and, inArray, lt } from 'drizzle-orm';
import { checkDailyLimit } from '@/lib/actions/usage/check-daily-limit';
import { incrementUsage } from '@/lib/actions/usage/increment-usage';
import { analyzeImage } from '@/lib/ai/siliconflow-client';
import { uploadToR2, generateImageKey } from '@/lib/storage/r2-client';
import { IMAGE_CONFIG } from '@/lib/constants';

export async function POST(request: Request) {
  let taskId: string | null = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up stale tasks to prevent blocking (e.g., serverless timeouts)
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

    // Check for existing pending task
    const [existingTask] = await db
      .select()
      .from(analysisTasks)
      .where(and(
        eq(analysisTasks.userId, user.id),
        inArray(analysisTasks.status, ['pending', 'analyzing'])
      ))
      .limit(1);

    if (existingTask) {
      return NextResponse.json({
        error: 'You have an ongoing analysis. Please wait for it to complete.',
        taskId: existingTask.id,
        status: existingTask.status,
      }, { status: 409 });
    }

    // Check daily limit
    const usage = await checkDailyLimit(user.id);
    if (!usage.canAnalyze) {
      return NextResponse.json(
        { error: 'Daily limit reached', usage },
        { status: 429 }
      );
    }

    // Get user preferences
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Please complete your language setup first' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    if (!IMAGE_CONFIG.supportedTypes.includes(file.type as typeof IMAGE_CONFIG.supportedTypes[number])) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPG, PNG, WEBP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > IMAGE_CONFIG.maxSizeBytes) {
      return NextResponse.json(
        { error: `File too large. Max size: ${IMAGE_CONFIG.maxSizeKB}KB` },
        { status: 400 }
      );
    }

    // Create task record to prevent duplicate submissions
    const [task] = await db
      .insert(analysisTasks)
      .values({
        userId: user.id,
        status: 'analyzing',
      })
      .returning();
    
    taskId = task.id;

    // Increment usage immediately to prevent race conditions
    await incrementUsage(user.id);

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Analyze with AI (send base64 directly)
    const result = await analyzeImage(
      base64Image,
      dbUser.learningLanguage || 'en',
      dbUser.motherLanguage || 'zh-cn',
      dbUser.proficiencyLevel || 'beginner'
    );

    // Upload to R2 only after successful analysis; fallback to base64 if upload fails/unconfigured
    let imageUrl = base64Image;
    try {
      if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
          process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
          process.env.CLOUDFLARE_R2_BUCKET_NAME &&
          process.env.CLOUDFLARE_R2_ENDPOINT &&
          process.env.CLOUDFLARE_R2_PUBLIC_URL) {
        const key = generateImageKey(user.id, file.name);
        imageUrl = await uploadToR2(buffer, key, file.type);
      }
    } catch (uploadError) {
      console.warn('R2 upload failed after analysis, using base64:', uploadError);
    }

    // Save the analysis
    const [saved] = await db
      .insert(savedAnalyses)
      .values({
        userId: user.id,
        imageUrl,
        description: result.description,
        descriptionNative: result.descriptionNative,
        learningLanguage: dbUser.learningLanguage,
        motherLanguage: dbUser.motherLanguage,
        vocabulary: result.vocabulary,
      })
      .returning();

    // Mark task as completed so the client can resume via /api/analyze/task/[taskId]
    await db
      .update(analysisTasks)
      .set({
        status: 'completed',
        imageUrl,
        description: result.description,
        vocabulary: result.vocabulary,
        savedAnalysisId: saved.id,
        updatedAt: new Date(),
      })
      .where(eq(analysisTasks.id, taskId));

    // Update user stats
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id));
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalWordsLearned: stats.totalWordsLearned + result.vocabulary.length,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, user.id));
    }

    return NextResponse.json({
      id: saved.id,
      imageUrl,
      description: result.description,
      descriptionNative: result.descriptionNative,
      learningLanguage: dbUser.learningLanguage,
      motherLanguage: dbUser.motherLanguage,
      vocabulary: result.vocabulary,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Mark the task as failed so the client can show a meaningful state
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
    
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
