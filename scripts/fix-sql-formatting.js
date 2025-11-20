/*
fix-sql-formatting.js

A small script to fix SQL files that have concatenated DDL statements without proper separators.
It replaces problematic constructs (like `END $$;CREATE` or `$$ LANGUAGE plpgsql;DROP`) with newlines,
while preserving dollar-quoted blocks inside functions and DO blocks.

Usage:
  node scripts/fix-sql-formatting.js [dir=src/database-schema] [--dry-run]
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

function fixOutsideDollarBlocks(content) {
  // Extract dollar blocks and replace with tokens
  const { replaced, blocks } = extractDollarBlocks(content)
  let c = replaced

  // Patterns to insert newline when there's no blank line (or newline) between tokens
  // Add blank lines after `$$ LANGUAGE plpgsql;` if directly followed by other DDL
  c = c.replace(/\$\$\s+LANGUAGE\s+plpgsql;\s*(?=(DROP|CREATE|ALTER|INSERT|UPDATE|DELETE|DO|--|\/\*))/g, '$$ LANGUAGE plpgsql;\n\n')
  // Add blank lines after END $$; when directly followed by other DDL
  c = c.replace(/END\s+\$\$;\s*(?=(DROP|CREATE|ALTER|INSERT|UPDATE|DELETE|DO|--|\/\*))/g, 'END $$;\n\n')
  // Add blank lines after END IF; when directly followed
  c = c.replace(/END\s+IF;\s*(?=(DROP|CREATE|ALTER|INSERT|UPDATE|DELETE|DO|--|\/\*))/g, 'END IF;\n\n')

  // Add blank line after any `;CREATE` `;DROP` etc - this may be risky inside dollar blocks, but we replaced them
  c = c.replace(/;\s*(?=(CREATE|DROP|ALTER|DO|INSERT|UPDATE|DELETE|--|\/\*))/g, ';\n\n')

  // Insert missing semicolons after a closing parenthesis of a CREATE TABLE/TYPE/SEQUENCE/DO block
  // Example: ")\n-- User indexes" -> ");\n\n-- User indexes"
  c = c.replace(/\)\s*(?=(?:\r?\n)\s*(?:--|CREATE|DROP|ALTER|INSERT|UPDATE|DELETE|DO|$))/g, ');\n\n')

  // Restore dollar blocks
  c = restoreDollarBlocks(c, blocks)
  return c
}

console.log(`🔧 Fix formatting for SQL files in: ${dirArg}`)
let pattern = path.join(dirArg, '**/*.sql')
// On Windows path.join returns backslashes; glob expects forward slashes (unix style)
  pattern = pattern.replace(/\\\\/g, '/')
  // Normalize any single backslashes too (handle Windows output where backslashes may appear singly)
  pattern = pattern.replace(/\\/g, '/')
console.log('   • Using glob pattern:', pattern)
const files = glob.sync(pattern, { nodir: true })
if (files.length === 0) {
  console.log('⚠️  No SQL files found in', dirArg)
  process.exit(0)
}
let changedFiles = 0
for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8')
    const fixed = fixOutsideDollarBlocks(content)
    if (fixed !== content) {
      if (dryRun) {
        console.log(`✅ (dry-run) Would fix: ${f}`)
      } else {
        fs.writeFileSync(f, fixed, 'utf8')
        console.log(`✅ Fixed: ${f}`)
      }
      changedFiles++
    } else {
      console.log(`   No change needed: ${f}`)
    }
  } catch (err) {
    console.error(`❌ Error processing ${f}:`, err && err.message)
  }
}
console.log(`\nDone. Files changed: ${changedFiles}.`)
if (dryRun) console.log('Dry-run mode; no changes were written.')
else console.log('🎉 Formatting fixes applied. Run the checks and migrations next.')
