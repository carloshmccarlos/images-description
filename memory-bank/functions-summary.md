# LexiLens Functions Summary

## Admin Components

### AdminSidebar
**File:** `components/admin/admin-sidebar.tsx`

Dark-themed navigation sidebar for admin dashboard with editorial/magazine aesthetic. Features Playfair Display typography, gradient backgrounds, and smooth hover transitions. Includes navigation items for Overview, Users, Content, Logs, and Health monitoring.

**Props:** None (uses pathname for active state)

---

### MetricCard
**File:** `components/admin/metric-card.tsx`

Displays key platform metrics with animated counters, trend indicators, and gradient backgrounds. Uses Playfair Display for large metric values and includes percentage change indicators with color-coded trends.

**Props:** `title: string`, `value: number`, `change?: number`, `trend?: 'up' | 'down'`, `format?: 'number' | 'currency'`

---

### TimeSeriesChart
**File:** `components/admin/time-series-chart.tsx`

Interactive time-series visualization using Recharts with staggered animations. Supports hover tooltips, gradient fills, and responsive design. Used for displaying user growth and analysis trends over time.

**Props:** `data: Array<{date: string, value: number}>`, `title: string`, `color?: string`

---

### AdminTable
**File:** `components/admin/admin-table.tsx`

Sortable, searchable data table with dark theme styling. Features hover states, pagination controls, and responsive design. Supports custom column definitions and action buttons.

**Props:** `data: any[]`, `columns: ColumnDef[]`, `searchable?: boolean`, `sortable?: boolean`

---

### UserDetailCard
**File:** `components/admin/user-detail-card.tsx`

Comprehensive user information display with language settings, statistics, and admin actions. Includes suspend/reactivate functionality with confirmation dialogs and activity logging.

**Props:** `user: AdminUser`, `onStatusUpdate: (status) => void`

---

## Components

### AnalysisProgress
**File:** `components/analysis/analysis-progress.tsx`

Displays a multi-step progress indicator during image analysis. Shows three stages (uploading, analyzing, saving) with animated icons and a progress bar. Each step transitions through inactive → active → complete states based on the progress percentage.

**Props:** `progress: number`, `status: 'uploading' | 'analyzing'`, `translations: object`

---

### RecentAnalyses
**File:** `components/dashboard/recent-analyses.tsx`

Renders a grid of recent analysis cards on the dashboard. Each card shows the analyzed image thumbnail, description, word count, and creation date. Includes empty state with CTA to analyze first image. Uses i18n via `useTranslation('dashboard')`.

**Props:** `analyses: RecentAnalysis[]`

---

### UsageStats
**File:** `components/dashboard/usage-stats.tsx`

Displays four stat cards (daily analyses remaining, words learned, day streak, total analyses) and a usage progress bar. Animates on mount with staggered delays. Shows warning when daily limit is reached.

**Props:** `used: number`, `totalWords: number`, `currentStreak: number`, `totalAnalyses: number`

---

### ImageUploader
**File:** `components/image/image-uploader.tsx`

Drag-and-drop image upload component with client-side compression. Validates file type (JPG/PNG/WEBP) and size, compresses large images, and shows compression results via toast. Displays preview with remove button when image is selected. Uses i18n via `useTranslation('analyze')`.

**Props:** `onImageSelect: (file, preview) => void`, `onClear: () => void`, `selectedImage: string | null`, `isUploading?: boolean`

---

### LearningProgress
**File:** `components/profile/learning-progress.tsx`

Renders a weekly activity bar chart showing the last 7 days of usage. Bars are animated on mount with gradient colors. Highlights today's bar and shows total weekly count.

**Props:** `recentActivity: DailyUsage[]`

---

### AccountSettingsCard
**File:** `components/settings/account-settings-card.tsx`

User profile settings form with name editing. Email is displayed but not editable. Tracks changes and enables save button only when modified. Uses i18n via `useTranslation('settings')`.

**Props:** `name: string`, `email: string`

**Key Function:** `handleSave()` - Sends PUT request to `/api/user/settings` with updated name, shows toast on success/failure, refreshes router.

---

### AnalyzeClient
**File:** `app/(dashboard)/analyze/analyze-client.tsx`

Main analyze page client component. Manages state machine (idle → analyzing → error). Handles image selection, triggers analysis via `/api/analyze/image`, navigates to saved analysis on success. Uses i18n via `useTranslation('analyze')`.

**Props:** `hasRunningTask?: boolean`

---

## Hooks

### useToast
**File:** `hooks/use-toast.ts`

Global toast notification system using reducer pattern with in-memory state. Supports add, update, dismiss, and remove actions. Auto-dismisses after 5 seconds. Limits to 1 toast at a time.

