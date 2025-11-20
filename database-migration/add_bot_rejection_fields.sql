-- Migration: Add rejectedBy and rejectedAt fields to BotActivation table
-- Date: 2025-11-20
-- Description: Adds support for tracking bot activation rejections by admin

-- Add rejectedBy column to track which admin rejected the bot activation
ALTER TABLE "BotActivation"
ADD COLUMN IF NOT EXISTS "rejectedBy" text;

-- Add rejectedAt column to track when the bot activation was rejected
ALTER TABLE "BotActivation"
ADD COLUMN IF NOT EXISTS "rejectedAt" timestamp without time zone;

-- Add rejectionReason column to store the reason for rejection (optional)
ALTER TABLE "BotActivation"
ADD COLUMN IF NOT EXISTS "rejectionReason" text;

-- Add comment to document the purpose of these columns
COMMENT ON COLUMN "BotActivation"."rejectedBy" IS 'User ID of the admin who rejected this bot activation';
COMMENT ON COLUMN "BotActivation"."rejectedAt" IS 'Timestamp when the bot activation was rejected';
COMMENT ON COLUMN "BotActivation"."rejectionReason" IS 'Reason provided by admin for rejecting the bot activation';
