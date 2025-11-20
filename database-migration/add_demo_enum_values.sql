-- Add new values to PackageType enum
-- We must add them one by one.
-- Note: 'IF NOT EXISTS' for enum values is supported in newer Postgres versions (12+).
-- If older, we might need a wrapper block.

DO $$
BEGIN
    ALTER TYPE "PackageType" ADD VALUE IF NOT EXISTS 'TEST_1';
    ALTER TYPE "PackageType" ADD VALUE IF NOT EXISTS 'TEST_2';
    ALTER TYPE "PackageType" ADD VALUE IF NOT EXISTS 'TEST_3';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
