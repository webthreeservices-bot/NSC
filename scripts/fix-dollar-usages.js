/*
fix-dollar-usages.js

This script normalizes accidental single-dollar usage for dollar-quoted blocks.
It will only change cases where a single '$' is used where '$$' should have been used
in function/triggers (e.g. `RETURNS TRIGGER AS $` -> `RETURNS TRIGGER AS $$`) and similar hazards
such as `END $;` -> `END $$;` and `END; $ LANGUAGE` -> `END; $$ LANGUAGE`.

We avoid touching valid $tag$ occurrences by checking named tags and by tokenization.

Usage:
  node scripts/fix-dollar-usages.js [dir=src/database-schema] [--dry-run]
*/

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const dirArg = process.argv[2] || 'src/database-schema'
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n')

function extractDollarBlocks(sql) {
  const blocks = []
  let out = ''
  let i = 0
  let inSingle = false
  let inDouble = false
  while (i < sql.length) {
    const ch = sql[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; out += ch; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; out += ch; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const mm = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
      if (mm) {
        const tag = mm[0]
        const start = i
        const openLength = tag.length
        let j = i + openLength
        let found = -1
        let inSingleLocal = false
        let inDoubleLocal = false
        while (j < sql.length) {
          const ch2 = sql[j]
          if (ch2 === "'" && !inDoubleLocal) { inSingleLocal = !inSingleLocal; j++; continue }
          if (ch2 === '"' && !inSingleLocal) { inDoubleLocal = !inDoubleLocal; j++; continue }
          if (!inSingleLocal && !inDoubleLocal && sql.slice(j, j + openLength) === tag) {
            found = j + openLength
            break
          }
          j++
        }
        if (found !== -1) {
          const block = sql.slice(start, found)
          const token = `__DOLLAR_BLOCK_${blocks.length}__`
          blocks.push(block)
          out += token
          i = found
          continue
        }
      }
    }
    out += ch
    i++
  }
  return { replaced: out, blocks }
}

function restoreDollarBlocks(t, blocks) {
  let out = t
  for (let idx = 0; idx < blocks.length; idx++) {
    const token = `__DOLLAR_BLOCK_${idx}__`
    out = out.split(token).join(blocks[idx])
  }
  return out
}

function fixSingleDollarUsages(content) {
  const { replaced, blocks } = extractDollarBlocks(content)
  let c = replaced

  // Replace 'RETURNS TRIGGER AS $' or 'RETURNS TEXT AS $' variations -> add extra $: 'AS $$'
  c = c.replace(/(RETURNS\s+\w+\s+AS)\s+\$(?=\s|BEGIN|DECLARE|;|\n)/gi, '$1 $$')
  c = c.replace(/(AS)\s+\$(?=\s|BEGIN|DECLARE|;|\n)/gi, '$1 $$')

  // Replace 'END $;' with 'END $$;' (common broken closure)
  c = c.replace(/END\s+\$;/g, 'END $$;')

  // Replace 'END; $ LANGUAGE' -> 'END; $$ LANGUAGE'
  c = c.replace(/END;\s*\$\s*(LANGUAGE)/gi, 'END; $$ $1')

  // Replace 'AS $ LANGUAGE' (rare) -> 'AS $$ LANGUAGE'
  c = c.replace(/AS\s+\$\s*(LANGUAGE)/gi, 'AS $$ $1')

  // Replace single `$ LANGUAGE ...` with `$$ LANGUAGE` if found and not part of a tag (we are outside tags now)
  c = c.replace(/\$\s+LANGUAGE\s+plpgsql/gi, '$$ LANGUAGE plpgsql')

  // Restore blocks
  c = restoreDollarBlocks(c, blocks)
  return c
}

console.log(`🔧 Fix single-dollar usages in: ${dirArg}`)
let pattern = path.join(dirArg, '**/*.sql')
pattern = pattern.replace(/\\/g, '/')
console.log('   • Using glob pattern:', pattern)
const files = glob.sync(pattern, { nodir: true })
if (files.length === 0) {
  console.log('⚠️  No SQL files found in', dirArg)
  process.exit(0)
}
let changes = 0
for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8')
    const fixed = fixSingleDollarUsages(content)
    if (fixed !== content) {
      if (dryRun) {
        console.log(`✅ (dry-run) Would normalize single-dollar uses in: ${f}`)
      } else {
        fs.writeFileSync(f, fixed, 'utf8')
        console.log(`✅ Normalized: ${f}`)
      }
      changes++
    } else {
      console.log(`   No change needed: ${f}`)
    }
  } catch (err) {
    console.error(`❌ Error processing ${f}:`, err && err.message)
  }
}
console.log(`\nDone. Files modified: ${changes}.`)
if (dryRun) console.log('Dry-run mode; no changes were written.')
else console.log('🎉 Single-dollar normalizations applied. Run checks and migrations.')
