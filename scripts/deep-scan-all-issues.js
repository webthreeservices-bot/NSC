const fs = require('fs');
const path = require('path');

const LIVE_SCHEMA = {
  User: ['id', 'email', 'password', 'username', 'fullName', 'phone', 'referralCode', 'referredBy', 'referrerId', 'walletAddress', 'role', 'kycStatus', 'isActive', 'isBlocked', 'hasPurchasedBot'],
  Package: ['id', 'userId', 'amount', 'packageType', 'roiPercentage', 'status', 'network', 'depositTxHash', 'paymentRequestId', 'investmentDate', 'expiryDate', 'totalRoiPaid', 'roiPaidCount', 'notes', 'activatedAt', 'approvedBy', 'approvedAt'],
  Withdrawal: ['id', 'userId', 'amount', 'fee', 'netAmount', 'walletAddress', 'network', 'txHash', 'status', 'type', 'notes', 'approvedBy', 'approvedAt', 'rejectedBy', 'rejectedAt', 'transactionId'],
  Transaction: ['id', 'userId', 'type', 'amount', 'status', 'description', 'txHash', 'network', 'referenceId', 'referenceType'],
  Earning: ['id', 'userId', 'fromUserId', 'packageId', 'transactionId', 'earningType', 'amount', 'level', 'percentage', 'status'],
  Notification: ['id', 'userId', 'title', 'message', 'type', 'referenceId', 'referenceType', 'isRead']
};

const WRONG_FIELDS = {
  User: { name: 'fullName' },
  Package: { isActive: 'status', description: 'notes', expiresAt: 'expiryDate', duration: null },
  Withdrawal: { transactionHash: 'txHash' },
  Earning: { type: 'earningType' }
};

const VALID_ENUMS = ['AdminActionType', 'BotStatus', 'CronJobStatus', 'EarningType', 'KYCStatus', 'Network', 'NotificationType', 'PackageStatus', 'PackageType', 'PaymentStatus', 'RoiPaymentStatus', 'SessionStatus', 'TicketPriority', 'TicketStatus', 'TransactionStatus', 'TransactionType', 'UserRole', 'WithdrawalStatus', 'WithdrawalType'];

const INVALID_ENUMS = ['ReferenceType', 'TargetType', 'EarningStatus'];

const issues = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(process.cwd(), filePath);

  // Skip if file is too large or is a generated file
  if (content.length > 500000 || fileName.includes('node_modules') || fileName.includes('.next')) return;

  // Check for invalid enum casts
  INVALID_ENUMS.forEach(enumName => {
    if (content.includes(`::"${enumName}"`)) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(`::"${enumName}"`)) {
          issues.push({
            file: fileName,
            line: idx + 1,
            type: 'INVALID_ENUM_CAST',
            issue: `Cast to non-existent enum: ::"${enumName}"`,
            fix: `Remove ::"${enumName}" - field is TEXT`
          });
        }
      });
    }
  });

  // Check for wrong field names
  Object.keys(WRONG_FIELDS).forEach(table => {
    Object.keys(WRONG_FIELDS[table]).forEach(wrongField => {
      const correctField = WRONG_FIELDS[table][wrongField];
      const patterns = [
        new RegExp(`"${wrongField}"\\s*[,=:]`, 'g'),
        new RegExp(`\\.${wrongField}\\b`, 'g')
      ];

      patterns.forEach(pattern => {
        if (pattern.test(content) && content.includes(`"${table}"`)) {
          issues.push({
            file: fileName,
            type: 'WRONG_FIELD_NAME',
            table: table,
            wrong: wrongField,
            correct: correctField || 'DELETE',
            fix: correctField ? `Use "${correctField}" instead of "${wrongField}"` : `Remove "${wrongField}" - doesn't exist`
          });
        }
      });
    });
  });

  // Check for missing enum casts in INSERT/UPDATE
  const insertMatches = content.match(/INSERT INTO "(\w+)"[^;]+VALUES[^;]+'(PENDING|ACTIVE|COMPLETED|APPROVED)'/gi);
  if (insertMatches) {
    insertMatches.forEach(match => {
      if (!match.includes('::')) {
        issues.push({
          file: fileName,
          type: 'MISSING_ENUM_CAST',
          issue: 'Status value without enum cast',
          fix: 'Add ::"EnumType" after status value'
        });
      }
    });
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
      scanDirectory(fullPath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) && !file.includes('.test.') && !file.includes('.spec.')) {
      try {
        scanFile(fullPath);
      } catch (e) {
        // Skip files that can't be read
      }
    }
  });
}

console.log('\n🔍 DEEP SCANNING ENTIRE CODEBASE...\n');

const srcPath = path.join(process.cwd(), 'app');
const libPath = path.join(process.cwd(), 'lib');
const servicesPath = path.join(process.cwd(), 'services');

scanDirectory(srcPath);
scanDirectory(libPath);
scanDirectory(servicesPath);

console.log(`\n📊 SCAN COMPLETE - Found ${issues.length} issues\n`);

if (issues.length > 0) {
  const grouped = {};
  issues.forEach(issue => {
    const key = issue.type;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(issue);
  });

  Object.keys(grouped).forEach(type => {
    console.log(`\n${type} (${grouped[type].length}):`);
    grouped[type].slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.file}`);
      if (issue.line) console.log(`    Line ${issue.line}: ${issue.issue}`);
      if (issue.wrong) console.log(`    Wrong: ${issue.wrong} → Correct: ${issue.correct}`);
      console.log(`    Fix: ${issue.fix}`);
    });
    if (grouped[type].length > 10) {
      console.log(`    ... and ${grouped[type].length - 10} more`);
    }
  });
}

fs.writeFileSync('scripts/deep-scan-results.json', JSON.stringify(issues, null, 2));
console.log(`\n📄 Full results: scripts/deep-scan-results.json`);
console.log(`\nTotal issues: ${issues.length}\n`);

process.exit(issues.length > 0 ? 1 : 0);
