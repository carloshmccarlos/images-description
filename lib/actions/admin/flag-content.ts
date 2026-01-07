'use server';

import { db } from '@/lib/db';
import { savedAnalyses, adminLogs } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/admin/middleware';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const FlagContentSchema = v.object({
  analysisId: v.pipe(v.string(), v.uuid()),
  reason: v.pipe(v.string(), v.minLength(1)),
});

export type FlagContentInput = v.InferInput<typeof FlagContentSchema>;

export interface FlagContentResult {
  success: boolean;
  data?: {
    analysisId: string;
    flagged: boolean;
  };
  error?: string;
}

export async function flagContent(input: FlagContentInput): Promise<FlagContentResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(FlagContentSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { analysisId, reason } = parseResult.output;

  try {
    // Check if analysis exists
    const [existingAnalysis] = await db
      .select({ id: savedAnalyses.id })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.id, analysisId));

    if (!existingAnalysis) {
      return { success: false, error: 'Analysis not found' };
    }

    // Flag the analysis
    await db
      .update(savedAnalyses)
      .set({
        flagged: true,
        flagReason: reason,
        flaggedAt: new Date(),
        flaggedBy: adminCheck.data!.id,
      })
      .where(eq(savedAnalyses.id, analysisId));

    // Create activity log
    await db.insert(adminLogs).values({
      adminId: adminCheck.data!.id,
      action: 'content_flagged',
      targetType: 'content',
      targetId: analysisId,
      details: { reason },
    });

    return {
      success: true,
      data: {
        analysisId,
        flagged: true,
      },
    };
  } catch (error) {
    console.error('Failed to flag content:', error);
    return { success: false, error: 'Failed to flag content' };
  }
}
