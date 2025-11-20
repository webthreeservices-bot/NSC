/*
remove-table-exception-blocks.js

Removes stray EXCEPTION blocks that are erroneously appended after CREATE TABLE statements
like:
    );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $;

This script targets occurrences where EXCEPTION occurs immediately after a `);` (closing a table definition)
and removes the EXCEPTION..END $; block.

Usage:
  node scripts/remove-table-exception-blocks.js [dir=src/database-schema/neon] [--dry-run]
*/
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const dir = process.argv[2] || 'src/database-schema/neon'
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n')
let pattern = path.join(dir, '**/*.sql')
pattern = pattern.replace(/\\/g, '/')
console.log('Scanning', pattern)
const files = glob.sync(pattern, { nodir: true })
const re = /\)\s*;\s*\r?\n\s*EXCEPTION\s*\r?\n\s*WHEN\s+duplicate_object\s+THEN\s+null;\s*\r?\n\s*END\s+\$\s*;\s*/ig
let changed = 0
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8')
  if (re.test(c)) {
    console.log('Would remove EXCEPTION block in', f)
    const newc = c.replace(re, ')\n\n')
    if (!dryRun) {
      fs.writeFileSync(f, newc, 'utf8')
      console.log('Patched', f)
    }
    changed++
  }
}
console.log('\nDone. Updated files:', changed)
if (dryRun) console.log('Dry-run; no files were written')
