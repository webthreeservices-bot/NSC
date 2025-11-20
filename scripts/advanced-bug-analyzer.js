/**
 * ADVANCED BUG ANALYZER
 *
 * Analyzes bugs with context to distinguish real issues from false positives
 */

const fs = require('fs');
const path = require('path');

const realBugs = {
  critical: [],
  high: [],
  medium: []
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  // Skip generated and dependency files
  if (relativePath.includes('node_modules') ||
      relativePath.includes('.next') ||
      relativePath.includes('scripts/')) {
    return;
  }

  const lines = content.split('\n');

  // 1. Check for REAL SQL injection (not false positives)
  checkRealSQLInjection(content, relativePath, lines);

  // 2. Check authentication issues
  checkAuthenticationIssues(content, relativePath, lines);

  // 3. Check for unhandled promise rejections
  checkUnhandledPromises(content, relativePath, lines);

  // 4. Check for race conditions
  checkRaceConditions(content, relativePath, lines);

  // 5. Check for sensitive data exposure
  checkSensitiveDataExposure(content, relativePath, lines);

  // 6. Check for incorrect number handling
  checkNumberHandling(content, relativePath, lines);

  // 7. Check for missing transaction rollbacks
  checkTransactionIssues(content, relativePath, lines);

  // 8. Check for user input without validation
  checkInputValidation(content, relativePath, lines);
}

function checkRealSQLInjection(content, file, lines) {
  // Only flag REAL SQL injection where user input is directly concatenated
  const patterns = [
    // Direct user input concatenation
    /query\([^)]*\+\s*req\./gi,
    /query\([^)]*\+\s*request\./gi,
    /query\([^)]*\+\s*body\./gi,
    /query\([^)]*\+\s*params\./gi,
    // String interpolation with request data
    /query\([^)]*`[^`]*\$\{req\./gi,
    /query\([^)]*`[^`]*\$\{request\./gi,
    /query\([^)]*`[^`]*\$\{body\./gi,
  ];

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1];

      // Double check it's not using parameterized queries
      if (!line.includes('$1') && !line.includes('$2')) {
        realBugs.critical.push({
          file,
          line: lineNum,
          type: 'SQL_INJECTION',
          severity: 'CRITICAL',
          message: 'User input directly concatenated into SQL query',
          code: line?.trim(),
          impact: 'Attacker can execute arbitrary SQL commands',
          fix: 'Use parameterized queries with $1, $2 placeholders'
        });
      }
    }
  });
}

function checkAuthenticationIssues(content, file, lines) {
  // Check API routes without authentication
  if (file.includes('/api/') && file.includes('route.')) {
    const publicEndpoints = [
      'login', 'register', 'verify-email', 'forgot-password',
      'reset-password', 'health', 'status', 'webhook'
    ];

    const isPublic = publicEndpoints.some(ep => file.includes(ep));

    if (!isPublic && !content.includes('authenticateToken')) {
      realBugs.critical.push({
        file,
        line: 1,
        type: 'MISSING_AUTHENTICATION',
        severity: 'CRITICAL',
        message: 'Protected API endpoint without authentication',
        impact: 'Unauthorized access to sensitive operations',
        fix: 'Add: const authResult = await authenticateToken(request)'
      });
    }

    // Check if authentication result is properly checked
    if (content.includes('authenticateToken')) {
      if (!content.includes('authResult instanceof NextResponse')) {
        realBugs.high.push({
          file,
          line: 'multiple',
          type: 'AUTH_CHECK_BYPASS',
          severity: 'HIGH',
          message: 'Authentication result not properly validated',
          impact: 'Authentication can be bypassed',
          fix: 'Add: if (authResult instanceof NextResponse) return authResult'
        });
      }
    }
  }
}

function checkUnhandledPromises(content, file, lines) {
  // Find async operations without proper error handling
  const asyncRegex = /await\s+(\w+\.\w+\([^)]*\))/g;
  let match;

  while ((match = asyncRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    const startLine = Math.max(0, lineNum - 10);
    const endLine = Math.min(lines.length, lineNum + 5);
    const context = lines.slice(startLine, endLine).join('\n');

    // Check if this await is inside a try-catch
    if (!context.includes('try') || !context.includes('catch')) {
      const line = lines[lineNum - 1];

      // Skip if it's assigning to a variable that might be checked
      if (!line.includes('const ') && !line.includes('let ') && !line.includes('var ')) {
        realBugs.high.push({
          file,
          line: lineNum,
          type: 'UNHANDLED_PROMISE',
          severity: 'HIGH',
          message: 'Async operation without error handling',
          code: line?.trim(),
          impact: 'Uncaught errors will crash the application',
          fix: 'Wrap in try-catch block'
        });
      }
    }
  }
}

