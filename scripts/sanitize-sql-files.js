#!/usr/bin/env node
// Sanitize SQL files in database-schema for Neon/pg execution.
// - Remove psql meta-commands (lines starting with backslash) except '\i' includes when expanding master file
// - Normalize `DO $` to `DO $$` when it's the single-dollar variant
// - Normalize `END $;` to `END $$;` where applicable
// - Optionally expand includes in 00_MASTER_SCHEMA.sql
// - Preview mode writes sanitized files into database-schema-sanitized/ (default)
// - Use --apply to overwrite original files (backups kept as .bak)

const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const schemaDir = path.join(__dirname, '..', 'database-schema')
const outDir = path.join(__dirname, '..', 'database-schema-sanitized')
const apply = argv.apply || argv.a || false

function sanitizeSql(rawSql, options = {}) {
  const { removeIncludes = false } = options
  const lines = rawSql.split(/\r?\n/)
  const kept = []
  for (let ln of lines) {
    const t = ln.trim()
    if (t.startsWith('\\')) {
      if (!removeIncludes && /^\\i\s+/i.test(t)) {
        // keep include directive for now
        kept.push(ln)
      } else {
        // replace psql meta command with a harmless comment so we keep file length and positions
        kept.push('-- [psql command removed]')
      }
    } else {
      kept.push(ln)
    }
  }
  let out = kept.join('\n')
  // Normalize DO $ BEGIN to DO $$ BEGIN
  out = out.replace(/DO\s+\$\s+BEGIN/gi, 'DO $$ BEGIN')
  // Normalize END $; to END $$;
  out = out.replace(/END\s+\$\s*;/gi, 'END $$;')
  return out
}

function expandIncludes(rootPath, content, visited = new Set()) {
  const lines = content.split(/\r?\n/)
  let result = ''
  for (const line of lines) {
    const m = line.trim().match(/^\\i\s+(.+)$/i)
    if (m) {
      let inc = m[1].trim().replace(/['\"]/g, '')
      // If include path starts with "database-schema/", strip it so we resolve relative to the schemaDir
      if (inc.startsWith('database-schema/') || inc.startsWith('database-schema\\')) {
        inc = inc.replace(/^database-schema[\\/]/, '')
      }
      // Try several candidate paths for resolution: relative to current rootPath, schemaDir, and repository
      const candidates = [
        path.resolve(rootPath, inc),
        path.resolve(schemaDir, inc),
        path.resolve(inc),
      ]
      let incPath = null
      for (const cand of candidates) {
        if (fs.existsSync(cand)) { incPath = cand; break }
      }
      if (visited.has(incPath)) {
        result += `-- [Skipping circular include ${inc}]\n`
        continue
      }
      if (!fs.existsSync(incPath)) {
        result += `-- [Included file not found: ${inc}]\n`
        continue
      }
      visited.add(incPath)
      const raw = fs.readFileSync(incPath, 'utf8')
      // sanitize child and expand its includes
      const sanitizedChild = sanitizeSql(raw, { removeIncludes: false })
      const expandedChild = expandIncludes(path.dirname(incPath), sanitizedChild, visited)
      // remove any psql meta-commands left in expanded child
      const cleanedChild = expandedChild.split(/\r?\n/).filter(ln => !ln.trim().startsWith('\\')).join('\n')
      result += `\n-- Begin included: ${path.relative(schemaDir, incPath)}\n` + cleanedChild + `\n-- End included: ${path.relative(schemaDir, incPath)}\n`
    } else {
      result += line + '\n'
    }
  }
  return result
}

async function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)
  const files = fs.readdirSync(schemaDir).filter(f => /^\d{2}_.*\.sql$/i.test(f)).sort()
  console.log(`Found ${files.length} files in ${schemaDir}`)

  for (const file of files) {
    const fullPath = path.join(schemaDir, file)
    console.log(`Processing: ${file}`)
    const raw = fs.readFileSync(fullPath, 'utf8')
    let sanitized = raw
    // if master, expand includes first
    if (file === '00_MASTER_SCHEMA.sql') {
      console.log('  Expanding includes in master file...')
      const expanded = expandIncludes(schemaDir, sanitized)
      // remove any backslash commands from final expanded master
      sanitized = expanded.split(/\r?\n/).filter(ln => !ln.trim().startsWith('\\')).join('\n')
    }
    sanitized = sanitizeSql(sanitized, { removeIncludes: true })

    // Add heuristic detection for unbalanced dollar quotes
    // Heuristic: ignore $ occurrences inside single-quoted string literals before counting
    function stripSingleQuotedStrings(s) {
      let out = ''
      let inSingle = false
      for (let i = 0; i < s.length; i++) {
        const ch = s[i]
        if (ch === "'") {
          inSingle = !inSingle
          out += ' '
          continue
        }
        out += inSingle ? ' ' : ch
      }
      return out
    }
    const sanitizedForCount = stripSingleQuotedStrings(sanitized)
    const pattern = /\$([A-Za-z0-9_]*)\$/g
    const map = new Map();
    let mm;
    while ((mm = pattern.exec(sanitizedForCount)) !== null) {
      const tag = mm[1] || '$$'
      map.set(tag, (map.get(tag) || 0) + 1)
    }
    const unbalanced = Array.from(map.entries()).filter(([k, v]) => v % 2 !== 0)
    if (unbalanced.length > 0) {
      console.warn(`  ⚠️ Unbalanced dollar-quote tags for ${file}: ${JSON.stringify(unbalanced)}`)
    }

    // write to out dir
    const outPath = path.join(outDir, file)
    fs.writeFileSync(outPath, sanitized, 'utf8')
    console.log(`  ✨ Wrote sanitized preview to ${path.relative(process.cwd(), outPath)}`)

    if (apply) {
      // create backup
      const backup = fullPath + '.bak'
      if (!fs.existsSync(backup)) fs.copyFileSync(fullPath, backup)
      fs.writeFileSync(fullPath, sanitized, 'utf8')
      console.log(`  ✅ Overwrote ${file} with sanitized content (backup saved at ${path.relative(process.cwd(), backup)})`)
    }
  }
  console.log('\nDone. Review files in database-schema-sanitized/ and re-run the migration/test scripts. Use --apply to make changes permanent.')
}

main().catch(err => { console.error(err); process.exit(1) })
