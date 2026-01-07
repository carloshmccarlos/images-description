-- Create system_metrics table for health monitoring
CREATE TABLE "system_metrics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "metric_type" text NOT NULL,
  "value" numeric NOT NULL,
  "recorded_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint

-- Create index for efficient querying by metric type and time
CREATE INDEX "system_metrics_type_idx" ON "system_metrics" ("metric_type");

--> statement-breakpoint

CREATE INDEX "system_metrics_recorded_at_idx" ON "system_metrics" ("recorded_at");
