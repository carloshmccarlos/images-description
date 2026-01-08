import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, savedAnalyses, userStats, analysisTasks } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { checkDailyLimit, incrementUsage } from '@/lib/usage/daily-limits';
import { analyzeImage } from '@/lib/ai/doubao-client';
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

    // Try to upload to R2, fallback to base64 if not configured
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
      console.warn('R2 upload failed, using base64:', uploadError);
    }

    // Analyze with AI
    const result = await analyzeImage(
      base64Image,
      dbUser.learningLanguage || 'es',
      dbUser.motherLanguage || 'en',
      dbUser.proficiencyLevel || 'beginner'
    );

    // Save the analysis
    const [saved] = await db
      .insert(savedAnalyses)
      .values({
        userId: user.id,
        imageUrl,
        description: result.description,
        vocabulary: result.vocabulary,
      })
      .returning();

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

    // Delete the task - analysis completed successfully
    await db.delete(analysisTasks).where(eq(analysisTasks.id, taskId));

    return NextResponse.json({
      id: saved.id,
      imageUrl,
      description: result.description,
      descriptionNative: result.descriptionNative,
      vocabulary: result.vocabulary,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Delete the task on failure
    if (taskId) {
      await db.delete(analysisTasks).where(eq(analysisTasks.id, taskId));
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
