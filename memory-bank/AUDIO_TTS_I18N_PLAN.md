# Audio + i18n/SEO Plan (Updated)

## Scope shifts
- **Description audio**: keep existing code paths as a **future feature**, but do not enable or ship it now. Leave code in place; gated by env/config later.
- **Vocabulary audio**: **do not generate in this project**. A separate service provides vocabulary audio; use its API instead of local generation. Docs: https://vocabulary-audio-service.loveyouall.qzz.io/docs
- **i18n/SEO**: already aligned to 5 locales (en, zh-CN, zh-TW, ja, ko).

## Current state
- Local description audio generation (Azure TTS + R2) exists in code but should stay dormant/off until we decide to enable it.
- Vocabulary audio generation code in this repo is **out of scope**; the authoritative source is the external service (see docs).
- SEO/hreflang/sitemap/robots are already implemented for the 5 locales.
- Image description UI already supports translated/native tabs; audio play buttons can remain but should rely on existing URLs only (no new generation).

## Decisions
1. Supported locales/preferences: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`.
2. Description audio: keep code for future; do not enable or require its envs now.
3. Vocabulary audio: consume the external API (no local TTS, no local R2/DB for vocab audio in this project).
4. Keep existing deletion cleanup paths intact (they will no-op if no audio URLs exist).

## Action items (when/if we proceed)
- **Description audio (future toggle)**:
  - Gate generation behind an explicit env flag.
  - Ensure required envs (Azure Speech + current R2) are documented but optional when disabled.
  - Surface a user-facing fallback (e.g., hide/disable the “listen” button) when generation is off or URL is missing.
- **Vocabulary audio integration**:
  - Replace any local generation calls with calls to the external service (doc above).
  - Map request/response to our vocabulary card; cache URLs client-side or in DB if needed, but do not generate locally.
  - Handle failure by showing a graceful fallback (e.g., disable play or show tooltip).

## Env notes (only if enabling description audio later)
- Azure Speech: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `AZURE_TTS_VOICE_EN`, `AZURE_TTS_VOICE_ZH_CN`, `AZURE_TTS_VOICE_ZH_TW`, `AZURE_TTS_VOICE_JA`, `AZURE_TTS_VOICE_KO`
- Current R2 (for description audio): reuse existing R2 envs; keep optional while the feature is off.

