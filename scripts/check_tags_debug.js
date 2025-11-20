const fs = require('fs')
const path = process.argv[2] || 'database-schema/00_MASTER_SCHEMA.sql'
const s = fs.readFileSync(path, 'utf8')
let line = 1
let stack = []
let inSingle = false
let inDouble = false
for (let i = 0; i < s.length; i++) {
  const ch = s[i]
  if (ch === '\n') line++
  if (ch === "'" && !inDouble) { inSingle = !inSingle; continue }
  if (ch === '"' && !inSingle) { inDouble = !inDouble; continue }
  if (!inSingle && !inDouble && ch === '$') {
    const m = s.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
    if (m) {
      const tag = `$${m[1]}$`
      const entry = { tag, line, idx: i }
      if (stack.length && stack[stack.length - 1].tag === tag) {
        stack.pop()
      } else {
        stack.push(entry)
      }
      i += m[0].length - 1
    }
  }
}
if (stack.length === 0) {
  console.log('No unmatched tags')
} else {
  console.log('Unmatched tags count:', stack.length)
  stack.forEach(e => console.log('Line', e.line, 'tag', e.tag))
}
