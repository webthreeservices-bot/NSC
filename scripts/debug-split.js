const fs = require('fs');
const path = require('path');

function splitSqlStatements(sql) {
  const dollarBlocks = [];
  let out = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; out += ch; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; out += ch; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const tagMatch = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (tagMatch) {
        const tag = tagMatch[1];
        const openTag = `$${tag}$`;
        const closeTag = openTag;
        const start = i + openTag.length
        // find a closing tag not inside single/double quotes
        let endIndex = -1
        let j = start
        let inSingleLocal = false
        let inDoubleLocal = false
        while (j < sql.length) {
          const ch2 = sql[j]
          if (ch2 === "'" && !inDoubleLocal) { inSingleLocal = !inSingleLocal; j++; continue }
          if (ch2 === '"' && !inSingleLocal) { inDoubleLocal = !inDoubleLocal; j++; continue }
          if (!inSingleLocal && !inDoubleLocal && sql.slice(j, j + closeTag.length) === closeTag) { endIndex = j; break }
          j++
        }
        if (endIndex !== -1) {
          const token = `__DOLLAR_${dollarBlocks.length}__`;
          const block = sql.slice(i, endIndex + closeTag.length);
          dollarBlocks.push(block);
          out += token;
          i = endIndex + closeTag.length;
          continue;
        }
      }
    }
    out += ch; i++;
  }

  const statements = [];
  let current = '';
  inSingle = false;
  inDouble = false;
  for (let j = 0; j < out.length; j++) {
    const ch = out[j];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue }
    if (ch === ';' && !inSingle && !inDouble) { current = current.trim(); if (current.length > 0) statements.push(current + ';'); current = ''; continue }
    current += ch;
  }
  const last = current.trim(); if (last.length > 0) statements.push(last);

  return statements.map(s => {
    let out = s;
    dollarBlocks.forEach((blk, idx) => { out = out.split(`__DOLLAR_${idx}__`).join(blk); });
    return out;
  });
}

// Load and split the file
const target = process.argv[2] || './database-schema/10_referral_bot_requirement.sql';
const pathToFile = path.isAbsolute(target) ? target : path.join(__dirname, '..', target);
if (!fs.existsSync(pathToFile)) { console.error('File not found:', pathToFile); process.exit(1); }
const content = fs.readFileSync(pathToFile, 'utf8');
const statements = splitSqlStatements(content);
// For debugging: show the dollar-blocks extracted
function extractDollarBlocks(sql) {
  const blocks = [];
  let i = 0; let inSingle = false; let inDouble = false;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; i++; continue }
    if (!inSingle && !inDouble && ch === '$') {
      const tagMatch = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (tagMatch) {
        const tag = tagMatch[1]; const openTag = `$${tag}$`; const closeTag = openTag; const start = i + openTag.length
        // find matching closing tag
        let j = start; let inSingleLocal = false; let inDoubleLocal = false; let endIndex = -1
        while (j < sql.length) {
          const ch2 = sql[j];
          if (ch2 === "'" && !inDoubleLocal) { inSingleLocal = !inSingleLocal; j++; continue }
          if (ch2 === '"' && !inSingleLocal) { inDoubleLocal = !inDoubleLocal; j++; continue }
          if (!inSingleLocal && !inDoubleLocal && sql.slice(j, j + closeTag.length) === closeTag) { endIndex = j; break }
          j++
        }
        if (endIndex !== -1) { blocks.push(sql.slice(i, endIndex + closeTag.length)); i = endIndex + closeTag.length; continue }
      }
    }
    i++
  }
  return blocks
}
const blocks = extractDollarBlocks(content);
console.log('\nExtracted', blocks.length, 'dollar-quoted blocks, showing first 3...');
blocks.slice(0,3).forEach((b, idx)=>console.log(JSON.stringify(b.slice(0,300)) + (b.length>300? '...' : '')));
console.log('Parsed', statements.length, 'statements.');
statements.forEach((s, idx) => {
  console.log('\n--- Statement:', idx + 1, 'len', s.length, '---');
  console.log(JSON.stringify(s.slice(0, 800)) + (s.length > 800 ? '...' : ''));
});
