// Centralized query key factories for TanStack Query
export const queryKeys = {
  // Session
  session: ['session'] as const,

  // Dashboard overview
  dashboardOverview: ['dashboardOverview'] as const,

  // Profile overview
  profileOverview: ['profileOverview'] as const,

  // Analyze tasks
  pendingAnalyzeTask: ['pendingAnalyzeTask'] as const,
  analyzeTask: (taskId: string) => ['analyzeTask', taskId] as const,

  // Stats
  stats: ['stats'] as const,

  // User settings
  userSettings: ['userSettings'] as const,

  // Recent analyses
  recentAnalyses: (limit: number) => ['recentAnalyses', limit] as const,

  // Saved analyses
  savedAnalyses: {
    all: ['savedAnalyses'] as const,
    list: (page: number, limit: number, search?: string) =>
      ['savedAnalyses', 'list', { page, limit, search }] as const,
    detail: (id: string) => ['savedAnalyses', 'detail', id] as const,
  },
} as const;