function checkRaceConditions(content, file, lines) {
  // Check for potential race conditions in financial operations
  if (content.includes('balance') || content.includes('amount')) {
    // Look for read-modify-write without transactions
    const hasUpdate = content.match(/UPDATE.*balance/gi);
    const hasSelect = content.match(/SELECT.*balance/gi);

    if (hasUpdate && hasSelect) {
      // Check if it's in a transaction
      const hasTransaction = content.includes('BEGIN') && content.includes('COMMIT');

      if (!hasTransaction) {
        realBugs.critical.push({
          file,
          line: 'multiple',
          type: 'RACE_CONDITION',
          severity: 'CRITICAL',
          message: 'Balance update without transaction (race condition)',
          impact: 'Multiple concurrent requests can corrupt balance data',
          fix: 'Wrap SELECT and UPDATE in BEGIN/COMMIT transaction'
        });
      }
    }
  }
}

function checkSensitiveDataExposure(content, file, lines) {
  // Check for password or secret exposure
  const sensitiveRegex = /(password|secret|private.*key|token)/gi;
  const matches = content.matchAll(sensitiveRegex);

  for (const match of matches) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    const line = lines[lineNum - 1];

    // Check if it's being logged or returned
    const contextStart = Math.max(0, lineNum - 2);
    const contextEnd = Math.min(lines.length, lineNum + 2);
    const context = lines.slice(contextStart, contextEnd).join('\n');

    if (context.includes('console.log') ||
        context.includes('return') && context.includes(match[1])) {
      // Make sure it's not hashed or excluded
      if (!context.includes('hash') && !context.includes('omit') && !line.includes('//')) {
        realBugs.critical.push({
          file,
          line: lineNum,
          type: 'SENSITIVE_DATA_EXPOSURE',
          severity: 'CRITICAL',
          message: `Potential ${match[1]} exposure in logs or response`,
          code: line?.trim(),
          impact: 'Sensitive data leaked to logs or clients',
          fix: 'Remove sensitive fields before logging/returning'
        });
      }
    }
  }
}

function checkNumberHandling(content, file, lines) {
  // Check for financial calculations with floating point
  if (content.includes('amount') || content.includes('balance') || content.includes('fee')) {
    const floatOpsRegex = /(\w+)\s*[\+\-\*\/]\s*(\w+)/g;
    let match;

    while ((match = floatOpsRegex.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1];

      // Check if it's financial calculation without proper handling
      if ((line.includes('amount') || line.includes('balance') || line.includes('fee')) &&
          !line.includes('parseFloat') &&
          !line.includes('Number') &&
          !line.includes('//')) {

        realBugs.high.push({
          file,
          line: lineNum,
          type: 'FLOATING_POINT_ARITHMETIC',
          severity: 'HIGH',
          message: 'Financial calculation without proper decimal handling',
          code: line?.trim(),
          impact: 'Precision loss in financial calculations',
          fix: 'Use decimal library or multiply by 100 to work with cents'
        });
      }
    }
  }
}

