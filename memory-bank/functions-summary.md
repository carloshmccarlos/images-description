# LexiLens Functions Summary

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
