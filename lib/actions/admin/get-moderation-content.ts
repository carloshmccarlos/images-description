'use server';

import { db } from '@/lib/db';
import { savedAnalyses, users } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { gte, lte, and, desc, count, eq } from 'drizzle-orm';
import * as v from 'valibot';

const GetModerationContentSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
  dateFrom: v.optional(v.pipe(v.string(), v.isoDate())),
  dateTo: v.optional(v.pipe(v.string(), v.isoDate())),
});

export type GetModerationContentInput = v.InferInput<typeof GetModerationContentSchema>;

export interface ModeratableAnalysis {
  id: string;
  userId: string;
  userEmail: string;
  imageUrl: string;
  description: string;
  createdAt: Date;
  flagged: boolean;
  flagReason: string | null;
  flaggedAt: Date | null;
  flaggedBy: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetModerationContentResult {
  success: boolean;
  data?: {
    analyses: ModeratableAnalysis[];
    pagination: PaginationInfo;
  };
  error?: string;
}

export async function getModerationContent(
  input: GetModerationContentInput = {}
): Promise<GetModerationContentResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(GetModerationContentSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { page, limit, dateFrom, dateTo } = parseResult.output;
  const offset = (page - 1) * limit;

  try {
    // Build date range conditions
    const conditions = [];
    if (dateFrom) {
      conditions.push(gte(savedAnalyses.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(savedAnalyses.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countRows, analysesData] = await Promise.all([
      db
        .select({ count: count() })
        .from(savedAnalyses)
        .where(whereClause),
      db
        .select({
          id: savedAnalyses.id,
          userId: savedAnalyses.userId,
          userEmail: users.email,
          imageUrl: savedAnalyses.imageUrl,
          description: savedAnalyses.description,
          createdAt: savedAnalyses.createdAt,
          flagged: savedAnalyses.flagged,
          flagReason: savedAnalyses.flagReason,
          flaggedAt: savedAnalyses.flaggedAt,
          flaggedBy: savedAnalyses.flaggedBy,
        })
        .from(savedAnalyses)
        .innerJoin(users, eq(savedAnalyses.userId, users.id))
        .where(whereClause)
        .orderBy(desc(savedAnalyses.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countRows[0]?.count ?? 0;

    const analyses: ModeratableAnalysis[] = analysesData.map(a => ({
      id: a.id,
      userId: a.userId,
      userEmail: a.userEmail,
      imageUrl: a.imageUrl,
      description: a.description,
      createdAt: a.createdAt,
      flagged: a.flagged,
      flagReason: a.flagReason,
      flaggedAt: a.flaggedAt,
      flaggedBy: a.flaggedBy,
    }));

    return {
      success: true,
      data: {
        analyses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Failed to get moderation content:', error);
    return { success: false, error: 'Failed to retrieve content' };
  }
}
