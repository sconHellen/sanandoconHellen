CREATE TYPE "public"."signup_list" AS ENUM('gift', 'app_launch');--> statement-breakpoint
CREATE TABLE "email_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list" "signup_list" NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"consent_at" timestamp with time zone NOT NULL,
	"privacy_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_signups_list_email_uq" ON "email_signups" USING btree ("list","email");