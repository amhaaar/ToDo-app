ALTER TABLE "account" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password_hash";