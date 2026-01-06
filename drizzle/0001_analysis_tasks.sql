CREATE TABLE IF NOT EXISTS "analysis_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text DEFAULT 'pending' NOT NULL,
  "progress" integer DEFAULT 0 NOT NULL,
  "image_url" text,
  "description" text,
  "vocabulary" jsonb,
  "error_message" text,
  "saved_analysis_id" uuid REFERENCES "saved_analyses"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "analysis_tasks_user_status_idx" ON "analysis_tasks" ("user_id", "status");
