const fs = require('fs')
const path = require('path')
const file = process.argv[2] || 'database-schema/isolate/02_core_tables.sql'
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

const badIndexes = []
for (let i=0;i<chunks.length;i++) {
  const s = chunks[i]
  if (s.includes('AS $$') && s.indexOf('BEGIN') === -1) {
    badIndexes.push(i)
  }
}

console.log('Found bad indexes:', badIndexes)
const printRange = (idx, radius = 2) => {
  const from = Math.max(0, idx-radius)
  const to = Math.min(chunks.length-1, idx+radius)
  const ctx = []
  ctx.push('--- Context for ' + idx + ' ---')
  for (let j=from;j<=to;j++){
    ctx.push('IDX ' + j + ' len ' + chunks[j].length)
    ctx.push(chunks[j].slice(0,500))
    ctx.push('-----')
  }
  return ctx
}

const showFirstFailure = chunks.findIndex(s => s.trim().toUpperCase().startsWith('CREATE'))
const report = {
  total: chunks.length,
  badIndexes,
  contexts: badIndexes.map(idx => ({ idx, ctx: printRange(idx, 1) })),
  firstCreateIndex: showFirstFailure,
  firstCreateContext: printRange(showFirstFailure, 3)
}
fs.mkdirSync('tmp', { recursive: true })
fs.writeFileSync('tmp/split-debug-output.json', JSON.stringify(report, null, 2))
console.log('Wrote tmp/split-debug-output.json')

console.log('Index of first CREATE... statement', showFirstFailure)
console.log('First create context:\n', printRange(showFirstFailure, 3).join('\n'))
// write chunk to file for inspection
fs.writeFileSync('tmp/chunk0.sql', chunks[showFirstFailure])
const buf = Buffer.from(chunks[showFirstFailure], 'utf8')
console.log('Chunk0 first 80 bytes hex:', buf.slice(0,80).toString('hex'))
