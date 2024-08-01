CREATE TABLE IF NOT EXISTS "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text NOT NULL
);
