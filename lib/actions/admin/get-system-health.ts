'use server';

import { db } from '@/lib/db';
import { systemMetrics, savedAnalyses } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/admin/middleware';
import { eq, gte, count, sql } from 'drizzle-orm';

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
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const warnings: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get API response time metrics from the last 24 hours
    const responseTimeMetrics = await db
      .select({
        average: sql<number>`AVG(${systemMetrics.value})`,
        p95: sql<number>`PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${systemMetrics.value})`,
        p99: sql<number>`PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ${systemMetrics.value})`,
      })
      .from(systemMetrics)
      .where(
        sql`${systemMetrics.metricType} = 'api_response_time' AND ${systemMetrics.recordedAt} >= ${today}`
      );

    const apiResponseTime = {
      average: Number(responseTimeMetrics[0]?.average ?? 0),
      p95: Number(responseTimeMetrics[0]?.p95 ?? 0),
      p99: Number(responseTimeMetrics[0]?.p99 ?? 0),
    };

    // Check response time thresholds
    if (apiResponseTime.average > 1000) {
      warnings.push('High average API response time');
    }
    if (apiResponseTime.p95 > 2000) {
      warnings.push('High P95 API response time');
    }

    // Get daily API calls count
    const [apiCallsResult] = await db
      .select({ total: sql<number>`SUM(${systemMetrics.value})` })
      .from(systemMetrics)
      .where(
        sql`${systemMetrics.metricType} = 'api_calls' AND ${systemMetrics.recordedAt} >= ${today}`
      );

    const dailyApiCalls = Number(apiCallsResult?.total ?? 0);

    // Get error rate from the last 24 hours
    const [errorRateResult] = await db
      .select({ rate: sql<number>`AVG(${systemMetrics.value})` })
      .from(systemMetrics)
      .where(
        sql`${systemMetrics.metricType} = 'error_rate' AND ${systemMetrics.recordedAt} >= ${today}`
      );

    const errorRate = Number(errorRateResult?.rate ?? 0);

    // Check error rate threshold
    if (errorRate > 5) {
      warnings.push('High error rate detected');
    }

    // Estimate storage usage based on saved analyses count
    // This is a rough estimate since we don't have direct R2 usage metrics
    const [analysesCount] = await db
      .select({ count: count() })
      .from(savedAnalyses);

    const estimatedStorageUsed = (analysesCount?.count ?? 0) * 0.5; // Assume 0.5MB per analysis
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