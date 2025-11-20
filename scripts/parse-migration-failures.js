#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function summarize(failures) {
  const stats = { total: failures.length, codes: {}, files: {} }
  for (const f of failures) {
    const code = f.code || 'null'
    stats.codes[code] = (stats.codes[code] || 0) + 1
    stats.files[f.file] = (stats.files[f.file] || 0) + 1
  }
  return stats
}

function findEarliestNon25P02(failures) {
  return failures.find(f => f.code && f.code !== '25P02' && f.code !== null)
}

function main() {
  const reportPath = path.join(__dirname, 'migration-failures.json')
  if (!fs.existsSync(reportPath)) {
    console.error('No migration-failures.json found. Run a dry-run then re-run this script.')
    process.exit(1)
  }
  const content = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  const failures = content.failures || []
  const rootCause = content.rootCause || null
  const summary = summarize(failures)
  console.log('Migration failures summary:')
  console.log(`  Total failures: ${summary.total}`)
  console.log('  Error codes (count):')
  Object.entries(summary.codes).sort((a,b) => b[1] - a[1]).forEach(([code, count]) => console.log(`    ${code}: ${count}`))
  console.log('  Files impacted (top 10):')
  Object.entries(summary.files).sort((a,b) => b[1] - a[1]).slice(0,10).forEach(([file, count]) => console.log(`    ${file}: ${count}`))
  const earliest = findEarliestNon25P02(failures)
  if (earliest) {
      if (rootCause) {
        console.log('\nRecorded root cause:')
        console.log(`  File: ${rootCause.file}`)
        console.log(`  StatementIndex: ${rootCause.statementIndex}`)
        console.log(`  Error: ${rootCause.error}`)
        console.log(`  SQLSTATE: ${rootCause.code}`)
      }
    console.log('\nEarliest non-25P02 failure:')
    console.log(`  File: ${earliest.file}`)
    console.log(`  StatementIndex: ${earliest.statementIndex}`)
    console.log(`  Error: ${earliest.error}`)
    console.log(`  SQLSTATE: ${earliest.code}`)
    console.log('\nSample SQL (trimmed):')
    console.log('  ' + earliest.statement.replace(/\n/g, '\n  ').slice(0, 1200) + (earliest.statement.length > 1200 ? '\n  ...' : ''))
  } else {
    console.log('\nNo non-25P02 failures were found (only aborted-transaction or skipped entries).')
  }
}

main()
