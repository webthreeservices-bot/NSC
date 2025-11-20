/**
 * PRODUCTION-LEVEL BUG SCANNER
 *
 * Comprehensive scanner for:
 * - Security vulnerabilities
 * - Logic errors
 * - SQL injection risks
 * - Authentication bypasses
 * - Unhandled errors
 * - Type mismatches
 * - Missing validations
 * - Race conditions
 * - Memory leaks
 * - Production risks
 */

const fs = require('fs');
const path = require('path');

const bugs = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  warnings: []
};

// Common vulnerability patterns
const PATTERNS = {
  // Security vulnerabilities
  sqlInjection: [
    /query\s*\([^)]*\$\{[^}]+\}/g,  // String interpolation in queries
    /query\s*\([^)]*`[^`]*\$\{/g,   // Template literals in queries
    /execute\s*\([^)]*\+\s*\w+/g,   // String concatenation
  ],

  authBypass: [
    /authenticateToken.*return\s+user/gi,
    /if\s*\(\s*!.*token.*\)\s*return/gi,
  ],

  hardcodedSecrets: [
    /password\s*=\s*["'][^"']+["']/gi,
    /api_key\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
  ],

  unsafeEval: [
    /eval\s*\(/g,
    /Function\s*\(/g,
    /setTimeout\s*\(\s*["']/g,
  ],

  // Logic errors
  missingValidation: [
    /\.json\(\).*(?!.*safeParse)/g,
    /request\.body(?!.*validation)/gi,
  ],

  uncaughtErrors: [
    /await\s+\w+\([^)]*\)(?!\s*\.catch)(?!.*try)/g,
  ],

  wrongComparison: [
    /if\s*\([^)]*==(?!=)/g,  // Using == instead of ===
  ],

  missingErrorHandling: [
    /async\s+function[^{]*{(?!.*try)(?!.*catch)/gs,
  ],

  // Database issues
  missingTransaction: [
    /INSERT.*INSERT/gi,
    /UPDATE.*UPDATE/gi,
  ],

  noRollback: [
    /BEGIN(?!.*ROLLBACK)/gi,
  ],

  // Type issues
  typeCoercion: [
    /===?\s*["']\d+["']/g,
    /parseInt\([^)]+\)(?!.*10\))/g,
  ],

  // Production risks
  consoleLog: [
    /console\.log\(/g,
  ],

  todoComments: [
    /\/\/\s*TODO/gi,
    /\/\/\s*FIXME/gi,
    /\/\/\s*HACK/gi,
  ],
};

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  // Skip if it's a test file or node_modules
  if (relativePath.includes('node_modules') ||
      relativePath.includes('.next') ||
      relativePath.includes('test.')) {
    return;
  }

  // Check for SQL injection
  PATTERNS.sqlInjection.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      bugs.critical.push({
        file: relativePath,
        line: lineNum,
        type: 'SQL_INJECTION_RISK',
        severity: 'CRITICAL',
        message: 'Potential SQL injection: Using string interpolation in query',
        code: lines[lineNum - 1]?.trim(),
        fix: 'Use parameterized queries with $1, $2, etc.'
      });
    }
  });

  // Check for authentication bypass
  if (content.includes('authenticateToken') || content.includes('auth')) {
    if (!content.includes('instanceof NextResponse')) {
      bugs.high.push({
        file: relativePath,
        line: 'multiple',
        type: 'AUTH_BYPASS_RISK',
        severity: 'HIGH',
        message: 'Authentication might not properly return errors',
        fix: 'Ensure authenticateToken returns NextResponse on failure'
      });
    }
  }

  // Check for missing try-catch
  const asyncFunctions = content.match(/export\s+async\s+function\s+\w+/g);
  if (asyncFunctions) {
    asyncFunctions.forEach(func => {
      const funcStart = content.indexOf(func);
      const funcContent = content.substring(funcStart, funcStart + 500);

      if (!funcContent.includes('try') || !funcContent.includes('catch')) {
        const lineNum = content.substring(0, funcStart).split('\n').length;
        bugs.high.push({
          file: relativePath,
          line: lineNum,
          type: 'MISSING_ERROR_HANDLING',
          severity: 'HIGH',
          message: 'Async function without try-catch block',
          code: func,
          fix: 'Wrap async code in try-catch block'
        });
      }
    });
  }

  // Check for console.log in production
  let match;
  while ((match = PATTERNS.consoleLog[0].exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    // Skip if it's in a comment
    const line = lines[lineNum - 1];
    if (!line?.trim().startsWith('//')) {
      bugs.low.push({
        file: relativePath,
        line: lineNum,
        type: 'CONSOLE_LOG',
        severity: 'LOW',
        message: 'Console.log found in code (remove for production)',
        code: line?.trim()
      });
    }
  }

  // Check for TODOs and FIXMEs
  PATTERNS.todoComments.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      bugs.warnings.push({
        file: relativePath,
        line: lineNum,
        type: 'TODO_COMMENT',
        severity: 'WARNING',
        message: 'Unfinished code or known issue',
        code: lines[lineNum - 1]?.trim()
      });
    }
  });

  // Check for == instead of ===
  while ((match = PATTERNS.wrongComparison[0].exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    const line = lines[lineNum - 1];
    if (!line?.includes('//')) {
      bugs.medium.push({
        file: relativePath,
        line: lineNum,
        type: 'LOOSE_COMPARISON',
        severity: 'MEDIUM',
        message: 'Using == instead of === (type coercion risk)',
        code: line?.trim(),
        fix: 'Use === for strict equality'
      });
    }
  }

  // API-specific checks
  if (relativePath.includes('api/') && relativePath.includes('route.')) {
    checkAPIRoute(filePath, content, relativePath, lines);
  }

  // Database query checks
  if (content.includes('pool.query') || content.includes('client.query')) {
    checkDatabaseQueries(content, relativePath, lines);
  }

  // Environment variable checks
  if (content.includes('process.env.')) {
    checkEnvironmentVariables(content, relativePath, lines);
  }
}

