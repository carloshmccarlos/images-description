-- Add role column to users table
-- Values: 'user', 'admin', 'super_admin'
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;

--> statement-breakpoint

-- Add status column to users table
-- Values: 'active', 'suspended'
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;
