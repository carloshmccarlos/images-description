'use server';

import { db } from '@/lib/db';
import { systemMetrics, savedAnalyses } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { eq, gte, count, sql } from 'drizzle-orm';
import * as v from 'valibot';

export interface SystemHealthMetrics {
  apiResponseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  dailyApiCalls: number;
  errorRate: number;
  warnings: string[];
}

export interface GetSystemHealthResult {
  success: boolean;
  data?: SystemHealthMetrics;
  error?: string;
}

export async function getSystemHealth(): Promise<GetSystemHealthResult> {
  const validated = v.safeParse(v.object({}), {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const warnings: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [responseTimeRows, apiCallsRows, errorRateRows, analysesRows] = await Promise.all([
      db
        .select({
          average: sql<number>`AVG(${systemMetrics.value})`,
          p95: sql<number>`PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${systemMetrics.value})`,
          p99: sql<number>`PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ${systemMetrics.value})`,
        })
        .from(systemMetrics)
        .where(
          sql`${systemMetrics.metricType} = 'api_response_time' AND ${systemMetrics.recordedAt} >= ${today}`
        ),
      db
        .select({ total: sql<number>`SUM(${systemMetrics.value})` })
        .from(systemMetrics)
        .where(
          sql`${systemMetrics.metricType} = 'api_calls' AND ${systemMetrics.recordedAt} >= ${today}`
        ),
      db
        .select({ rate: sql<number>`AVG(${systemMetrics.value})` })
        .from(systemMetrics)
        .where(
          sql`${systemMetrics.metricType} = 'error_rate' AND ${systemMetrics.recordedAt} >= ${today}`
        ),
      db.select({ count: count() }).from(savedAnalyses),
    ]);

    const apiResponseTime = {
      average: Number(responseTimeRows[0]?.average ?? 0),
      p95: Number(responseTimeRows[0]?.p95 ?? 0),
      p99: Number(responseTimeRows[0]?.p99 ?? 0),
    };

    const dailyApiCalls = Number(apiCallsRows[0]?.total ?? 0);
    const errorRate = Number(errorRateRows[0]?.rate ?? 0);

    // Check response time thresholds
    if (apiResponseTime.average > 1000) {
      warnings.push('High average API response time');
    }
    if (apiResponseTime.p95 > 2000) {
      warnings.push('High P95 API response time');
    }

    // Check error rate threshold
    if (errorRate > 5) {
      warnings.push('High error rate detected');
    }

    // Estimate storage usage based on saved analyses count
    // This is a rough estimate since we don't have direct R2 usage metrics
    const estimatedStorageUsed = (analysesRows[0]?.count ?? 0) * 0.5; // Assume 0.5MB per analysis
    const storageLimit = 10000; // 10GB limit (example)
    const storagePercentage = (estimatedStorageUsed / storageLimit) * 100;

    // Check storage threshold
    if (storagePercentage > 80) {
      warnings.push('Storage usage above 80%');
    }

    const storageUsage = {
      used: estimatedStorageUsed,
      total: storageLimit,
      percentage: Math.min(storagePercentage, 100),
    };

    return {
      success: true,
      data: {
        apiResponseTime,
        storageUsage,
        dailyApiCalls,
        errorRate,
        warnings,
      },
    };
  } catch (error) {
    console.error('Failed to get system health:', error);
    return { success: false, error: 'Failed to retrieve system health metrics' };
  }
}
