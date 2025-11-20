/**
 * SCAN ALL ADMIN ENDPOINTS FOR SQL DATABASE ISSUES
 * Finds all SQL queries and checks against live database schema
 */

const fs = require('fs');
const path = require('path');

// Live database schema from our extraction
const LIVE_ENUMS = {
  'AdminActionType': true,
  'BotStatus': true,
  'CronJobStatus': true,
  'EarningType': true,
  'KYCStatus': true,
  'Network': true,
  'NotificationType': true,
  'PackageStatus': true,
  'PackageType': true,
  'PaymentStatus': true,
  'RoiPaymentStatus': true,
  'SessionStatus': true,
  'TicketPriority': true,
  'TicketStatus': true,
  'TransactionStatus': true,
  'TransactionType': true,
  'UserRole': true,
  'WithdrawalStatus': true,
  'WithdrawalType': true,
  // These DON'T exist:
  'ReferenceType': false,
  'TargetType': false,
  'EarningStatus': false
};

const LIVE_TABLES = {
  'User': {
    fields: ['id', 'email', 'password', 'username', 'fullName', 'phone', 'referralCode', 'referredBy', 'referrerId', 'walletAddress', 'role', 'kycStatus', 'isActive', 'isBlocked', 'hasPurchasedBot', 'totalEarnings', 'availableBalance', 'totalWithdrawn', 'totalInvested', 'totalReferrals', 'failedLoginAttempts', 'lastLogin', 'lastLoginIp', 'lastFailedLoginAt', 'lastActiveAt', 'accountLockedUntil', 'emailVerified', 'emailVerifiedAt', 'phoneVerified', 'twoFactorEnabled', 'twoFactorSecret', 'passwordResetToken', 'passwordResetExpires', 'blockedBy', 'blockedAt', 'blockReason', 'notes', 'metadata', 'createdAt', 'updatedAt'],
    notExist: ['name'] // Common mistake
  },
  'Package': {
    fields: ['id', 'userId', 'amount', 'packageType', 'roiPercentage', 'status', 'network', 'depositTxHash', 'paymentRequestId', 'investmentDate', 'purchaseDate', 'activatedAt', 'expiryDate', 'expiredAt', 'lastRoiDate', 'nextRoiDate', 'totalRoiPaid', 'roiPaidCount', 'totalEarnings', 'isExpired', 'capitalReturned', 'capitalReturnedAt', 'approvedBy', 'approvedAt', 'rejectedBy', 'rejectedAt', 'rejectionReason', 'notes', 'metadata', 'createdAt', 'updatedAt'],
    notExist: ['name', 'description', 'isActive', 'duration', 'expiresAt']
  },
  'Withdrawal': {
    fields: ['id', 'userId', 'amount', 'requestedAmount', 'fee', 'feePercentage', 'netAmount', 'walletAddress', 'network', 'txHash', 'status', 'type', 'notes', 'adminNotes', 'approvedBy', 'approvedAt', 'rejectedBy', 'rejectedAt', 'rejectionReason', 'processedAt', 'completedAt', 'metadata', 'transactionId', 'packageId', 'createdAt', 'updatedAt'],
    notExist: ['transactionHash']
  },
  'Transaction': {
    fields: ['id', 'userId', 'type', 'amount', 'fee', 'netAmount', 'status', 'description', 'txHash', 'network', 'blockNumber', 'confirmations', 'fromAddress', 'toAddress', 'referenceId', 'referenceType', 'metadata', 'createdAt', 'updatedAt'],
    notExist: []
  },
  'Earning': {
    fields: ['id', 'userId', 'fromUserId', 'packageId', 'transactionId', 'earningType', 'amount', 'level', 'percentage', 'status', 'sourceId', 'sourceType', 'metadata', 'createdAt'],
    notExist: ['type', 'updatedAt']
  }
};

