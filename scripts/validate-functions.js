const fs = require('fs');
const path = require('path');
const files = [
  path.join(__dirname, '..','database-schema','05_functions.sql'),
  path.join(__dirname, '..','database-schema','06_triggers.sql'),
];

function findFunctions(filePath) {
  const s = fs.readFileSync(filePath,'utf8');
  const lines = s.split(/\r?\n/);
  const results = [];
  for (let i=0; i<lines.length; i++) {
    const ln = lines[i];
    if (/^\s*CREATE\s+OR\s+REPLACE\s+FUNCTION/i.test(ln)) {
      // scan ahead until we find a line with 'AS'
      let j = i;
      let header = ln;
      while (j < lines.length && !/\bAS\b/.test(lines[j])) {
        j++; if (j<lines.length) header += '\n' + lines[j];
      }
      const asLine = (j<lines.length) ? lines[j].trim() : null;
      // check AS token and the next token (if any)
      let asUsage = null;
      if (asLine) {
        const m = asLine.match(/^AS\s*(\$[A-Za-z0-9_]*\$|\$)/i);
        if (m) asUsage = m[1];
      }
      // find terminating LANGUAGE plpgsql; within next 50 lines
      let k = j+1;
      let foundLang = false; let closeFound = false;
      for (; k<Math.min(lines.length, j+500); k++) {
        if (/\$[A-Za-z0-9_]*\$/.test(lines[k])) {
          // keep track of any close tags maybe
        }
        if (/LANGUAGE\s+plpgsql\s*;/i.test(lines[k])) foundLang = true;
        if (/^\s*\$[A-Za-z0-9_]*\$\s*LANGUAGE/i.test(lines[k]) || /\$[A-Za-z0-9_]*\$/.test(lines[k])) {
          // might be close
        }
        if (/^\s*\$[A-Za-z0-9_]*\$\s*LANGUAGE\s+plpgsql\s*;/i.test(lines[k])) { closeFound = true; break }
      }
      results.push({startLine:i+1, asUsage, hasLanguage: foundLang, closeFound});
    }
  }
  return results;
}

files.forEach(f => {
  if (!fs.existsSync(f)) { console.log('Not found', f); return }
  console.log('\nFile:', f)
  console.log(findFunctions(f))
})
