// Centralized query key factories for TanStack Query
export const queryKeys = {
  // Session
  session: ['session'] as const,

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
