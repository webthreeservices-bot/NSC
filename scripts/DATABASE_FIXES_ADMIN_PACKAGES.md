# Database Field Mismatches - Admin Packages

## Issues Found

### 1. **POST endpoint in bot-packages/route.ts** (Lines 131-149)

**Problem**: Trying to insert fields that don't exist in the live database

| Field in Code | Status | Live Database Field |
|--------------|--------|---------------------|
| `name` | ❌ DOESN'T EXIST | N/A |
| `"isActive"` | ❌ DOESN'T EXIST | N/A |
| `duration` | ❌ DOESN'T EXIST | N/A |
| `description` | ❌ DOESN'T EXIST | Uses `notes` instead |
| `"userId"` | ❌ WRONG | Admin cannot insert with `userId` - should be from authenticated user |
| `status` | ⚠️ Using 'INACTIVE' | Should use 'PENDING', 'ACTIVE', 'EXPIRED', 'WITHDRAWN', 'CANCELLED', or 'COMPLETED' |

### 2. **PUT endpoint in bot-packages/route.ts** (Lines 207-220)

**Problem**: Same as POST - trying to update non-existent fields

| Field in Code | Status |
|--------------|--------|
| `name` | ❌ DOESN'T EXIST |
| `"isActive"` | ❌ DOESN'T EXIST |
| `duration` | ❌ DOESN'T EXIST |
| `description` | ❌ Should be `notes` |

### 3. **DELETE endpoint in bot-packages/route.ts** (Lines 269-273)

**Problem**: Trying to set `"isActive"` field that doesn't exist

Should use `status` field instead and set to 'CANCELLED' or keep it hard delete.

### 4. **approve route** (Line 76)

**Problem**: Field name mismatch

```typescript
// Current (WRONG):
SET status = 'ACTIVE', "depositTxHash" = $1

// Should be:
SET status = 'ACTIVE'::"PackageStatus", "depositTxHash" = $1
```

### 5. **Bot-packages GET route** (Lines 36-54)

**Status**: ✅ CORRECT - Already uses proper field names from live DB

## Live Database Package Table Schema

```sql
CREATE TABLE "Package" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "amount" NUMERIC(20,8) NOT NULL,
  "packageType" "PackageType" NOT NULL,  -- ENUM: 'NEO', 'NEURAL', 'ORACLE'
  "roiPercentage" NUMERIC(5,2) NOT NULL,
  "status" "PackageStatus" NOT NULL DEFAULT 'PENDING',  -- ENUM: PENDING, ACTIVE, EXPIRED, WITHDRAWN, CANCELLED, COMPLETED
  "network" "Network",
  "depositTxHash" TEXT,
  "paymentRequestId" TEXT,
  "investmentDate" TIMESTAMP,
  "purchaseDate" TIMESTAMP,
  "activatedAt" TIMESTAMP,
  "expiryDate" TIMESTAMP,
  "expiredAt" TIMESTAMP,
  "lastRoiDate" TIMESTAMP,
  "nextRoiDate" TIMESTAMP,
  "totalRoiPaid" NUMERIC(20,8) DEFAULT 0,
  "roiPaidCount" INTEGER DEFAULT 0,
  "totalEarnings" NUMERIC(20,8) DEFAULT 0,
  "isExpired" BOOLEAN DEFAULT false,
  "capitalReturned" BOOLEAN DEFAULT false,
  "capitalReturnedAt" TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP,
  "rejectedBy" TEXT,
  "rejectedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);
```

## Fields That DON'T Exist

- ❌ `name`
- ❌ `isActive`
- ❌ `duration`
- ❌ `description` (use `notes` instead)

## Correct Status Values (PackageStatus enum)

```typescript
'PENDING' | 'ACTIVE' | 'EXPIRED' | 'WITHDRAWN' | 'CANCELLED' | 'COMPLETED'
```

NOT: ~~'INACTIVE'~~
