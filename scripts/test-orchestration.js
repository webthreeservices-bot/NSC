#!/usr/bin/env node

/**
 * Test Orchestration Script
 * 
 * Runs comprehensive test suites in the correct order and generates
 * a consolidated report of all test results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestOrchestrator {
  constructor() {
    this.results = {
      suites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      }
    };
    this.startTime = Date.now();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'debug': '🔍'
    }[level] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTestSuite(name, command, options = {}) {
    this.log(`Starting ${name}...`);
    const suiteStartTime = Date.now();
    
    try {
      const result = execSync(command, {
        stdio: options.quiet ? 'pipe' : 'inherit',
        timeout: options.timeout || 300000, // 5 minutes default
        cwd: process.cwd(),
        env: { ...process.env, ...options.env }
      });
      
      const duration = Date.now() - suiteStartTime;
      this.results.suites.push({
        name,
        status: 'passed',
        duration,
        output: result ? result.toString() : null
      });
      
      this.results.summary.passed++;
      this.log(`${name} completed successfully in ${duration}ms`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - suiteStartTime;
      this.results.suites.push({
        name,
        status: 'failed',
        duration,
        error: error.message,
        output: error.stdout ? error.stdout.toString() : null
      });
      
      this.results.summary.failed++;
      this.log(`${name} failed after ${duration}ms: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting NSC Bot Platform Test Orchestration\n');
    
    // Test execution order is important
    const testSuites = [
      {
        name: 'Environment Check',
        command: 'npm run check:env',
        options: { timeout: 30000 }
      },
      {
        name: 'Lint & Type Check',
        command: 'npm run lint && npx tsc --noEmit',
        options: { timeout: 60000 }
      },
      {
        name: 'Unit Tests',
        command: 'npm test -- --passWithNoTests --coverage',
        options: { timeout: 120000 }
      },
      {
        name: 'Build Test',
        command: 'npm run build',
        options: { timeout: 180000 }
      },
      {
        name: 'Database Connection Test',
        command: 'npm run db:test',
        options: { 
          timeout: 30000,
          env: { NODE_ENV: 'test' }
        }
      },
      {
        name: 'Schema Verification',
        command: 'npm run db:verify',
        options: { 
          timeout: 60000,
          env: { NODE_ENV: 'test' }
        }
      },
      {
        name: 'Memory Leak Detection',
        command: 'npm run test:memory-leaks',
        options: { timeout: 120000 }
      },
      {
        name: 'E2E Tests - Auth Flow',
        command: 'npm run test:auth',
        options: { timeout: 180000 }
      },
      {
        name: 'E2E Tests - Dashboard',
        command: 'npm run test:dashboard',
        options: { timeout: 180000 }
      },
      {
        name: 'E2E Tests - Packages',
        command: 'npm run test:packages',
        options: { timeout: 180000 }
      },
      {
        name: 'E2E Tests - Admin Panel',
        command: 'npm run test:admin',
        options: { timeout: 180000 }
      },
      {
        name: 'Performance Tests',
        command: 'npm run test:performance',
        options: { timeout: 300000 }
      },
      {
        name: 'Security Audit',
        command: 'npm audit --audit-level moderate',
        options: { timeout: 60000 }
      },
      {
        name: 'Final Completion Verification',
        command: 'npm run test:completion-verification',
        options: { timeout: 120000 }
      }
    ];

    // Execute test suites
    for (const suite of testSuites) {
      this.results.summary.total++;
      await this.runTestSuite(suite.name, suite.command, suite.options);
      
      // Add small delay between test suites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.generateReport();
  }

  generateReport() {
    const endTime = Date.now();
    this.results.summary.duration = endTime - this.startTime;
    
    this.log('\n📊 TEST ORCHESTRATION REPORT', 'info');
    this.log('═'.repeat(60), 'info');
    
    // Summary
    this.log(`Total Test Suites: ${this.results.summary.total}`, 'info');
    this.log(`✅ Passed: ${this.results.summary.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.summary.failed}`, 'error');
    this.log(`⏱️  Total Duration: ${(this.results.summary.duration / 1000).toFixed(2)}s`, 'info');
    
    const successRate = (this.results.summary.passed / this.results.summary.total * 100).toFixed(1);
    this.log(`📈 Success Rate: ${successRate}%`, successRate > 90 ? 'success' : 'warning');
    
    this.log('\n📋 DETAILED RESULTS:', 'info');
    this.log('─'.repeat(60), 'info');
    
    // Detailed results
    this.results.suites.forEach(suite => {
      const status = suite.status === 'passed' ? '✅' : '❌';
      const duration = (suite.duration / 1000).toFixed(2);
      this.log(`${status} ${suite.name} (${duration}s)`, suite.status === 'passed' ? 'success' : 'error');
      
      if (suite.error) {
        this.log(`   Error: ${suite.error}`, 'error');
      }
    });
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      suites: this.results.suites,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd()
      }
    };
    
    const reportPath = path.join(process.cwd(), 'test-orchestration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info');
    
    // Final status
    if (this.results.summary.failed === 0) {
      this.log('\n🎉 ALL TESTS PASSED! NSC Bot Platform is ready for deployment!', 'success');
    } else {
      this.log(`\n⚠️  ${this.results.summary.failed} test suite(s) failed. Please review and fix before deployment.`, 'warning');
    }
    
    this.log('═'.repeat(60), 'info');
    
    // Exit with appropriate code
    process.exit(this.results.summary.failed > 0 ? 1 : 0);
  }
}

// Run if called directly
if (require.main === module) {
  const orchestrator = new TestOrchestrator();
  orchestrator.runAllTests().catch(error => {
    console.error('❌ Test orchestration failed:', error);
    process.exit(1);
  });
}

module.exports = TestOrchestrator;