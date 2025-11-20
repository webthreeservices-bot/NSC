const fs = require('fs')
const path = require('path')

const file = process.argv[2] || 'database-schema/00_MASTER_SCHEMA.sql'
const sql = fs.readFileSync(file, 'utf8')

function splitSqlStatements(sql) {
  const dollarBlocks = []
  let out = ''
  let i = 0
  let inSingle = false
  let inDouble = false
  while (i < sql.length) {
    const ch = sql[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; out += ch; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; out += ch; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const tagMatch = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
      if (tagMatch) {
        const tag = tagMatch[1]
        const openTag = `$${tag}$`
        const closeTag = openTag
        const start = i + openTag.length
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
          out += token
          i = endIndex + closeTag.length
          continue
        }
      }
    }
    out += ch
    i++
  }

  const statements = []
  let current = ''
  inSingle = false
  inDouble = false
  for (let j = 0; j < out.length; j++) {
    const ch = out[j]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue }
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

  // restore
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

const chunks = splitSqlStatements(sql)
console.log('Total statements:', chunks.length)
// locate the range where check_withdrawal_eligibility is
for (let i=0;i<chunks.length;i++) {
  if (/check_withdrawal_eligibility/i.test(chunks[i])) {
    console.log('Found statement index', i)
    console.log('Statement preview:\n', chunks[i].slice(0, 2000))
    break
  }
}

// Also output whether the stored statements contain any len> max
for (let i=0;i<Math.min(chunks.length,200); i++) {
  const s = chunks[i]
  if (s.includes('RETURNS') && s.includes('AS $$') && s.indexOf('BEGIN') === -1) {
    console.log('Statement with AS $$ but no BEGIN at index', i)
    console.log(s.slice(0,240))
  }
}

console.log('Done')
