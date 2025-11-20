# Recalculate Referral Earnings

This script fixes referral earnings calculations for all users globally.

## Problem

The referral earnings calculation had bugs that prevented proper earnings from being recorded:
- Function wasn't checking for active bots requirement
- Earnings weren't being inserted into the database
- Existing earnings were calculated with incorrect logic

## Solution

This script:
1. **Deletes all existing referral earnings** (DIRECT_REFERRAL and LEVEL_INCOME types)
2. **Deletes corresponding transactions**
3. **Recalculates earnings for all existing packages** using the corrected `calculate_referral_earnings` function

## Usage

### Option 1: Run SQL Script Directly

Execute the SQL script directly in your database:

```sql
-- Copy and paste the contents of scripts/recalculate_referral_earnings.sql
-- into your database client (pgAdmin, DBeaver, etc.)
```

### Option 2: Run Node.js Script

Set your database environment variables:

```bash
export DB_HOST=your_host
export DB_PORT=5432
export DB_NAME=your_database
export DB_USER=your_username
export DB_PASSWORD=your_password
```

Then run:

```bash
cd src
node scripts/recalculate_referral_earnings.js
```

For a dry run (no changes made):

```bash
node scripts/recalculate_referral_earnings.js --dry-run
```

## What Gets Recalculated

- **Direct Referrals**: 2% bonus for users with active bots
- **Level Income**: 1%, 0.5%, 0.3%, 0.2%, 0.1% for levels 2-6 (only for users with active bots)
- **Requirements**: Referrer must have an active, non-expired bot to earn

## Verification

After running, check:

1. **Network Stats API**: Should show correct total referral earnings
2. **Level Breakdown API**: Should show correct investment amounts per level
3. **Database**: New earning and transaction records should be created

## Expected Results

For your example case:
- Test 3: $11,000 investment → $220 direct referral bonus (if you have active bot)
- Test 2: $87,000 investment → $1,740 direct referral bonus (if you have active bot)
- **Total**: $1,960 referral earnings

## Safety Notes

- **Backup your database first** - this deletes existing earnings
- The script only affects referral earnings, not ROI payments or withdrawals
- All other financial data remains intact
- You can run this multiple times if needed

## Troubleshooting

If earnings still don't match expectations:

1. **Check active bots**: Run this query to verify bot status:
   ```sql
   SELECT "userId", status, "isExpired"
   FROM "BotActivation"
   WHERE "userId" = 'YOUR_USER_ID';
   ```

2. **Check referral chain**: Verify referral relationships:
   ```sql
   SELECT "id", "email", "referralCode", "referredBy"
   FROM "User"
   WHERE "referralCode" IN ('YOUR_REFERRAL_CODE', 'REFERRER_CODES');
   ```

3. **Check package status**: Ensure packages are active:
   ```sql
   SELECT "id", "userId", "amount", "status"
   FROM "Package"
   WHERE "userId" IN ('REFERRAL_USER_IDS');
   ```