**Returns:** `{ toasts, toast, dismiss }`

**Usage:** `const { toast } = useToast(); toast({ title: 'Success', variant: 'success' });`

---

## Server Actions

### Admin Server Actions

#### getPlatformStats
**File:** `lib/actions/admin/get-platform-stats.ts`

Aggregates platform-wide analytics including total users, analyses, daily active users, and words learned. Generates time-series data for user registrations and analyses over the past 30 days. Requires admin authentication.

**Returns:** `{ totalUsers, totalAnalyses, dailyActiveUsers, totalWordsLearned, userGrowth[], analysisGrowth[] }`

---

#### getAdminUsers
**File:** `lib/actions/admin/get-admin-users.ts`

Retrieves paginated user list with search and sorting capabilities. Joins with user_stats for activity data and supports filtering by email/name. Includes role and status information for admin management.

**Input:** `{ page?, limit?, search?, sortBy?, sortOrder? }`
**Returns:** `{ users: AdminUser[], total: number, hasMore: boolean }`

---

#### getUserDetail
**File:** `lib/actions/admin/get-user-detail.ts`

Fetches comprehensive user details including profile, language settings, statistics, and recent analyses. Used for admin user detail pages and management operations.

**Input:** `{ userId: string }`
**Returns:** `{ user: AdminUser, stats: UserStats, recentAnalyses: Analysis[] }`

---

#### updateUserStatus
**File:** `lib/actions/admin/update-user-status.ts`

Updates user status (suspend/reactivate) with admin authentication and activity logging. Prevents admins from suspending themselves and creates audit trail entries.

**Input:** `{ userId: string, status: 'active' | 'suspended', reason?: string }`
**Returns:** `{ success: boolean, error?: string }`

---

#### getModerationContent
**File:** `lib/actions/admin/get-moderation-content.ts`

Retrieves analyses for content moderation with user information and image URLs. Supports date range filtering and pagination for efficient content review.

**Input:** `{ page?, limit?, startDate?, endDate? }`
**Returns:** `{ analyses: ModerationAnalysis[], total: number, hasMore: boolean }`

---

#### flagContent
**File:** `lib/actions/admin/flag-content.ts`

Flags analysis content as inappropriate with reason and admin attribution. Creates activity log entry and updates analysis record with flagged status.

**Input:** `{ analysisId: string, reason: string }`
**Returns:** `{ success: boolean, error?: string }`

---

#### deleteContent
**File:** `lib/actions/admin/delete-content.ts`

Permanently deletes analysis content and associated image from R2 storage. Creates activity log entry and handles cleanup of related records.

**Input:** `{ analysisId: string, reason?: string }`
**Returns:** `{ success: boolean, error?: string }`

---

#### getActivityLogs
**File:** `lib/actions/admin/get-activity-logs.ts`

Retrieves admin activity logs with filtering by action type and date range. Includes admin information and supports pagination for audit trail review.

**Input:** `{ page?, limit?, actionType?, startDate?, endDate? }`
**Returns:** `{ logs: ActivityLog[], total: number, hasMore: boolean }`

---

#### createActivityLog
**File:** `lib/actions/admin/create-activity-log.ts`

Creates audit trail entries for admin actions. Records action type, target information, admin attribution, and additional details for compliance tracking.

**Input:** `{ action: string, targetType: string, targetId: string, details?: object }`
**Returns:** `{ success: boolean, error?: string }`

---

#### getSystemHealth
**File:** `lib/actions/admin/get-system-health.ts`

Monitors system health metrics including API response times, storage usage, and daily API call counts. Provides threshold warnings for performance monitoring.

**Returns:** `{ apiResponseTime, storageUsage, dailyApiCalls, warnings: string[] }`

---

### updateTask
**File:** `lib/actions/task/update-task.ts`

Server action to update analysis task progress and results. Validates input with Zod, authenticates user via Supabase, updates task record in database. Used for tracking long-running analysis operations.

**Input:** `{ taskId, status?, progress?, imageUrl?, description?, vocabulary?, errorMessage?, savedAnalysisId? }`

**Returns:** `{ success: boolean, error?: string }`

---

## Translation Utilities

### getAnalyzeTranslations
**File:** `lib/i18n/analyze-translations.ts`

Returns translation object for analyze page based on locale. Supports zh, ja, ko with fallback to en. Contains translations for uploader, progress states, error messages, and success banners.

**Usage:** `const t = getAnalyzeTranslations('zh');` (for server components)

**Note:** Client components should use `useTranslation('analyze')` hook instead for reactive language switching.
