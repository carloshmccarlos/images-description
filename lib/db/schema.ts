import { pgTable, uuid, text, timestamp, integer, date, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  motherLanguage: text('mother_language').default('en'),
  learningLanguage: text('learning_language').default('es'),
  proficiencyLevel: text('proficiency_level').default('beginner'),
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

export const savedAnalyses = pgTable('saved_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  vocabulary: jsonb('vocabulary').notNull().$type<VocabularyItem[]>(),
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
  type: text('type').notNull(), // 'words_10', 'words_100', 'streak_7', etc.
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

export const analysisTasks = pgTable('analysis_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // 'pending', 'uploading', 'analyzing', 'completed', 'failed'
  imageUrl: text('image_url'),
  description: text('description'),
  vocabulary: jsonb('vocabulary').$type<VocabularyItem[]>(),
  errorMessage: text('error_message'),
  savedAnalysisId: uuid('saved_analysis_id').references(() => savedAnalyses.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  exampleSentence: string;
  category?: string;
}

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DailyUsage = typeof dailyUsage.$inferSelect;
export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type AnalysisTask = typeof analysisTasks.$inferSelect;
export type NewAnalysisTask = typeof analysisTasks.$inferInsert;
