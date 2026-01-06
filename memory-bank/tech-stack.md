# Technical Stack

## Architecture Overview

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google, Apple, Email) |
| AI Service | SiliconFlow - GLM 4.6V |
| AI SDK | Next.js AI SDK (Vercel AI SDK) |
| Storage | Cloudflare R2 |
| Animation | Framer Motion |
| Hosting | Vercel |
| Orm | Drizzle |

---

## API Endpoints

### Authentication (Supabase Auth)
```
Supabase Client SDK handles:
- signUp (email/password)
- signInWithPassword
- signInWithOAuth (Google, Apple)
- signOut
- resetPasswordForEmail
- getSession
```

### User Settings
```
GET  /api/user/settings
PUT  /api/user/settings
PUT  /api/user/language-preferences
```

### Image Analysis
```
POST /api/analyze/image
GET  /api/analyze/usage
```

### Saved Results
```
GET    /api/saved
GET    /api/saved/:id
POST   /api/saved
DELETE /api/saved/:id
GET    /api/saved/search?q=keyword
```

---

## Database Schema (Supabase)

### users
```sql
- id (UUID, PK)
- email (unique)
- name
- mother_language
- learning_language
- proficiency_level
- created_at
- updated_at
```

### daily_usage
```sql
- id (UUID, PK)
- user_id (FK -> users)
- date (DATE)
- usage_count (INT, default 0)
- UNIQUE(user_id, date)
```

### saved_analyses
```sql
- id (UUID, PK)
- user_id (FK -> users)
- image_url (TEXT)
- description (TEXT)
- vocabulary (JSONB)
- created_at
```

---

## Image Processing

| Specification | Value |
|---------------|-------|
| Max File Size | 500KB |
| Supported Formats | JPG, PNG, WEBP |
| Compression | Auto-compress images > 500KB before upload |
| Storage | Cloudflare R2 |

### Compression Strategy
- Client-side compression using browser Canvas API
- Target quality: 0.8 (adjustable based on file size)
- Resize large dimensions while maintaining aspect ratio
- Convert to WEBP for better compression when supported

---

## AI Integration

### SiliconFlow GLM 4.6V
- Vision-language model for image understanding
- Endpoint: SiliconFlow API
- SDK: Vercel AI SDK with custom provider

### Prompt Structure
```
Input: Image + User's learning language + Mother language
Output: 
  - Scene description in learning language
  - Vocabulary list with translations
  - Pronunciation guides
  - Example sentences
```

---

## Authentication (Supabase Auth)

### Providers
- Email/Password
- Google OAuth
- Apple OAuth

### Features
- Session management (JWT)
- Automatic token refresh
- Password reset via email
- Email verification

### Configuration
- Protected routes: Next.js middleware with Supabase session check
- Row Level Security (RLS) for database access control

---

## Storage (Cloudflare R2)

### Bucket Structure
```
/images
  /{user_id}
    /{timestamp}_{filename}
```

### Access Control
- Signed URLs for uploads
- Public read for saved images
- Automatic cleanup for unsaved analyses (24h TTL)

---

## Animation (Framer Motion)

### Page Transitions
- Fade in/out between routes
- Slide transitions for navigation

### UI Animations
- Button hover/tap effects
- Card entrance animations (stagger effect for lists)
- Modal open/close with scale + fade
- Loading skeleton pulse animations

### Image Analysis Flow
- Upload progress indicator
- Analyzing spinner with pulse effect
- Results reveal animation (description fades in, vocabulary items stagger in)
- Save confirmation toast slide-in

### Micro-interactions
- Language selector dropdown animation
- Toggle switches with spring physics
- Delete confirmation shake effect
- Success/error state transitions
