const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2))
const schemaDir = path.join(__dirname, '..', 'database-schema')
const files = argv._.length ? argv._ : ['05_functions.sql','06_triggers.sql']

function normalizeFile(filePath) {
  let s = fs.readFileSync(filePath, 'utf8')
  const orig = s
  const regex = /CREATE\s+OR\s+REPLACE\s+FUNCTION[\s\S]*?\$[A-Za-z0-9_]*\$[\s\S]*?\$[A-Za-z0-9_]*\$\s*LANGUAGE\s+plpgsql\s*;/ig
  // For every match, replace the $tag$ with $$
  s = s.replace(regex, function(match) {
    // Replace opening $tag$
    let openMatch = match.match(/AS\s*\$[A-Za-z0-9_]*\$/i)
    if (openMatch) {
      match = match.replace(openMatch[0], 'AS $$')
    } else {
      // nothing
    }
    // Replace closing $tag$ before LANGUAGE
    match = match.replace(/\$[A-Za-z0-9_]*\$\s*LANGUAGE\s+plpgsql\s*;/i, '$$ LANGUAGE plpgsql;')
    return match
  })
  return s
}

for (const f of files) {
  const full = path.join(schemaDir, f)
  if (!fs.existsSync(full)) { console.error('File not found', full); continue }
  console.log('Normalizing', f)
  const out = normalizeFile(full)
  // write to sanitized preview file
  const previewDir = path.join(__dirname, '..', 'database-schema-sanitized')
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir)
  fs.writeFileSync(path.join(previewDir, f), out, 'utf8')
  console.log('Wrote preview to database-schema-sanitized/' + f)
}