const issues = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(process.cwd(), filePath);

  // Check for enum casts to non-existent types
  const enumCastPattern = /::"(\w+)"/g;
  let match;
  while ((match = enumCastPattern.exec(content)) !== null) {
    const enumName = match[1];
    if (LIVE_ENUMS[enumName] === false) {
      issues.push({
        file: fileName,
        type: 'MISSING_ENUM',
        enum: enumName,
        line: content.substring(0, match.index).split('\n').length,
        severity: 'HIGH',
        fix: `Remove ::"${enumName}" cast or create enum in database`
      });
    }
  }

  // Check for common field mistakes
  Object.keys(LIVE_TABLES).forEach(tableName => {
    const table = LIVE_TABLES[tableName];

    // Check for fields that don't exist
    table.notExist.forEach(field => {
      const patterns = [
        new RegExp(`"${field}"\\s*=`, 'g'),
        new RegExp(`${field}\\s*=`, 'g'),
        new RegExp(`"${field}"\\s*,`, 'g'),
        new RegExp(`\\("${field}"`, 'g')
      ];

      patterns.forEach(pattern => {
        if (pattern.test(content) && content.includes(`"${tableName}"`)) {
          const matches = content.match(pattern);
          if (matches) {
            issues.push({
              file: fileName,
              type: 'NONEXISTENT_FIELD',
              table: tableName,
              field: field,
              severity: 'HIGH',
              fix: `Field "${field}" doesn't exist in ${tableName} table. Check database schema.`
            });
          }
        }
      });
    });
  });

  // Check for invalid enum values
  const invalidStatuses = [
    { value: 'INACTIVE', correct: 'Use PENDING, ACTIVE, EXPIRED, etc.' },
    { value: 'SUCCESS', context: 'status', correct: 'Use COMPLETED or ACTIVE' },
    { value: 'FAILED', context: 'Withdrawal', correct: 'Use REJECTED or CANCELLED' }
  ];

  invalidStatuses.forEach(({ value, context, correct }) => {
    if (content.includes(`'${value}'`) && (!context || content.includes(context))) {
      issues.push({
        file: fileName,
        type: 'INVALID_ENUM_VALUE',
        value: value,
        severity: 'MEDIUM',
        fix: correct
      });
    }
  });

  // Check for missing enum casts on INSERT/UPDATE
  const insertPattern = /INSERT INTO "(\w+)"[^;]+VALUES[^;]+/gi;
  while ((match = insertPattern.exec(content)) !== null) {
    const tableName = match[1];
    const statement = match[0];

    // Check if enum fields lack casting
    if (tableName === 'Package' && statement.includes("'PENDING'") && !statement.includes('::"PackageStatus"')) {
      const line = content.substring(0, match.index).split('\n').length;
      issues.push({
        file: fileName,
        type: 'MISSING_ENUM_CAST',
        table: tableName,
        line: line,
        severity: 'HIGH',
        fix: `Add enum cast: 'PENDING'::"PackageStatus"`
      });
    }

    if (tableName === 'Transaction' && (statement.includes("'COMPLETED'") || statement.includes("'PENDING'")) && !statement.includes('::"TransactionStatus"')) {
      const line = content.substring(0, match.index).split('\n').length;
      issues.push({
        file: fileName,
        type: 'MISSING_ENUM_CAST',
        table: tableName,
        line: line,
        severity: 'HIGH',
        fix: `Add enum cast for TransactionStatus and TransactionType`
      });
    }
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  });
}

console.log('\n🔍 SCANNING ALL ADMIN ENDPOINTS FOR SQL ISSUES\n');
console.log('='.repeat(80));

// Scan admin API routes
const adminApiPath = path.join(process.cwd(), 'app', 'api', 'admin');
if (fs.existsSync(adminApiPath)) {
  console.log('\n📂 Scanning:', adminApiPath);
  scanDirectory(adminApiPath);
}

// Scan admin pages
const adminPagesPath = path.join(process.cwd(), 'app', 'admin');
if (fs.existsSync(adminPagesPath)) {
  console.log('📂 Scanning:', adminPagesPath);
  scanDirectory(adminPagesPath);
}

console.log('\n' + '='.repeat(80));
console.log('📊 SCAN RESULTS');
console.log('='.repeat(80));

if (issues.length === 0) {
  console.log('\n✅ NO ISSUES FOUND!\n');
} else {
  console.log(`\n⚠️  Found ${issues.length} issues:\n`);

  // Group by severity
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');

  if (high.length > 0) {
    console.log(`🚨 HIGH PRIORITY (${high.length}):\n`);
    high.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.type}] ${issue.file}`);
      if (issue.line) console.log(`   Line: ${issue.line}`);
      if (issue.enum) console.log(`   Enum: ${issue.enum}`);
      if (issue.table) console.log(`   Table: ${issue.table}`);
      if (issue.field) console.log(`   Field: ${issue.field}`);
      console.log(`   Fix: ${issue.fix}\n`);
    });
  }

  if (medium.length > 0) {
    console.log(`\n⚠️  MEDIUM PRIORITY (${medium.length}):\n`);
    medium.slice(0, 5).forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.type}] ${issue.file}`);
      console.log(`   Fix: ${issue.fix}\n`);
    });
    if (medium.length > 5) {
      console.log(`   ... and ${medium.length - 5} more\n`);
    }
  }
}

// Save report
const report = {
  timestamp: new Date().toISOString(),
  totalIssues: issues.length,
  highPriority: issues.filter(i => i.severity === 'HIGH').length,
  mediumPriority: issues.filter(i => i.severity === 'MEDIUM').length,
  issues: issues
};

const reportPath = path.join(__dirname, 'admin-sql-issues-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('='.repeat(80));
console.log(`📄 Full report saved: ${reportPath}`);
console.log('='.repeat(80) + '\n');

process.exit(issues.length > 0 ? 1 : 0);
