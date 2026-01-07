-- Add flagging columns to saved_analyses table for content moderation
ALTER TABLE "saved_analyses" ADD COLUMN "flagged" boolean DEFAULT false NOT NULL;

--> statement-breakpoint

ALTER TABLE "saved_analyses" ADD COLUMN "flag_reason" text;

--> statement-breakpoint

ALTER TABLE "saved_analyses" ADD COLUMN "flagged_at" timestamp;

--> statement-breakpoint

ALTER TABLE "saved_analyses" ADD COLUMN "flagged_by" uuid REFERENCES "users"("id") ON DELETE SET NULL;
