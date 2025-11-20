-- Remove System Settings for Demo Packages
DELETE FROM "SystemSetting" 
WHERE key IN ('TEST_1_ROI_PERCENTAGE', 'TEST_2_ROI_PERCENTAGE', 'TEST_3_ROI_PERCENTAGE');

-- Remove Demo Packages (User Purchases)
-- This will cascade to RoiPayment, Transaction, etc. if foreign keys are set up correctly.
-- If not, we might need to delete manually.
-- Assuming CASCADE delete is not guaranteed, let's delete related records first.

-- 1. Delete ROI Payments for demo packages
DELETE FROM "RoiPayment"
WHERE "packageId" IN (
  SELECT id FROM "Package" WHERE "packageType" IN ('TEST_1', 'TEST_2', 'TEST_3')
);

-- 2. Delete Earnings (Referral/Level) related to demo packages
DELETE FROM "Earning"
WHERE "packageId" IN (
  SELECT id FROM "Package" WHERE "packageType" IN ('TEST_1', 'TEST_2', 'TEST_3')
);

-- 3. Delete Bot Activations for demo types
DELETE FROM "BotActivation"
WHERE "botType" IN ('TEST_1', 'TEST_2', 'TEST_3');

-- 4. Delete Transactions for demo packages
-- This is harder to link directly if transaction doesn't have packageId. 
-- But usually we can find them by description or if we link via user who only has demo packages.
-- For now, let's leave transactions as they are harder to isolate safely without a packageId link.
-- Or we can delete based on description if it contains "TEST_1", etc.

-- 5. Delete the Packages themselves
DELETE FROM "Package"
WHERE "packageType" IN ('TEST_1', 'TEST_2', 'TEST_3');
