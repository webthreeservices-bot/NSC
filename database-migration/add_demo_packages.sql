-- Add System Settings for Demo Packages
INSERT INTO "SystemSetting" (id, key, value, description, "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'TEST_1_ROI_PERCENTAGE', '3', 'ROI percentage for Test Package 1 ($1)', NOW()),
  (gen_random_uuid()::text, 'TEST_2_ROI_PERCENTAGE', '4', 'ROI percentage for Test Package 2 ($2)', NOW()),
  (gen_random_uuid()::text, 'TEST_3_ROI_PERCENTAGE', '5', 'ROI percentage for Test Package 3 ($3)', NOW())
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, "updatedAt" = NOW();

-- We don't need to insert into Package table as that table holds *user purchases*, not definitions.
-- Definitions are in the code (constants.ts) and SystemSetting.
