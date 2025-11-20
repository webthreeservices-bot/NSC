const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
})

const schemaDir = path.join(__dirname, '..', 'database-schema')
const fileArg = process.argv[2]
const execFlag = process.argv.includes('--exec')
if (!fileArg) {
  console.error('Usage: node test-single-sql.js <database-schema/NN_file.sql> [--exec]')
  process.exit(1)
}

function splitSqlStatements(sql) {
  const dollarBlocks = []
  // replace dollar-quoted blocks with placeholders using a scanner to avoid issues inside strings
  let replaced = ''
  let i = 0
  let inSingle = false
  let inDouble = false
  while (i < sql.length) {
    const ch = sql[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; replaced += ch; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; replaced += ch; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const tagMatch = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
      if (tagMatch) {
        const tag = tagMatch[1]
        const openTag = `$${tag}$`
        const closeTag = openTag
        const start = i + openTag.length
        // Find a closing tag that is NOT inside single/double quotes
        let endIndex = -1
        let j = start
        let inSingleLocal = false
        let inDoubleLocal = false
        while (j < sql.length) {
          const ch2 = sql[j]
          if (ch2 === "'" && !inDoubleLocal) { inSingleLocal = !inSingleLocal; j++; continue }
          if (ch2 === '"' && !inSingleLocal) { inDoubleLocal = !inDoubleLocal; j++; continue }
          if (!inSingleLocal && !inDoubleLocal && sql.slice(j, j + closeTag.length) === closeTag) {
            endIndex = j
            break
          }
          j++
        }
        if (endIndex !== -1) {
          const token = `__DOLLAR_${dollarBlocks.length}__`
          const block = sql.slice(i, endIndex + closeTag.length)
          dollarBlocks.push(block)
          replaced += token
          i = endIndex + closeTag.length
          continue
        }
      }
    }
    replaced += ch
    i++
  }

  const statements = []
  let current = ''
  inSingle = false
  inDouble = false

  for (let i = 0; i < replaced.length; i++) {
    const ch = replaced[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue }
    // semicolon when not inside any string terminates a statement
    if (ch === ';' && !inSingle && !inDouble) {
      current = current.trim()
      if (current.length > 0) statements.push(current + ';')
      current = ''
      continue
    }
    current += ch
  }
  const last = current.trim()
  if (last.length > 0) statements.push(last)

  // restore dollar blocks inside statements (replace tokens back)
  const restored = statements.map(s => {
    let out = s
    dollarBlocks.forEach((blk, idx) => {
      const token = `__DOLLAR_${idx}__`
      out = out.split(token).join(blk)
    })
    return out
  })

  return restored
}

function sanitizeSql(rawSql) {
  const lines = rawSql.split(/\r?\n/)
  const kept = []
  for (let ln of lines) {
    const t = ln.trim()
    if (t.startsWith('\\')) {
      if (/^\\i\s+/.test(t)) {
        kept.push(ln)
      } else {
        kept.push('-- [psql command removed by sanitizer]')
      }
    } else {
      kept.push(ln)
    }
  }
  let out = kept.join('\n')
  out = out.replace(/DO\s+\$\s+BEGIN/gi, 'DO $$ BEGIN')
  out = out.replace(/END\s+\$\s*;/gi, 'END $$;')
  // Heuristic: check for potentially unbalanced dollar-quoted tags and warn
  const seen = new Map()
  let i2 = 0
  let inSingle2 = false
  let inDouble2 = false
  while (i2 < out.length) {
    const ch = out[i2]
    if (ch === "'" && !inDouble2) { inSingle2 = !inSingle2; i2++; continue }
    if (ch === '"' && !inSingle2) { inDouble2 = !inDouble2; i2++; continue }
    if (!inSingle2 && !inDouble2 && ch === '$') {
      const tagMatch = out.slice(i2).match(/^\$([A-Za-z0-9_]*)\$/)
      if (tagMatch) {
        const tag = tagMatch[1]
        seen.set(tag, (seen.get(tag) || 0) + 1)
        i2 += tagMatch[0].length
        continue
      }
    }
    i2++
  }
  const unbalanced = Array.from(seen.entries()).filter(([k, v]) => (v % 2) !== 0)
  if (unbalanced.length > 0) {
    console.warn('Warning: Potential unbalanced dollar-quoted tags detected:', unbalanced)
  }
  return out
}

function expandIncludes(rootPath, content, visitedFiles = new Set()) {
  const lines = content.split(/\r?\n/)
  let result = ''
  for (const line of lines) {
    const m = line.trim().match(/^\\i\s+(.+)$/)
    if (m) {
      const incPath = m[1].trim().replace(/["'\\]/g, '')
      const resolved = path.isAbsolute(incPath) ? incPath : path.join(rootPath, incPath)
      const normalized = path.resolve(resolved)
      if (visitedFiles.has(normalized)) { console.log('Skipping circular include', incPath); continue }
      if (!fs.existsSync(normalized)) { console.log('Included file not found:', incPath); continue }
      visitedFiles.add(normalized)
      const childSql = fs.readFileSync(normalized, 'utf8')
      result += `\n-- Begin included: ${incPath}\n`
      // Recursively expand includes in child and strip psql meta-commands
      result += expandIncludes(path.dirname(normalized), childSql, visitedFiles).split(/\r?\n/).filter(ln => !ln.trim().startsWith('\\')).join('\n')
      result += `\n-- End included: ${incPath}\n`
    } else {
      result += line + '\n'
    }
  }
  return result
}

async function run() {
  const targetPath = path.isAbsolute(fileArg) ? fileArg : path.join(__dirname, '..', fileArg)
  if (!fs.existsSync(targetPath)) {
    console.error('File not found:', targetPath)
    process.exit(2)
  }
  const content = fs.readFileSync(targetPath, 'utf8')
  const combined = content.includes('\\i') ? expandIncludes(schemaDir, content) : content
  const sanitized = sanitizeSql(combined)
  console.log('\n--- Sanitized SQL Preview (first 500 chars) ---\n', sanitized.slice(0, 500))
  const hasDollarBlocks = /\b(AS\s+\$[A-Za-z0-9_]*\$|DO\s+\$[A-Za-z0-9_]*\$)/i.test(sanitized)
  const stmts = hasDollarBlocks ? [sanitized] : splitSqlStatements(sanitized)
  console.log(`Parsed ${stmts.length} statements from ${fileArg}`)
  stmts.forEach((s, i) => {
    console.log(`\n--- Statement ${i + 1} (len ${s.length}) ---\n${s.slice(0, 800)}${s.length > 800 ? '...' : ''}`)
  })

  if (execFlag) {
    const client = await pool.connect()
    try {
      for (let i = 0; i < stmts.length; i++) {
        try {
          await client.query('BEGIN')
          await client.query(stmts[i])
          await client.query('COMMIT')
          console.log(`Statement ${i + 1} executed successfully`)
        } catch (err) {
          console.error(`Statement ${i + 1} failed:`, err.message)
          try { await client.query('ROLLBACK') } catch (e) {}
        }
      }
    } finally {
      client.release()
      await pool.end()
    }
  } else {
    await pool.end()
  }
}

run().catch(err => { console.error(err); process.exit(1) })
