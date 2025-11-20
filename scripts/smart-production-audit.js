/**
 * SMART PRODUCTION AUDIT
 * Focuses on real, actionable bugs only
 */

const fs = require('fs');
const path = require('path');

const realIssues = {
  critical: [],
  high: [],
  medium: []
};

let filesScanned = 0;

function smartAnalyze(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  // Skip non-production files
  if (relativePath.includes('node_modules') ||
      relativePath.includes('.next') ||
      relativePath.includes('scripts') ||
      relativePath.includes('test') ||
      relativePath.includes('spec')) {
    return;
  }

  filesScanned++;

  // Only check API routes
  if (!relativePath.includes('/api/') || !relativePath.endsWith('route.ts')) {
    return;
  }

  const lines = content.split('\n');

  // 1. Missing authentication on protected endpoints
  checkMissingAuth(content, relativePath);

  // 2. Missing transaction rollback
  checkMissingRollback(content, relativePath, lines);

  // 3. Missing amount validation
  checkAmountValidation(content, relativePath, lines);

  // 4. Race conditions in balance updates
  checkRaceConditions(content, relativePath);

  // 5. Missing input validation
  checkMissingInputValidation(content, relativePath);
}

function checkMissingAuth(content, file) {
  const publicEndpoints = [
    '/login/', '/register/', '/verify-email/', '/forgot-password/',
    '/reset-password/', '/health/', '/status/', '/webhook/'
  ];

  const isPublic = publicEndpoints.some(ep => file.includes(ep));

  if (!isPublic && !content.includes('authenticateToken')) {
    realIssues.critical.push({
      file,
      type: 'MISSING_AUTH',
      message: 'Protected API endpoint without authentication',
      impact: 'Anyone can access this endpoint without logging in',
      fix: 'Add authentication check at the start of the handler'
    });
  }

  // Check auth bypass
  if (content.includes('authenticateToken') &&
      !content.includes('authResult instanceof NextResponse')) {
    realIssues.high.push({
      file,
      type: 'AUTH_BYPASS',
      message: 'Authentication result not properly validated',
      impact: 'Authentication can potentially be bypassed',
      fix: 'Add: if (authResult instanceof NextResponse) return authResult'
    });
  }
}

function checkMissingRollback(content, file, lines) {
  if (!content.includes('BEGIN')) return;

  const hasCatch = content.includes('catch');
  const hasRollback = content.includes('ROLLBACK');

  if (hasCatch && !hasRollback) {
    realIssues.critical.push({
      file,
      type: 'MISSING_ROLLBACK',
      message: 'Transaction without ROLLBACK in error handler',
      impact: 'Failed transactions not rolled back = data corruption',
      fix: 'Add: await client.query("ROLLBACK") in catch block'
    });
  }
}

function checkAmountValidation(content, file, lines) {
  // Check withdrawal/payment endpoints
  if (content.includes('amount') &&
      (file.includes('withdraw') || file.includes('payment') || file.includes('deposit'))) {

    const hasPositiveCheck = content.includes('amount > 0') ||
                             content.includes('amount <= 0') ||
                             content.includes('amount < ');

    if (!hasPositiveCheck) {
      realIssues.high.push({
        file,
        type: 'NO_AMOUNT_VALIDATION',
        message: 'Financial amount not validated for positive values',
        impact: 'Users can submit negative or zero amounts',
        fix: 'Add: if (amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })'
      });
    }
  }
}

function checkRaceConditions(content, file) {
  // Look for balance updates without transactions
  const hasBalanceUpdate = content.includes('UPDATE') && content.includes('balance');
  const hasBalanceSelect = content.includes('SELECT') && content.includes('balance');

  if (hasBalanceUpdate && hasBalanceSelect) {
    const hasTransaction = content.includes('BEGIN') && content.includes('COMMIT');

    if (!hasTransaction) {
      realIssues.critical.push({
        file,
        type: 'RACE_CONDITION',
        message: 'Balance read/update without transaction',
        impact: 'Concurrent requests can corrupt balance data',
        fix: 'Wrap SELECT and UPDATE in BEGIN...COMMIT transaction'
      });
    }
  }
}

function checkMissingInputValidation(content, file) {
  if (!content.includes('request.json()')) return;

  const hasValidation = content.includes('.safeParse(') ||
                        content.includes('.parse(') ||
                        content.includes('validateSchema');

  if (!hasValidation) {
    realIssues.high.push({
      file,
      type: 'NO_INPUT_VALIDATION',
      message: 'User input accepted without validation',
      impact: 'Invalid/malicious data can cause crashes',
      fix: 'Add Zod schema validation with .safeParse()'
    });
  }
}

function scanDir(dir) {
  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      if (item === 'node_modules' || item === '.next' || item === '.git') continue;

      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        try {
          smartAnalyze(fullPath);
        } catch (e) {
          // Skip files that can't be read
        }
      }
    }
  } catch (e) {
    // Skip directories that can't be read
  }
}

console.log('\n🔍 SMART PRODUCTION AUDIT');
console.log('='.repeat(80));
console.log('\nScanning API endpoints for real production bugs...\n');

const srcPath = path.join(__dirname, '..');
scanDir(srcPath);

console.log(`Scanned ${filesScanned} files\n`);

const total = realIssues.critical.length + realIssues.high.length + realIssues.medium.length;

console.log('='.repeat(80));
console.log(`REAL BUGS FOUND: ${total}`);
console.log(`Critical: ${realIssues.critical.length}`);
console.log(`High: ${realIssues.high.length}`);
console.log(`Medium: ${realIssues.medium.length}`);
console.log('='.repeat(80));

if (realIssues.critical.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES\n');
  realIssues.critical.forEach((bug, i) => {
    console.log(`${i + 1}. ${bug.type} - ${bug.file}`);
    console.log(`   ❌ ${bug.message}`);
    console.log(`   ⚠️  ${bug.impact}`);
    console.log(`   ✅ ${bug.fix}\n`);
  });
}

if (realIssues.high.length > 0) {
  console.log('\n⚠️  HIGH PRIORITY\n');
  realIssues.high.forEach((bug, i) => {
    console.log(`${i + 1}. ${bug.type} - ${bug.file}`);
    console.log(`   ❌ ${bug.message}`);
    console.log(`   ⚠️  ${bug.impact}`);
    console.log(`   ✅ ${bug.fix}\n`);
  });
}

const reportPath = path.join(__dirname, 'production-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(realIssues, null, 2));
console.log(`\n📄 Report: ${reportPath}\n`);

console.log('='.repeat(80));
if (total === 0) {
  console.log('✅ NO BUGS FOUND! Production ready! 🎉');
} else {
  console.log(`❌ ${total} issues must be fixed before production`);
}
console.log('='.repeat(80));
console.log('');

process.exit(total > 0 ? 1 : 0);
