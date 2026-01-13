# Processes

## 1) Development workflow
- Follow AGENTS.MD architecture: UI -> server actions -> DB; no DB access from pages/components.
- Use TypeScript + Valibot for all input validation (no Zod). Keep named exports, one action per file with `'use server'`.
- Prefer shadcn/ui primitives + Tailwind; keep responsive by default.
- Client state: Zustand for UI-only state; React Query for server state. Query/mutation functions must hit stable API routes or actions.

## 2) Internationalization & locale routing (5 locales only)
- Supported locales: `en`, `zh-cn`, `zh-tw`, `ja`, `ko`. No others.
- Server side: get locale via `getServerLocale()`; client side: `useLanguage()` with `changeLanguage` updating URL to `/{locale}/...` while preserving query.
- All navigation (Links, router.push/replace, redirects) must be locale-prefixed. Admin too.
- Default fallbacks: learningLanguage `en`, motherLanguage `zh-cn`. Never fallback to `es` or generic `zh`.
- i18n storage: persist locale in `language-store` (localStorage). Hydrate i18n in `I18nProvider` with initial locale.

## 3) SEO / sitemap / robots
- `app/layout.tsx` metadata must reflect 5 locales; OG alternates include `zh_CN`, `zh_TW`, `ja_JP`, `ko_KR`.
- `app/sitemap.ts`: emit root + `/{locale}` for all 5 locales. No auth/dashboard routes.
- `app/robots.ts`: allow `/` and locale roots; disallow `/api/`, `/dashboard/`, `/analyze/`, `/saved/`, `/settings/`, `/profile/`, `/admin/`, `/auth/`, `/_next/`, `/private/`. Point to `${SITE_URL}/sitemap.xml`.
- All public pages must be reachable via locale-prefixed paths for hreflang consistency.

## 4) Auth flows
- OAuth/email callbacks: `app/auth/callback/route.ts` reads `locale` cookie and prefixes `next` (default `/dashboard`) with that locale; fallback to `/auth/login` with locale.
- Login/register/forgot-password validation uses Valibot schemas (`lib/validations/auth.ts`) and `valibotResolver` in forms.

## 5) Microsoft TTS pipeline (Azure Speech + Cloudflare R2)
- Env requirements: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, voices `AZURE_TTS_VOICE_EN/JA/KO/ZH_CN/ZH_TW`.
- Description audio: use existing DB + default R2 bucket (`CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`).
- Vocabulary audio: separate DB via `AUDIO_DATABASE_URL` + separate R2 audio bucket (`CLOUDFLARE_R2_AUDIO_BUCKET_NAME`, `CLOUDFLARE_R2_AUDIO_PUBLIC_URL`).
- Cache keys: description per analysis/kind/locale; vocabulary per word+language (lowercased, trimmed).
- API routes `/api/audio/description` and `/api/audio/vocabulary` return **501** when Azure Speech or locale-specific voice env is missing, and when storage/DB is missing.
- R2 clients lazy-init and validate env. Do not run TTS when config is missing; prefer cached URLs.

## 6) Storage & DB safety
- Never import `db` or Drizzle schema in UI. Use server actions or route handlers.
- Keep audio DB (vocabulary) migrations separate (AUDIO_DATABASE_URL). Document migration steps alongside regular DB.

## 7) Testing / quality gates
- Validate all external inputs with Valibot at action/API boundary.
- Add regression coverage when fixing bugs; prefer minimal diffs.
- Lint for locale-prefixed links and unsupported locales (`zh`, `es`, etc.).

## 8) Consistency checklist before merge
- All internal links locale-prefixed; admin included.
- No references to unsupported locales or “20+ languages” marketing copy.
- Auth flows and redirects respect locale cookie.
- TTS endpoints safe when env/voices missing; UI handles 501 gracefully.
- Sitemap/robots reflect 5 locales only.
