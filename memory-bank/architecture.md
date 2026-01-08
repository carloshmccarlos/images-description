# LexiLens Architecture

## Overview
LexiLens is an image-based language learning platform built with Next.js 16, Supabase, and AI vision models. The system now uses Doubao API 1.6 for vision-language understanding to improve latency and throughput. Generated descriptions are additionally translated into the user's native language, and English vocabulary outputs are normalized to lowercase.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth (Email, Google OAuth)
- **Storage**: Cloudflare R2
- **AI**: Doubao API 1.6 via Vercel AI SDK
- **State**: Zustand + TanStack Query
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui

## Database Schema

```sql
-- Users table (synced with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  mother_language TEXT DEFAULT 'en',
  learning_language TEXT DEFAULT 'es',
  proficiency_level TEXT DEFAULT 'beginner',
  role TEXT DEFAULT 'user' NOT NULL,  -- 'user', 'admin', 'super_admin'
  status TEXT DEFAULT 'active' NOT NULL,  -- 'active', 'suspended'
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Daily usage tracking
CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, date)
);

-- Saved analyses
CREATE TABLE saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  vocabulary JSONB NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  flagged_at TIMESTAMP,
  flagged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User statistics
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_words_learned INTEGER DEFAULT 0 NOT NULL,
  total_analyses INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Analysis tasks (for async processing)
CREATE TABLE analysis_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' NOT NULL,
  image_url TEXT,
  description TEXT,
  vocabulary JSONB,
  error_message TEXT,
  saved_analysis_id UUID REFERENCES saved_analyses(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Admin activity logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'user_suspended', 'user_reactivated', 'content_flagged', 'content_deleted', 'role_changed'
  target_type TEXT NOT NULL,  -- 'user', 'content', 'system'
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- System metrics (for health monitoring)
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,  -- 'api_response_time', 'api_calls', 'error_rate'
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Project Structure

```
├── app/
│   ├── (dashboard)/              # Protected routes with shared layout
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── analyze/page.tsx      # Image analysis page
│   │   ├── dashboard/page.tsx    # User dashboard with stats
│   │   ├── profile/page.tsx      # User profile & achievements
│   │   ├── saved/                # Saved analyses
│   │   │   ├── page.tsx          # List all saved
│   │   │   └── [id]/page.tsx     # Single analysis view
│   │   └── settings/page.tsx     # Language & account settings
│   ├── (admin)/                  # Admin route group (role-protected)
│   │   ├── layout.tsx            # Admin layout with dark theme sidebar
│   │   └── admin/
│   │       ├── page.tsx          # Admin overview/analytics dashboard
│   │       ├── users/
│   │       │   ├── page.tsx      # User management list
│   │       │   └── [id]/page.tsx # User detail view
│   │       ├── content/
│   │       │   └── page.tsx      # Content moderation
│   │       ├── logs/
│   │       │   └── page.tsx      # Activity logs
│   │       └── health/
│   │           └── page.tsx      # System health metrics
│   ├── api/
│   │   ├── analyze/              # AI analysis endpoints
│   │   ├── saved/                # CRUD for saved analyses
│   │   ├── stats/                # User statistics
│   │   ├── upload/               # R2 upload handling
│   │   └── user/                 # User settings
│   ├── auth/                     # Authentication pages
│   └── page.tsx                  # Landing page
├── components/
│   ├── admin/                    # Admin dashboard components
│   │   ├── admin-sidebar.tsx     # Admin navigation sidebar
│   │   ├── metric-card.tsx       # Analytics metric cards
│   │   ├── time-series-chart.tsx # Chart visualizations
│   │   ├── admin-table.tsx       # Data tables with sorting/pagination
│   │   └── user-detail-card.tsx  # User management cards
│   ├── analysis/                 # Analysis result components
│   │   ├── analysis-results.tsx
│   │   ├── loading-analysis.tsx
│   │   └── vocabulary-card.tsx
│   ├── auth/                     # Auth forms
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── language-setup-form.tsx
│   ├── dashboard/                # Dashboard widgets
│   │   ├── usage-stats.tsx
│   │   ├── welcome-card.tsx
│   │   ├── recent-analyses.tsx
│   │   └── quick-actions.tsx
│   ├── image/                    # Image upload/compression
│   │   └── image-uploader.tsx
│   ├── landing/                  # Landing page components
│   │   ├── navbar.tsx
│   │   ├── hero-section.tsx
│   │   ├── stats-section.tsx
│   │   ├── features-section.tsx
│   │   ├── demo-section.tsx
│   │   ├── cta-section.tsx
│   │   └── footer.tsx
│   ├── layout/                   # Header, navigation
│   │   └── header.tsx
│   ├── profile/                  # Profile components
│   │   ├── profile-header.tsx
│   │   ├── stats-overview.tsx
│   │   ├── achievements-list.tsx
│   │   └── learning-progress.tsx
│   ├── providers/                # React Query provider
│   │   └── query-provider.tsx
│   ├── saved/                    # Saved analyses components
│   │   ├── saved-header.tsx
│   │   └── saved-analyses-list.tsx
│   ├── settings/                 # Settings components
│   │   ├── settings-header.tsx
│   │   ├── language-settings-card.tsx
│   │   ├── account-settings-card.tsx
│   │   └── danger-zone-card.tsx
│   └── ui/                       # Reusable UI components (shadcn/ui)
├── hooks/                        # Custom React hooks
│   └── use-toast.ts
├── lib/
│   ├── actions/                  # Server actions (business logic)
│   │   ├── admin/                # Admin-specific server actions
│   │   │   ├── get-platform-stats.ts
│   │   │   ├── get-admin-users.ts
│   │   │   ├── get-user-detail.ts
│   │   │   ├── update-user-status.ts
│   │   │   ├── get-moderation-content.ts
│   │   │   ├── flag-content.ts
│   │   │   ├── delete-content.ts
│   │   │   ├── get-activity-logs.ts
│   │   │   ├── create-activity-log.ts
│   │   │   └── get-system-health.ts
│   │   ├── achievement/
│   │   ├── analysis/
│   │   ├── stats/
│   │   ├── task/
│   │   └── user/
│   ├── admin/                    # Admin utilities
│   │   ├── middleware.ts         # Admin role verification
│   │   └── utils.ts              # Admin utility functions
│   ├── ai/                       # AI client and prompts
│   │   ├── doubao-client.ts
│   │   └── prompts.ts
│   ├── db/                       # Drizzle schema and client
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── image/                    # Image compression utilities
│   │   └── compression.ts
│   ├── storage/                  # R2 client
│   │   └── r2-client.ts
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── usage/                    # Daily limit tracking
│   │   └── daily-limits.ts
│   ├── validations/              # Valibot schemas
│   ├── constants.ts
│   └── utils.ts
├── stores/                       # Zustand stores
│   └── user-store.ts
└── middleware.ts                 # Auth middleware
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analyze/image | Analyze uploaded image |
| GET | /api/analyze/usage | Get daily usage stats |
| GET | /api/saved | List saved analyses |
| POST | /api/saved | Save analysis |
| GET | /api/saved/[id] | Get single analysis |
| DELETE | /api/saved/[id] | Delete analysis |
| GET | /api/saved/search | Search analyses |
| GET | /api/stats | Get user statistics |
| GET | /api/user/settings | Get user settings |
| PUT | /api/user/settings | Update user settings |
| POST | /api/upload | Get signed upload URL |

