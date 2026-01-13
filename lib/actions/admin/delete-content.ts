'use server';

import { db } from '@/lib/db';
import { savedAnalyses, adminLogs } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/admin/middleware';
import { deleteFromR2, getKeyFromUrl } from '@/lib/storage/r2-client';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteContentSchema = v.object({
  analysisId: v.pipe(v.string(), v.uuid()),
  reason: v.optional(v.string()),
});

export type DeleteContentInput = v.InferInput<typeof DeleteContentSchema>;

export interface DeleteContentResult {
  success: boolean;
  data?: {
    analysisId: string;
    deleted: boolean;
  };
  error?: string;
}

export async function deleteContent(input: DeleteContentInput): Promise<DeleteContentResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(DeleteContentSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { analysisId, reason } = parseResult.output;

  try {
    // Get analysis with media URLs
    const [analysis] = await db
      .select({
        id: savedAnalyses.id,
        imageUrl: savedAnalyses.imageUrl,
        descriptionAudioUrl: savedAnalyses.descriptionAudioUrl,
        descriptionNativeAudioUrl: savedAnalyses.descriptionNativeAudioUrl,
      })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.id, analysisId));

    if (!analysis) {
      return { success: false, error: 'Analysis not found' };
    }

    // Delete media from R2 storage (image + description audios)
    const mediaUrls = [
      analysis.imageUrl,
      analysis.descriptionAudioUrl,
      analysis.descriptionNativeAudioUrl,
    ].filter(Boolean) as string[];

    for (const url of mediaUrls) {
      try {
        const key = getKeyFromUrl(url);
        await deleteFromR2(key);
      } catch (error) {
        console.error('Failed to delete media from R2:', error);
        // Continue with database deletion even if R2 deletion fails
      }
    }

    // Delete analysis from database
    await db
      .delete(savedAnalyses)
      .where(eq(savedAnalyses.id, analysisId));

    // Create activity log
    await db.insert(adminLogs).values({
      adminId: adminCheck.data!.id,
      action: 'content_deleted',
      targetType: 'content',
      targetId: analysisId,
      details: reason ? { reason } : {},
    });

    return {
      success: true,
      data: {
        analysisId,
        deleted: true,
      },
    };
  } catch (error) {
    console.error('Failed to delete content:', error);
    return { success: false, error: 'Failed to delete content' };
  }
}