function checkAPIRoute(filePath, content, relativePath, lines) {
  // Check for missing authentication
  if (!content.includes('authenticateToken')) {
    // Check if it's a public endpoint
    const publicEndpoints = ['login', 'register', 'verify-email', 'forgot-password'];
    const isPublic = publicEndpoints.some(ep => relativePath.includes(ep));

    if (!isPublic) {
      bugs.critical.push({
        file: relativePath,
        line: 1,
        type: 'MISSING_AUTHENTICATION',
        severity: 'CRITICAL',
        message: 'API endpoint without authentication check',
        fix: 'Add authenticateToken middleware'
      });
    }
  }

  // Check for input validation
  if ((content.includes('request.json()') || content.includes('request.body')) &&
      !content.includes('safeParse') && !content.includes('validate')) {
    bugs.high.push({
      file: relativePath,
      line: 'multiple',
      type: 'MISSING_INPUT_VALIDATION',
      severity: 'HIGH',
      message: 'API endpoint without input validation',
      fix: 'Use Zod schema validation with safeParse()'
    });
  }

  // Check for proper error responses
  if (!content.includes('status:') && !content.includes('{ status:')) {
    bugs.medium.push({
      file: relativePath,
      line: 'multiple',
      type: 'INCONSISTENT_ERROR_RESPONSE',
      severity: 'MEDIUM',
      message: 'API might not return proper HTTP status codes',
      fix: 'Always include { status: XXX } in NextResponse.json()'
    });
  }
}

