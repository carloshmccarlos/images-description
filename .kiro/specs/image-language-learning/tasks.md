# Implementation Plan: Image-Based Language Learning Platform

## Overview

This implementation plan provides step-by-step instructions for building an image-based language learning platform using Next.js, Supabase, Cloudflare R2, and SiliconFlow AI. Tasks are organized to build incrementally, with each task building on previous work.

## Tasks

- [ ] 1. Project Setup and Configuration
  - [ ] 1.1 Initialize Drizzle ORM with Supabase PostgreSQL
    - Install drizzle-orm and drizzle-kit packages
    - Create `drizzle.config.ts` in project root with Supabase connection string
    - Create `src/lib/db/index.ts` to export drizzle client instance
    - _Requirements: 9.4_

  - [ ] 1.2 Create database schema with Drizzle
    - Create `src/lib/db/schema.ts` with tables: users, daily_usage, saved_analyses, user_stats, achievements
    - Define all columns matching the Data Models in design.md
    - Add unique constraint on (userId, date) for daily_usage
    - Run `drizzle-kit generate` and `drizzle-kit push` to sync schema
    - _Requirements: 5.1, 6.2, 7.1_

  - [ ] 1.3 Set up Supabase client and authentication
    - Install @supabase/supabase-js and @supabase/ssr packages
    - Create `src/lib/supabase/client.ts` for browser client
    - Create `src/lib/supabase/server.ts` for server-side client
    - Create `src/lib/supabase/middleware.ts` for session refresh
    - Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
    - _Requirements: 1.1, 1.4_

  - [ ] 1.4 Configure Next.js middleware for auth protection
    - Create `src/middleware.ts` using Supabase middleware helper
    - Define protected routes: /dashboard, /analyze, /saved, /settings, /profile
    - Redirect unauthenticated users to /login
    - _Requirements: 1.7, 9.4_

  - [ ] 1.5 Set up Zod validation schemas
    - Create `src/lib/validators/schemas.ts`
    - Define schemas: languageSchema, proficiencySchema, languagePreferencesSchema
    - Define schemas: vocabularyItemSchema, analysisResultSchema, saveAnalysisRequestSchema
    - Export all schemas and inferred TypeScript types
    - _Requirements: 9.3_

  - [ ]* 1.6 Write property tests for Zod schemas
    - **Property 24: Input validation rejects malformed data**
    - Create `src/lib/validators/schemas.property.test.ts`
    - Test that valid data passes validation
    - Test that malformed data fails with appropriate errors
    - **Validates: Requirements 9.3**

- [ ] 2. Authentication System
  - [ ] 2.1 Create authentication API utilities
    - Create `src/lib/auth/index.ts` with helper functions
    - Implement getSession(), getCurrentUser(), requireAuth() functions
    - Handle session refresh and error cases
    - _Requirements: 1.4, 1.7_

  - [ ] 2.2 Build registration page and form
    - Create `src/app/(auth)/register/page.tsx`
    - Build form with email, password, confirm password fields
    - Add client-side validation with Zod
    - Call Supabase signUp on submit
    - Display success message about verification email
    - _Requirements: 1.1_

  - [ ] 2.3 Build login page and form
    - Create `src/app/(auth)/login/page.tsx`
    - Build form with email and password fields
    - Call Supabase signInWithPassword on submit
    - Redirect to /dashboard on success
    - Display generic error message on failure (don't reveal which field is wrong)
    - _Requirements: 1.4, 1.5_

  - [ ]* 2.4 Write property test for login error messages
    - **Property 4: Invalid credentials return generic error**
    - Create `src/lib/auth/auth.property.test.ts`
    - Test that error messages for wrong email vs wrong password are identical
    - **Validates: Requirements 1.5**

  - [ ] 2.5 Implement OAuth login buttons
    - Add Google and Apple OAuth buttons to login page
    - Create `src/app/auth/callback/route.ts` for OAuth callback handling
    - Configure OAuth providers in Supabase dashboard
    - _Requirements: 1.3_

  - [ ] 2.6 Build password reset flow
    - Create `src/app/(auth)/forgot-password/page.tsx` with email form
    - Create `src/app/(auth)/reset-password/page.tsx` for new password entry
    - Call Supabase resetPasswordForEmail and updateUser
    - _Requirements: 1.6_

  - [ ] 2.7 Create auth layout with Framer Motion transitions
    - Create `src/app/(auth)/layout.tsx`
    - Add fade-in animation for auth pages
    - Include logo and branding elements
    - _Requirements: 8.3_

- [ ] 3. User Settings and Language Preferences
  - [ ] 3.1 Create user settings API routes
    - Create `src/app/api/user/settings/route.ts` with GET and PUT handlers
    - GET: Return user's current settings from database
    - PUT: Update user settings with Zod validation
    - _Requirements: 2.2_
