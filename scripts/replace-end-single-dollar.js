/*
replace-end-single-dollar.js

Replace any `END $;` with `END $$;` in all SQL files in a directory.
This corrects accidental single-dollar closures to proper double-dollar usage when we want $$. Use with dry-run first.
*/

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const dir = process.argv[2] || 'src/database-schema/neon'
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n')
let pattern = path.join(dir, '**/*.sql')
pattern = pattern.replace(/\\/g, '/')
console.log('Using pattern:', pattern)
const files = glob.sync(pattern, { nodir: true })
let changed = 0
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8')
  if (content.includes('END $;')) {
    const newc = content.split('END $;').join('END $$;')
    console.log((dryRun ? '(dry-run) Would replace' : 'Replacing'), f)
    if (!dryRun) fs.writeFileSync(f, newc, 'utf8')
    changed++
  }
}
console.log('\nDone. Updated files:', changed)
if (dryRun) console.log('Dry-run; no files were written')
