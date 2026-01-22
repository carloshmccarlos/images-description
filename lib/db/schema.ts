import { pgTable, uuid, text, timestamp, integer, date, jsonb, uniqueIndex, boolean, numeric, index } from 'drizzle-orm/pg-core';
import type { VocabularyItem } from '@/lib/types/analysis';

// User roles type
export type UserRole = 'user' | 'admin' | 'super_admin';

// User status type
export type UserStatus = 'active' | 'suspended';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  motherLanguage: text('mother_language').default('zh-cn'),
  learningLanguage: text('learning_language').default('en'),
  proficiencyLevel: text('proficiency_level').default('beginner'),
  role: text('role').$type<UserRole>().default('user').notNull(),
  status: text('status').$type<UserStatus>().default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dailyUsage = pgTable('daily_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
}, (table) => [
  uniqueIndex('daily_usage_user_date_idx').on(table.userId, table.date),
]);

export const userLimits = pgTable('user_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  dailyLimit: integer('daily_limit').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const savedAnalyses = pgTable('saved_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  descriptionNative: text('description_native'),
  learningLanguage: text('learning_language'),
  motherLanguage: text('mother_language'),
  descriptionAudioUrl: text('description_audio_url'),
  descriptionNativeAudioUrl: text('description_native_audio_url'),
  vocabulary: jsonb('vocabulary').notNull().$type<VocabularyItem[]>(),
  flagged: boolean('flagged').default(false).notNull(),
  flagReason: text('flag_reason'),
  flaggedAt: timestamp('flagged_at'),
  flaggedBy: uuid('flagged_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  totalWordsLearned: integer('total_words_learned').default(0).notNull(),
  totalAnalyses: integer('total_analyses').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActivityDate: date('last_activity_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});


export const analysisTasks = pgTable('analysis_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  imageUrl: text('image_url'),
  description: text('description'),
  vocabulary: jsonb('vocabulary').$type<VocabularyItem[]>(),
  errorMessage: text('error_message'),
  savedAnalysisId: uuid('saved_analysis_id').references(() => savedAnalyses.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admin action types
export type AdminAction = 
  | 'user_suspended'
  | 'user_reactivated'
  | 'content_flagged'
  | 'content_deleted'
  | 'role_changed';

// Admin logs table for activity logging
export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').$type<AdminAction>().notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('admin_logs_admin_id_idx').on(table.adminId),
  index('admin_logs_action_idx').on(table.action),
  index('admin_logs_created_at_idx').on(table.createdAt),
]);

// System metrics table for health monitoring
export const systemMetrics = pgTable('system_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  metricType: text('metric_type').notNull(),
  value: numeric('value').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
}, (table) => [
  index('system_metrics_type_idx').on(table.metricType),
  index('system_metrics_recorded_at_idx').on(table.recordedAt),
]);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DailyUsage = typeof dailyUsage.$inferSelect;
export type UserLimit = typeof userLimits.$inferSelect;
export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type NewSavedAnalysis = typeof savedAnalyses.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type AnalysisTask = typeof analysisTasks.$inferSelect;
export type NewAnalysisTask = typeof analysisTasks.$inferInsert;
export type AdminLog = typeof adminLogs.$inferSelect;
export type NewAdminLog = typeof adminLogs.$inferInsert;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type NewSystemMetric = typeof systemMetrics.$inferInsert;
