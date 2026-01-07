-- Create admin_logs table for activity logging
CREATE TABLE "admin_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" text NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "details" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint

-- Create index for efficient querying by admin and action type
CREATE INDEX "admin_logs_admin_id_idx" ON "admin_logs" ("admin_id");

--> statement-breakpoint

CREATE INDEX "admin_logs_action_idx" ON "admin_logs" ("action");

--> statement-breakpoint

CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs" ("created_at");
