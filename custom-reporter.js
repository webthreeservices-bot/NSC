// Custom Reporter for Continuous Testing
// Provides real-time progress tracking and comprehensive results

class ContinuousTestReporter {
  constructor(options = {}) {
    this.startTime = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.results = [];
    this.currentSuite = '';
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
    console.log(`🚀 Starting continuous test run with ${this.totalTests} tests`);
    console.log(`📊 Configuration: ${config.projects.length} project(s)`);
    console.log('⏱️  Started at:', new Date().toLocaleString());
    console.log('=' .repeat(80));
  }

  onTestBegin(test) {
    const progress = `(${this.passedTests + this.failedTests + this.skippedTests + 1}/${this.totalTests})`;
    console.log(`🔄 ${progress} Running: ${test.titlePath().join(' → ')}`);
  }

  onTestEnd(test, result) {
    const duration = `${result.duration}ms`;
    const progress = `(${this.passedTests + this.failedTests + this.skippedTests + 1}/${this.totalTests})`;
    
    this.results.push({
      title: test.titlePath().join(' → '),
      status: result.status,
      duration: result.duration,
      error: result.error?.message || null,
      project: test.parent.project()?.name || 'unknown'
    });

    switch (result.status) {
      case 'passed':
        this.passedTests++;
        console.log(`✅ ${progress} PASSED: ${test.titlePath().join(' → ')} (${duration})`);
        break;
      case 'failed':
        this.failedTests++;
        console.log(`❌ ${progress} FAILED: ${test.titlePath().join(' → ')} (${duration})`);
        if (result.error) {
          console.log(`   Error: ${result.error.message.split('\n')[0]}`);
        }
        break;
      case 'skipped':
        this.skippedTests++;
        console.log(`⏭️  ${progress} SKIPPED: ${test.titlePath().join(' → ')}`);
        break;
      case 'timedOut':
        this.failedTests++;
        console.log(`⏰ ${progress} TIMEOUT: ${test.titlePath().join(' → ')} (${duration})`);
        break;
    }

    // Progress indicator every 50 tests
    const completed = this.passedTests + this.failedTests + this.skippedTests;
    if (completed % 50 === 0) {
      const percent = ((completed / this.totalTests) * 100).toFixed(1);
      console.log(`📈 Progress: ${percent}% (${completed}/${this.totalTests}) - ✅${this.passedTests} ❌${this.failedTests} ⏭️${this.skippedTests}`);
    }
  }

  onEnd(result) {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    const minutes = Math.floor(totalDuration / 60000);
    const seconds = Math.floor((totalDuration % 60000) / 1000);

    console.log('=' .repeat(80));
    console.log('🏁 CONTINUOUS TEST RUN COMPLETED');
    console.log('=' .repeat(80));
    console.log(`⏱️  Total Duration: ${minutes}m ${seconds}s`);
    console.log(`📊 Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`⏭️  Skipped: ${this.skippedTests}`);
    console.log(`📈 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n🔍 FAILED TESTS SUMMARY:');
      console.log('-'.repeat(60));
      this.results
        .filter(r => r.status === 'failed' || r.status === 'timedOut')
        .forEach((test, index) => {
          console.log(`${index + 1}. ${test.title}`);
          console.log(`   Project: ${test.project} | Duration: ${test.duration}ms`);
          if (test.error) {
            console.log(`   Error: ${test.error.split('\n')[0]}`);
          }
          console.log('');
        });
    }

    // Write detailed results to file
    const fs = require('fs');
    const detailedReport = {
      summary: {
        totalTests: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        skipped: this.skippedTests,
        successRate: ((this.passedTests / this.totalTests) * 100).toFixed(1),
        duration: totalDuration,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      },
      results: this.results
    };

    try {
      fs.writeFileSync('test-results/continuous-detailed-report.json', JSON.stringify(detailedReport, null, 2));
      console.log('📄 Detailed report saved to: test-results/continuous-detailed-report.json');
    } catch (error) {
      console.log('⚠️  Could not save detailed report:', error.message);
    }

    console.log('🎯 Use "npm run test:report:continuous" to view the HTML report');
    console.log('=' .repeat(80));
  }

  onError(error) {
    console.log('🚨 Test Runner Error:', error.message);
  }
}

module.exports = ContinuousTestReporter;