#!/usr/bin/env node
// Scans SQL files under src/database-schema for unbalanced dollar-quoted tags
// and reports files with potential issues.

const fs = require('fs')
const path = require('path')

const schemaDir = path.join(__dirname, '..', 'database-schema')
const files = fs.readdirSync(schemaDir).filter(fn => /^\d{2}_.*\.sql$/.test(fn)).sort()

function findDollarTags(sql) {
  const tags = new Map()
  let i = 0
  let inSingle = false
  let inDouble = false
  while (i < sql.length) {
    const ch = sql[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
      if (m) {
        const tag = m[1]
        const key = `$${tag}$`
        tags.set(key, (tags.get(key) || 0) + 1)
        i += m[0].length
        continue
      }
    }
    i++
  }
  return tags
}

let totalProblems = 0
for (const f of files) {
  const p = path.join(schemaDir, f)
  const sql = fs.readFileSync(p, 'utf8')
  const tags = findDollarTags(sql)
  const unbalanced = []
  for (const [tag, count] of tags) {
    if (count % 2 !== 0) unbalanced.push({ tag, count })
  }
  if (unbalanced.length > 0) {
    totalProblems++
    console.log(`⚠️  Unbalanced dollar-tags in ${f}: ${JSON.stringify(unbalanced)}`)
    // show a few lines of context around first occurrence
    const firstTag = unbalanced[0].tag
    const idx = sql.indexOf(firstTag)
    if (idx !== -1) {
      const start = Math.max(0, idx - 200)
      const end = Math.min(sql.length, idx + 200)
      console.log(sql.slice(start, end).replace(/\n/g, '\n'))
    }
    console.log('---')
  }
}
if (totalProblems === 0) {
  console.log('✅ No unbalanced dollar quote tags detected in database-schema SQL files.')
  process.exit(0)
} else {
  console.log(`❌ Detected ${totalProblems} file(s) with potential unbalanced dollar tags.`)
  process.exit(2)
}