### Admin API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Get platform analytics |
| GET | /api/admin/users | List users with pagination |
| GET | /api/admin/users/[id] | Get user details |
| PATCH | /api/admin/users/[id] | Update user (suspend/reactivate) |
| GET | /api/admin/content | List analyses for moderation |
| PATCH | /api/admin/content/[id] | Flag/unflag content |
| DELETE | /api/admin/content/[id] | Delete content |
| GET | /api/admin/logs | Get activity logs |
| GET | /api/admin/health | Get system health metrics |

## Key Features Implemented

1. **Authentication**: Email/password + Google OAuth via Supabase
2. **Language Setup**: First-time user language preference flow
3. **Image Upload**: Drag-drop with client-side compression
4. **AI Analysis**: Vision model integration for vocabulary extraction
5. **Usage Limits**: 5 free analyses per day with tracking
6. **Save/Search**: Persistent storage with full-text search
7. **Statistics**: Words learned, streaks, achievements tracking
8. **Modern UI**: 
   - Responsive dashboard with sidebar navigation
   - Animated landing page with hero, features, demo sections
   - Profile page with achievements and weekly activity chart
   - Settings page with language and account management
   - Framer Motion animations throughout

9. **Admin Dashboard** (NEW):
   - Platform analytics with user growth and analysis trends
   - User management with search, suspend/reactivate
   - Content moderation for flagging/deleting inappropriate content
   - Activity logging for audit trail
   - System health monitoring
   - Editorial/magazine aesthetic with dark theme

