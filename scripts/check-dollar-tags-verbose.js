#!/usr/bin/env node
// Verbose check for unbalanced dollar-quoted tags in SQL files under src/database-schema

const fs = require('fs')
const path = require('path')

const schemaDir = path.join(__dirname, '..', 'database-schema')
const files = fs.readdirSync(schemaDir).filter(fn => /^\d{2}_.*\.sql$/.test(fn)).sort()

function findTags(sql) {
  const tags = []
  let i = 0
  let line = 1
  let inSingle = false
  let inDouble = false
  while (i < sql.length) {
    const ch = sql[i]
    if (ch === '\n') { line++; i++; continue }
    if (ch === "'" && !inDouble) { inSingle = !inSingle; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
      if (m) {
        const tag = `$${m[1]}$`
        tags.push({ tag, index: i, line })
        i += m[0].length
        continue
      }
    }
    i++
  }
  return tags
}

for (const f of files) {
  const p = path.join(schemaDir, f)
  const sql = fs.readFileSync(p, 'utf8')
  const tags = findTags(sql)
  const counts = {}
  for (const t of tags) counts[t.tag] = (counts[t.tag] || 0) + 1
  const unbalanced = Object.entries(counts).filter(([tag, count]) => (count % 2) !== 0)
  if (unbalanced.length > 0) {
    console.log(`\n⚠️  File: ${f}`)
    unbalanced.forEach(([tag, count]) => console.log(`   • ${tag} count=${count}`))
    // show lines around occurrences of the unbalanced tags
    for (const [tag] of unbalanced) {
      const occ = tags.filter(t => t.tag === tag)
      if (occ.length > 0) {
        const first = occ[0]
        const start = Math.max(0, first.index - 200)
        const end = Math.min(sql.length, first.index + 200)
        console.log('--- snippet around first occurrence ---')
        console.log(sql.slice(start, end))
      }
    }
  }
}
console.log('\nDone.')
process.exit(0)
