# Progress Log

## 2026-01-28
- Switched dashboard/profile/saved/analyze pages to TanStack Query data fetching
- Added aggregated overview APIs to reduce per-navigation requests
- Added analyze pending API + query-based task polling and mutation flow
- Expanded saved list API to include total counts/pages
- Tuned query defaults to reduce refetch frequency
- Gated analytics scripts/components behind `NEXT_PUBLIC_ANALYTICS_ENABLED`
- Moved settings language form mutations to TanStack Query
- Cached vocabulary audio files on saved detail views for faster playback