function checkTransactionIssues(content, file, lines) {
  // Check for BEGIN without ROLLBACK
  if (content.includes('BEGIN')) {
    const hasCatch = content.includes('catch');
    const hasRollback = content.includes('ROLLBACK');

    if (hasCatch && !hasRollback) {
      realBugs.critical.push({
        file,
        line: 'multiple',
        type: 'MISSING_ROLLBACK',
        severity: 'CRITICAL',
        message: 'Database transaction without ROLLBACK in error handler',
        impact: 'Failed transactions not rolled back, data corruption',
        fix: 'Add await client.query("ROLLBACK") in catch block'
      });
    }

    // Check for COMMIT without checking for errors
    if (content.includes('COMMIT')) {
      const commitRegex = /client\.query\(['"`]COMMIT['"`]\)/g;
      let match;

      while ((match = commitRegex.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const prevLines = lines.slice(Math.max(0, lineNum - 5), lineNum);
        const context = prevLines.join('\n');

        // Check if previous operations checked for errors
        const hasErrorCheck = context.includes('if') || context.includes('?.') || context.includes('try');

        if (!hasErrorCheck) {
          realBugs.high.push({
            file,
            line: lineNum,
            type: 'UNSAFE_COMMIT',
            severity: 'HIGH',
            message: 'Transaction committed without error checking',
            impact: 'Partial transaction data may be committed',
            fix: 'Check for errors before COMMIT'
          });
        }
      }
    }
  }
}

function checkInputValidation(content, file, lines) {
  // Check API endpoints for missing input validation
  if (file.includes('/api/') && file.includes('route.')) {
    if (content.includes('request.json()') || content.includes('await request.body')) {
      const hasZodValidation = content.includes('.safeParse(') || content.includes('.parse(');
      const hasManualValidation = content.includes('if (!') || content.includes('validate');

      if (!hasZodValidation && !hasManualValidation) {
        realBugs.high.push({
          file,
          line: 'multiple',
          type: 'MISSING_INPUT_VALIDATION',
          severity: 'HIGH',
          message: 'User input accepted without validation',
          impact: 'Invalid data can cause crashes or security issues',
          fix: 'Add Zod schema validation or manual checks'
        });
      }
    }

    // Check for amount/number inputs
    if (content.includes('amount') || content.includes('withdrawal') || content.includes('deposit')) {
      const hasAmountCheck = content.includes('amount > 0') ||
                             content.includes('amount <') ||
                             content.includes('isNaN');

      if (!hasAmountCheck) {
        realBugs.high.push({
          file,
          line: 'multiple',
          type: 'MISSING_AMOUNT_VALIDATION',
          severity: 'HIGH',
          message: 'Financial amount not validated (negative/zero check)',
          impact: 'Users can submit negative or zero amounts',
          fix: 'Add: if (amount <= 0) return error'
        });
      }
    }
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);

    // Skip directories we don't need
    if (item === 'node_modules' || item === '.next' || item === '.git') {
      return;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        try {
          analyzeFile(fullPath);
        } catch (error) {
          console.error(`Error analyzing ${fullPath}:`, error.message);
        }
      }
    }
  });
}

function generateReport() {
  const total = realBugs.critical.length + realBugs.high.length + realBugs.medium.length;

  console.log('\n🔍 ADVANCED BUG ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log(`\nREAL BUGS FOUND (excluding false positives): ${total}`);
  console.log(`Critical: ${realBugs.critical.length}`);
  console.log(`High: ${realBugs.high.length}`);
  console.log(`Medium: ${realBugs.medium.length}\n`);

  if (realBugs.critical.length > 0) {
    console.log('\n🚨 CRITICAL BUGS (MUST FIX)\n');
    console.log('='.repeat(80));
    realBugs.critical.forEach((bug, i) => {
      console.log(`\n${i + 1}. ${bug.type}`);
      console.log(`   📂 ${bug.file}:${bug.line}`);
      console.log(`   ❌ ${bug.message}`);
      if (bug.code) console.log(`   💻 ${bug.code}`);
      console.log(`   ⚠️  Impact: ${bug.impact}`);
      console.log(`   ✅ Fix: ${bug.fix}`);
    });
  }

  if (realBugs.high.length > 0) {
    console.log('\n\n⚠️  HIGH PRIORITY BUGS\n');
    console.log('='.repeat(80));
    realBugs.high.slice(0, 15).forEach((bug, i) => {
      console.log(`\n${i + 1}. ${bug.type}`);
      console.log(`   📂 ${bug.file}:${bug.line}`);
      console.log(`   ❌ ${bug.message}`);
      if (bug.code) console.log(`   💻 ${bug.code.substring(0, 80)}`);
      console.log(`   ⚠️  Impact: ${bug.impact}`);
      console.log(`   ✅ Fix: ${bug.fix}`);
    });

    if (realBugs.high.length > 15) {
      console.log(`\n... and ${realBugs.high.length - 15} more high priority bugs`);
    }
  }

  // Save report
  const reportPath = path.join(__dirname, 'real-bugs-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(realBugs, null, 2));

  console.log(`\n\n📄 Full report: ${reportPath}\n`);

  return realBugs;
}

// Run
console.log('🚀 Starting advanced bug analysis...\n');
const srcPath = path.join(__dirname, '..');
scanDirectory(srcPath);
const report = generateReport();

console.log('='.repeat(80));
if (report.critical.length === 0) {
  console.log('✅ NO CRITICAL BUGS! ');
  if (report.high.length === 0) {
    console.log('✅ NO HIGH PRIORITY BUGS!');
    console.log('\n   Your app is production-ready! 🎉');
  } else {
    console.log(`⚠️  ${report.high.length} high priority issues should be fixed.`);
  }
} else {
  console.log('❌ CRITICAL BUGS MUST BE FIXED BEFORE PRODUCTION!');
}
console.log('='.repeat(80));
console.log('');

process.exit(report.critical.length > 0 ? 1 : 0);
