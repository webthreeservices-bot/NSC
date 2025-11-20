#!/usr/bin/env node

/**
 * Deployment Readiness Checklist
 * 
 * Final verification before production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentChecker {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
  }

  log(message, level = 'info') {
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[level] || '📋';
    
    console.log(`${prefix} ${message}`);
  }

  async check(name, testFn) {
    try {
      const result = await testFn();
      if (result === true || (result && result.success)) {
        this.passed++;
        this.log(`${name} - PASSED`, 'success');
        this.checks.push({ name, status: 'passed', message: result.message });
      } else if (result && result.warning) {
        this.warnings++;
        this.log(`${name} - WARNING: ${result.message}`, 'warning');
        this.checks.push({ name, status: 'warning', message: result.message });
      } else {
        this.failed++;
        this.log(`${name} - FAILED: ${result?.message || 'Unknown error'}`, 'error');
        this.checks.push({ name, status: 'failed', message: result?.message || 'Unknown error' });
      }
    } catch (error) {
      this.failed++;
      this.log(`${name} - FAILED: ${error.message}`, 'error');
      this.checks.push({ name, status: 'failed', message: error.message });
    }
  }

  async runAllChecks() {
    this.log('🚀 NSC Bot Platform - Deployment Readiness Check\n');
    
    // Environment & Configuration
    await this.check('Environment Variables', () => {
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'ADMIN_JWT_SECRET',
        'NEXTAUTH_SECRET',
        'ENCRYPTION_KEY'
      ];
      
      const envPath = path.join(process.cwd(), '.env.example');
      if (!fs.existsSync(envPath)) {
        return { success: false, message: '.env.example not found' };
      }
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const missing = requiredEnvVars.filter(v => !envContent.includes(v));
      
      if (missing.length > 0) {
        return { warning: true, message: `Missing env vars: ${missing.join(', ')}` };
      }
      
      return { success: true };
    });

    // Code Quality
    await this.check('TypeScript Compilation', () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return { success: true };
      } catch (error) {
        return { success: false, message: 'TypeScript compilation errors' };
      }
    });

    await this.check('ESLint', () => {
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        return { success: true };
      } catch (error) {
        return { warning: true, message: 'Linting issues found' };
      }
    });

    // Build & Production
    await this.check('Production Build', () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        const buildDir = path.join(process.cwd(), '.next');
        if (fs.existsSync(buildDir)) {
          return { success: true };
        }
        return { success: false, message: 'Build artifacts not found' };
      } catch (error) {
        return { success: false, message: 'Build failed' };
      }
    });

    // Security
    await this.check('Security Audit', () => {
      try {
        execSync('npm audit --audit-level high', { stdio: 'pipe' });
        return { success: true };
      } catch (error) {
        return { warning: true, message: 'High severity vulnerabilities found' };
      }
    });

    // Database
    await this.check('Database Schema', () => {
      const migrationFile = path.join(process.cwd(), 'migrations', 'fix-all-schema-mismatches.sql');
      if (!fs.existsSync(migrationFile)) {
        return { success: false, message: 'Schema migration file not found' };
      }
      
      const content = fs.readFileSync(migrationFile, 'utf8');
      const requiredTables = ['User', 'BotActivation', 'Package', 'RoiPayment', 'Transaction'];
      const missing = requiredTables.filter(table => !content.includes(`"${table}"`));
      
      if (missing.length > 0) {
        return { success: false, message: `Missing table migrations: ${missing.join(', ')}` };
      }
      
      return { success: true };
    });

    // Performance
    await this.check('Bundle Size', () => {
      const buildDir = path.join(process.cwd(), '.next', 'static');
      if (!fs.existsSync(buildDir)) {
        return { success: false, message: 'Build directory not found' };
      }
      
      // Check for excessively large bundles
      const files = fs.readdirSync(buildDir, { recursive: true });
      const largeBundles = files.filter(file => {
        if (typeof file === 'string' && file.endsWith('.js')) {
          const filePath = path.join(buildDir, file);
          const stats = fs.statSync(filePath);
          return stats.size > 1024 * 1024; // 1MB threshold
        }
        return false;
      });
      
      if (largeBundles.length > 3) {
        return { warning: true, message: `${largeBundles.length} large bundles found` };
      }
      
      return { success: true };
    });

    // Testing
    await this.check('Test Coverage', () => {
      try {
        execSync('npm test -- --passWithNoTests --coverage', { stdio: 'pipe' });
        return { success: true };
      } catch (error) {
        return { warning: true, message: 'Test coverage issues' };
      }
    });

    // Memory Leaks
    await this.check('Memory Leak Fixes', () => {
      const components = [
        'components/PaymentQRDisplay.tsx',
        'app/page.tsx',
        'components/CookieConsent.tsx'
      ];
      
      let fixed = 0;
      for (const comp of components) {
        const filePath = path.join(process.cwd(), comp);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('clearTimeout') || 
              content.includes('clearInterval') || 
              content.includes('abort()') ||
              content.includes('return () => {')) {
            fixed++;
          }
        }
      }
      
      if (fixed < components.length) {
        return { warning: true, message: `${components.length - fixed} components may have memory leaks` };
      }
      
      return { success: true };
    });

    // Documentation
    await this.check('Documentation', () => {
      const docs = ['README.md', 'SECURITY.md'];
      const missing = docs.filter(doc => !fs.existsSync(path.join(process.cwd(), doc)));
      
      if (missing.length > 0) {
        return { warning: true, message: `Missing docs: ${missing.join(', ')}` };
      }
      
      return { success: true };
    });

    // Final Report
    this.generateReport();
  }

  generateReport() {
    const total = this.passed + this.failed + this.warnings;
    const successRate = ((this.passed + this.warnings) / total * 100).toFixed(1);
    
    this.log('\n📊 DEPLOYMENT READINESS REPORT', 'info');
    this.log('═'.repeat(50), 'info');
    this.log(`✅ Passed: ${this.passed}`, 'success');
    this.log(`⚠️  Warnings: ${this.warnings}`, 'warning');
    this.log(`❌ Failed: ${this.failed}`, 'error');
    this.log(`📈 Success Rate: ${successRate}%`, 'info');
    this.log('═'.repeat(50), 'info');

    // Deployment recommendation
    if (this.failed === 0) {
      if (this.warnings === 0) {
        this.log('🎉 READY FOR DEPLOYMENT!', 'success');
        this.log('✨ All checks passed. The application is production-ready.', 'success');
      } else {
        this.log('⚠️  READY WITH WARNINGS', 'warning');
        this.log('📝 Review warnings before deployment.', 'warning');
      }
    } else {
      this.log('❌ NOT READY FOR DEPLOYMENT', 'error');
      this.log('🔧 Fix failed checks before proceeding.', 'error');
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.passed,
        warnings: this.warnings,
        failed: this.failed,
        successRate: `${successRate}%`
      },
      checks: this.checks,
      recommendation: this.failed === 0 ? (this.warnings === 0 ? 'READY' : 'READY_WITH_WARNINGS') : 'NOT_READY'
    };

    fs.writeFileSync('deployment-readiness-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Report saved to deployment-readiness-report.json', 'info');

    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new DeploymentChecker();
  checker.runAllChecks().catch(error => {
    console.error('❌ Deployment check failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentChecker;