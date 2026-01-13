-- 0006_i18n_audio_fields.sql
-- Normalize language defaults and add saved analysis fields for native description + audio URLs

-- Users: update defaults to zh-cn / en
ALTER TABLE users ALTER COLUMN mother_language SET DEFAULT 'zh-cn';
ALTER TABLE users ALTER COLUMN learning_language SET DEFAULT 'en';

-- Users: normalize existing rows
UPDATE users SET mother_language = 'zh-cn' WHERE mother_language IS NULL OR mother_language = '' OR mother_language = 'zh';
UPDATE users SET learning_language = 'en' WHERE learning_language IS NULL OR learning_language = '' OR learning_language = 'es';

-- Saved analyses: add missing columns
ALTER TABLE saved_analyses ADD COLUMN IF NOT EXISTS description_native TEXT;
ALTER TABLE saved_analyses ADD COLUMN IF NOT EXISTS learning_language TEXT;
ALTER TABLE saved_analyses ADD COLUMN IF NOT EXISTS mother_language TEXT;
ALTER TABLE saved_analyses ADD COLUMN IF NOT EXISTS description_audio_url TEXT;
ALTER TABLE saved_analyses ADD COLUMN IF NOT EXISTS description_native_audio_url TEXT;

-- Saved analyses: backfill languages based on users table where possible
UPDATE saved_analyses sa
SET learning_language = COALESCE(sa.learning_language, u.learning_language, 'en'),
    mother_language = COALESCE(sa.mother_language, u.mother_language, 'zh-cn')
FROM users u
WHERE sa.user_id = u.id;