## UI Components

### Landing Page
- Animated hero with gradient backgrounds
- Stats counter with scroll animations
- Feature cards with icons
- Interactive demo preview
- CTA section with gradient background

### Dashboard
- Welcome card with user greeting
- Usage stats with animated counters
- Recent analyses grid
- Quick action cards

### Analysis
- Drag-drop image uploader with compression
- Loading states with animated icons
- Vocabulary cards with category colors
- Audio pronunciation (Web Speech API)

### Profile
- Profile header with avatar and stats
- Stats overview with gradient cards
- Achievements grid with progress tracking
- Weekly activity bar chart

### Settings
- Language settings with flag icons
- Account settings with name editing
- Danger zone with delete confirmation

### Admin Dashboard (Editorial/Magazine Aesthetic)
- **Overview**: Metric cards with Playfair Display typography, gradient backgrounds
- **Charts**: Time-series visualizations with staggered animations
- **User Management**: Sortable/searchable data tables with hover states
- **Content Moderation**: Image grid with flag/delete actions
- **Activity Logs**: Filterable log entries with admin attribution
- **System Health**: Metric gauges with threshold warnings
- **Design**: Dark theme (#0a0a0b base), accent colors for data viz

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
DOUBAO_API_KEY
DOUBAO_BASE_URL
DOUBAO_MODEL
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_ENDPOINT
CLOUDFLARE_R2_PUBLIC_URL
```

## Internationalization (i18n)

### Supported Languages
- English (en) - default
- Chinese (zh)
- Japanese (ja)
- Korean (ko)

### Architecture
```
lib/i18n/
├── locales.ts          # Shared locale definitions (server + client safe)
├── config.ts           # Client-side i18next config ('use client')
├── server.ts           # Server-side translation utilities (uses next/headers)
├── provider.tsx        # I18nProvider wrapper component
├── index.ts            # Re-exports
└── translations/       # Translation files by namespace
    ├── common.ts
    ├── landing.ts
    ├── dashboard.ts
    ├── auth.ts
    ├── settings.ts
    ├── profile.ts
    ├── saved.ts
    └── analyze-translations.ts
```

### Usage Patterns
- **Client Components:** Use `useTranslation('namespace')` hook for reactive language switching
- **Server Components:** Use `getTranslations()` from `lib/i18n/server.ts`
- **Language Detection:** Browser Accept-Language header → localStorage preference
- **Language Switching:** Settings page UI Language card persists to localStorage

---

## SEO & Metadata

### Dynamic Icons (App Router)
- `app/icon.tsx` - 32x32 favicon (ImageResponse)
- `app/apple-icon.tsx` - 180x180 Apple touch icon
- `app/opengraph-image.tsx` - 1200x630 OG image

### Metadata Configuration
- Root layout: title template, keywords, Open Graph, Twitter Cards, JSON-LD
- Page-specific metadata exports in each page.tsx
- `app/robots.ts` - robots.txt generation
- `app/sitemap.ts` - sitemap.xml generation
- `public/manifest.json` - PWA manifest

### Environment Variables
- `NEXT_PUBLIC_SITE_URL` - Base URL for canonical links and OG images

---

## Design System

### Colors
- Primary gradient: blue-600 → purple-600
- Success: green-500
- Warning: orange-500
- Error: red-500
- Neutral: zinc scale

### Admin Dashboard Colors (Dark Theme)
- Background: #0a0a0b
- Surface: #141416
- Surface elevated: #1c1c1f
- Border: #2a2a2e
- Accent blue: #3b82f6
- Accent emerald: #10b981
- Accent amber: #f59e0b
- Accent rose: #f43f5e
- Accent violet: #8b5cf6

### Typography
- Font: Geist Sans / Geist Mono
- Headings: Bold, tight tracking
- Body: Regular weight
- Admin Display: Playfair Display (serif) for metrics
- Admin Body: Inter for data tables

### Spacing
- Consistent 4px grid
- Section padding: py-24
- Card padding: p-6
- Gap: gap-4 to gap-8

### Animations
- Page transitions: fade + slide
- Card hover: scale + shadow
- Loading: pulse + spin
- Counters: count up on scroll