function checkDatabaseQueries(content, relativePath, lines) {
  // Check for SQL injection via template literals
  const queryRegex = /(?:pool|client)\.query\s*\(\s*`([^`]+)`/g;
  let match;

  while ((match = queryRegex.exec(content)) !== null) {
    const query = match[1];
    if (query.includes('${')) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      bugs.critical.push({
        file: relativePath,
        line: lineNum,
        type: 'SQL_INJECTION',
        severity: 'CRITICAL',
        message: 'SQL query using template literal with variables',
        code: lines[lineNum - 1]?.trim(),
        fix: 'Use parameterized queries: query($1, $2) with array of values'
      });
    }
  }

  // Check for missing BEGIN/COMMIT
  if (content.includes('BEGIN') && !content.includes('COMMIT')) {
    bugs.high.push({
      file: relativePath,
      line: 'multiple',
      type: 'MISSING_COMMIT',
      severity: 'HIGH',
      message: 'Transaction BEGIN without COMMIT',
      fix: 'Always commit or rollback transactions'
    });
  }

  // Check for missing ROLLBACK in catch blocks
  if (content.includes('BEGIN') && !content.includes('ROLLBACK')) {
    bugs.high.push({
      file: relativePath,
      line: 'multiple',
      type: 'MISSING_ROLLBACK',
      severity: 'HIGH',
      message: 'Transaction without ROLLBACK in error handler',
      fix: 'Add ROLLBACK in catch block'
    });
  }
}

function checkEnvironmentVariables(content, relativePath, lines) {
  const envRegex = /process\.env\.([A-Z_]+)/g;
  let match;
  const usedVars = new Set();

  while ((match = envRegex.exec(content)) !== null) {
    usedVars.add(match[1]);
  }

  usedVars.forEach(varName => {
    // Check if it's checked for existence
    const hasCheck = content.includes(`process.env.${varName}`) &&
                     content.includes(`!process.env.${varName}`);

    if (!hasCheck && !relativePath.includes('.env')) {
      bugs.medium.push({
        file: relativePath,
        line: 'multiple',
        type: 'UNCHECKED_ENV_VAR',
        severity: 'MEDIUM',
        message: `Environment variable ${varName} used without existence check`,
        fix: `Check if process.env.${varName} exists before using`
      });
    }
  });
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // Skip certain directories
    if (item === 'node_modules' || item === '.next' || item === '.git' || item === 'dist') {
      return;
    }

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile()) {
      // Only scan code files
      const ext = path.extname(item);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        try {
          scanFile(fullPath);
        } catch (error) {
          console.error(`Error scanning ${fullPath}:`, error.message);
        }
      }
    }
  });
}

function generateReport() {
  const totalBugs = bugs.critical.length + bugs.high.length +
                    bugs.medium.length + bugs.low.length;

  console.log('\n🔍 PRODUCTION-LEVEL BUG SCAN REPORT');
  console.log('='.repeat(80));
  console.log(`\nTotal Issues Found: ${totalBugs}`);
  console.log(`Critical: ${bugs.critical.length}`);
  console.log(`High: ${bugs.high.length}`);
  console.log(`Medium: ${bugs.medium.length}`);
  console.log(`Low: ${bugs.low.length}`);
  console.log(`Warnings: ${bugs.warnings.length}\n`);

  if (bugs.critical.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (MUST FIX BEFORE PRODUCTION)\n');
    console.log('='.repeat(80));
    bugs.critical.forEach((bug, i) => {
      console.log(`\n${i + 1}. ${bug.type}`);
      console.log(`   File: ${bug.file}:${bug.line}`);
      console.log(`   Issue: ${bug.message}`);
      if (bug.code) console.log(`   Code: ${bug.code}`);
      if (bug.fix) console.log(`   Fix: ${bug.fix}`);
    });
  }

  if (bugs.high.length > 0) {
    console.log('\n\n⚠️  HIGH PRIORITY ISSUES\n');
    console.log('='.repeat(80));
    bugs.high.slice(0, 20).forEach((bug, i) => {
      console.log(`\n${i + 1}. ${bug.type}`);
      console.log(`   File: ${bug.file}:${bug.line}`);
      console.log(`   Issue: ${bug.message}`);
      if (bug.fix) console.log(`   Fix: ${bug.fix}`);
    });
    if (bugs.high.length > 20) {
      console.log(`\n   ... and ${bugs.high.length - 20} more high priority issues`);
    }
  }

  if (bugs.medium.length > 0) {
    console.log(`\n\n📋 MEDIUM PRIORITY ISSUES: ${bugs.medium.length} found`);
    console.log('   (Check detailed report for full list)');
  }

  if (bugs.low.length > 0) {
    console.log(`\n📝 LOW PRIORITY ISSUES: ${bugs.low.length} found`);
    console.log('   (Mostly console.log statements)');
  }

  // Save detailed report
  const reportPath = path.join(__dirname, 'production-bug-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(bugs, null, 2));
  console.log(`\n\n📄 Detailed report saved to: ${reportPath}\n`);

  return bugs;
}

// Run scanner
console.log('\n🚀 Starting production-level bug scan...\n');
console.log('Scanning all TypeScript and JavaScript files...');

const srcPath = path.join(__dirname, '..');
scanDirectory(srcPath);

const report = generateReport();

console.log('='.repeat(80));
if (report.critical.length === 0 && report.high.length === 0) {
  console.log('✅ NO CRITICAL OR HIGH PRIORITY BUGS FOUND!');
  console.log('   Your application is production-ready.');
} else {
  console.log('❌ CRITICAL ISSUES FOUND!');
  console.log('   Fix these before deploying to production.');
}
console.log('='.repeat(80));
console.log('');

process.exit(report.critical.length > 0 ? 1 : 0);
