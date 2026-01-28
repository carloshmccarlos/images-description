# Audio + i18n Implementation Status

> Generated: 2026-01-13  
> Based on: `AUDIO_TTS_I18N_PLAN.md`  
> **Status: IMPLEMENTED**

---

## 1. Current Implementation Status

### 1.1 i18n/SEO (COMPLETE)

| Feature | Status | Notes |
|---------|--------|-------|
| Supported Locales | ✅ Done | `en`, `zh-cn`, `zh-tw`, `ja`, `ko` |
| i18next Setup | ✅ Done | `lib/i18n/config.ts` with all namespaces |
| Translation Files | ✅ Done | `common`, `landing`, `dashboard`, `auth`, `settings`, `profile`, `saved`, `analyze`, `admin` |
| Server-side i18n | ✅ Done | `lib/i18n/server.ts` |
| Client Provider | ✅ Done | `lib/i18n/provider.tsx` |
| SEO/hreflang | ✅ Done | `app/sitemap.ts`, `app/robots.ts` |
| Language Switching | ✅ Done | Settings page UI Language card |

### 1.2 Description Audio (DORMANT - Feature Flagged)

| Component | Status | Location |
|-----------|--------|----------|
| Azure TTS Client | ✅ Exists | `lib/tts/azure-tts.ts` |
| API Route | ✅ Exists | `app/api/audio/description/route.ts` |
| Feature Flag | ✅ Added | `ENABLE_DESCRIPTION_AUDIO` env var |
| DB Schema Fields | ✅ Exists | `descriptionAudioUrl`, `descriptionNativeAudioUrl` in `savedAnalyses` |
| R2 Storage | ✅ Reuses | Existing R2 bucket (`CLOUDFLARE_R2_*` envs) |

**Current State:** Code exists but is **disabled by default**. Returns 501 when `ENABLE_DESCRIPTION_AUDIO !== 'true'`.

**Required Envs (only when enabled):**
```
ENABLE_DESCRIPTION_AUDIO=true
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
AZURE_TTS_VOICE_EN
AZURE_TTS_VOICE_ZH_CN
AZURE_TTS_VOICE_ZH_TW
AZURE_TTS_VOICE_JA
AZURE_TTS_VOICE_KO
```

### 1.3 Vocabulary Audio (IMPLEMENTED - External Service)

| Component | Status | Notes |
|-----------|--------|-------|
| External Service Integration | ✅ Done | `VocabularyCard` calls external service directly |
| API Route (proxy) | ✅ Updated | `app/api/audio/vocabulary/route.ts` returns external URL |
| Fallback | ✅ Done | Web Speech API fallback on error |

**External Service:** https://vocabulary-audio-service.loveyouall.qzz.io/docs

**How it works:**
1. `VocabularyCard` constructs audio URL directly: `https://vocabulary-audio-service.loveyouall.qzz.io/api/{lang}/{word}`
2. Plays audio via `new Audio(url).play()`
3. Falls back to Web Speech API if external service fails

### 1.4 Session Caching (IMPLEMENTED)

| Component | Status | Notes |
|-----------|--------|-------|
| Session API | Done | `app/api/user/session/route.ts` |
| Client Hook | Done | `hooks/use-session.ts` |
| Cache Provider | Done | `components/providers/session-provider.tsx` |
| UI Usage | Done | Dashboard/Profile use cached session |

**Behavior:**
- Session is cached in TanStack Query with infinite stale time
- Cache invalidates on Supabase auth state changes
- Navigation reuses cached session (no per-page session fetch)
- Landing Navbar/Hero/CTA read cached session to render auth CTAs without server auth calls
- Public header component wraps the landing Navbar with cached session logic
- Landing CTA shows loading skeletons while session resolves
- Playwright visual check added for landing header + CTA

### 1.5 Query-First Data Fetching (IMPLEMENTED)

| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard Overview API | Done | `app/api/dashboard/overview/route.ts` |
| Profile Overview API | Done | `app/api/profile/overview/route.ts` |
| Analyze Pending API | Done | `app/api/analyze/pending/route.ts` |
| Client Hooks | Done | `hooks/use-dashboard-overview.ts`, `hooks/use-profile-overview.ts`, `hooks/use-analyze-task.ts` |
| Saved List API | Done | `app/api/saved/route.ts` now returns totals |

**Behavior:**
- Dashboard/Profile/Saved/Analyze now fetch via TanStack Query hooks
- Aggregated overview endpoints reduce navigation request count
- Query defaults tuned to minimize refetch on mount/window focus

### 1.6 Analytics Request Gating (IMPLEMENTED)

| Component | Status | Notes |
|---------|--------|-------|
| Umami Script | Done | Loaded only when `NEXT_PUBLIC_ANALYTICS_ENABLED=true` |
| Vercel Analytics | Done | Rendered only when enabled |
| Speed Insights | Done | Rendered only when enabled |

**Behavior:**
- Production navigation no longer triggers analytics requests unless explicitly enabled

---

## 2. Completed Changes

### 2.1 Vocabulary Audio - External Service Integration

**Files Modified:**
- `components/analysis/vocabulary-card.tsx` - Now calls external service directly
- `app/api/audio/vocabulary/route.ts` - Simplified to return external URL

**Behavior:**
- Client constructs URL: `https://vocabulary-audio-service.loveyouall.qzz.io/api/{lang}/{word}`
- Falls back to Web Speech API on error
- No local TTS generation, no local audio DB needed

### 2.2 Description Audio - Feature Flag Added

**Files Modified:**
- `app/api/audio/description/route.ts` - Added `ENABLE_DESCRIPTION_AUDIO` check
- `.env.example` - Documented new env vars

**Behavior:**
- Returns 501 immediately if `ENABLE_DESCRIPTION_AUDIO !== 'true'`
- When enabled, requires Azure Speech envs to be configured

---

## 3. Deprecated Files (Can Be Removed)

These files are no longer used but kept for reference:

| Path | Purpose | Reason Deprecated |
|------|---------|-------------------|
| `lib/audio-db/` | Vocabulary audio DB | External service handles storage |
| `lib/storage/r2-audio-client.ts` | Audio-specific R2 client | External service handles storage |
| `drizzle-audio/` | Audio DB migrations | External service handles storage |

---

## 4. Environment Variables Summary

### Required (Currently Active)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Site
NEXT_PUBLIC_SITE_URL

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ENABLED

# AI
DOUBAO_API_KEY
DOUBAO_BASE_URL
DOUBAO_MODEL

# R2 Storage (images)
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_ENDPOINT
CLOUDFLARE_R2_PUBLIC_URL
```

### Optional (Description Audio)

```bash
ENABLE_DESCRIPTION_AUDIO=false  # Set to 'true' to enable
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
AZURE_TTS_VOICE_EN
AZURE_TTS_VOICE_ZH_CN
AZURE_TTS_VOICE_ZH_TW
AZURE_TTS_VOICE_JA
AZURE_TTS_VOICE_KO
```

### Deprecated (No Longer Needed)

```bash
AUDIO_DATABASE_URL           # External service handles vocab audio
CLOUDFLARE_R2_AUDIO_BUCKET_NAME  # External service handles storage
CLOUDFLARE_R2_AUDIO_PUBLIC_URL   # External service handles storage
```

---

## 5. Summary

| Feature | Status | Action Taken |
|---------|--------|--------------|
| i18n (5 locales) | ✅ Complete | None needed |
| SEO/hreflang/sitemap | ✅ Complete | None needed |
| Vocabulary Audio | ✅ Implemented | Integrated external service |
| Description Audio | ✅ Feature-flagged | Added `ENABLE_DESCRIPTION_AUDIO` |

**No breaking changes.** The system gracefully handles all configurations.
