/*
split-master-to-neon.js

Splits `database-schema/00_MASTER_SCHEMA.sql` into separate files under
`database-schema/neon/` by extracting the "-- Begin included: filename" blocks.

Usage:
  node scripts/split-master-to-neon.js [--dry-run]
*/

const fs = require('fs')
const path = require('path')

const schemaDir = path.resolve(__dirname, '..', 'database-schema')
const masterFile = path.join(schemaDir, '00_MASTER_SCHEMA.sql')
const outDir = path.join(schemaDir, 'neon')
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n')

if (!fs.existsSync(masterFile)) {
  console.error('Master schema file not found:', masterFile)
  process.exit(1)
}

if (!fs.existsSync(outDir) && !dryRun) fs.mkdirSync(outDir, { recursive: true })

const master = fs.readFileSync(masterFile, 'utf8')
// Standard marker: "-- Begin included: filename"
const beginRe = /^\s*--\s*Begin included:\s*(.+)\s*$/mi
const endRe = /^\s*--\s*End included:\s*(.+)\s*$/mi

// Parse file into segments
const lines = master.split(/\r?\n/)
let outputFiles = []
let currentFile = null
let currentContent = []
let inBlock = false
let lineno = 0
for (const line of lines) {
  lineno++
  const begin = line.match(/^\s*--\s*Begin included:\s*(.+)\s*$/i)
  const end = line.match(/^\s*--\s*End included:\s*(.+)\s*$/i)
  if (begin) {
    inBlock = true
    currentFile = begin[1].trim()
    currentContent = []
    continue
  }
  if (end) {
    inBlock = false
    const outPath = path.join(outDir, currentFile)
    outputFiles.push({ file: currentFile, path: outPath, content: currentContent.join('\n') })
    currentFile = null
    currentContent = []
    continue
  }

  if (inBlock) {
    currentContent.push(line)
  }
}

// Also check for content outside included blocks — write to 00_MASTER_remainder.sql
let remaLines = []
let insideAny = false
let activeFileNom = null
for (const line of lines) {
  const begin = line.match(/^\s*--\s*Begin included:\s*(.+)\s*$/i)
  const end = line.match(/^\s*--\s*End included:\s*(.+)\s*$/i)
  if (begin) { insideAny = true; activeFileNom = begin[1]; continue }
  if (end) { insideAny = false; activeFileNom = null; continue }
  if (!insideAny) remaLines.push(line)
}
// Write remainder file
const remainderOut = path.join(outDir, '00_MASTER_REMAINDER.sql')
outputFiles.push({ file: '00_MASTER_REMAINDER.sql', path: remainderOut, content: remaLines.join('\n') })

if (outputFiles.length === 0) {
  console.warn('No included blocks found in master file; nothing to extract')
  process.exit(0)
}

for (const ofi of outputFiles) {
  if (dryRun) {
    console.log('(dry-run) Would write', path.relative(schemaDir, ofi.path), 'size', Buffer.byteLength(ofi.content, 'utf8'))
  } else {
    fs.writeFileSync(ofi.path, ofi.content, 'utf8')
    console.log('Wrote', path.relative(schemaDir, ofi.path))
  }
}

console.log('\nDone: created', outputFiles.length, 'files in', path.relative(process.cwd(), outDir))
console.log('Next steps: run `node scripts/fix-sql-formatting.js database-schema/neon` and `node scripts/fix-dollar-usages.js database-schema/neon` then `node scripts/check-dollar-tags-verbose.js database-schema/neon/00_MASTER_REMAINDER.sql`')
