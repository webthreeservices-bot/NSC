const fs = require('fs');
const path = require('path');
const schemaDir = path.join(__dirname, '..', 'database-schema');
const out = [];
fs.readdirSync(schemaDir).filter(fn=>/\.sql$/.test(fn)).forEach(fn=>{
  const file = path.join(schemaDir, fn);
  const bak = file + '.bak';
  if (!fs.existsSync(bak)) return;
  const orig = fs.readFileSync(bak, 'utf8').split(/\r?\n/);
  const curr = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const max = Math.max(orig.length, curr.length);
  const changes = [];
  for (let i=0;i<max;i++){
    const o = orig[i] || '';
    const c = curr[i] || '';
    if (o !== c) {
      changes.push({line: i+1, orig: o, cur: c});
    }
  }
  if (changes.length) {
    out.push(`*** File: ${fn} (changes: ${changes.length})`);
    changes.forEach(ch=>{
      out.push(`- ${ch.line}: ${ch.orig}`);
      out.push(`+ ${ch.line}: ${ch.cur}`);
    })
    out.push('');
  }
});
if (out.length === 0) { console.log('No differences between sanitized files and .bak backups'); process.exit(0); }
const reportPath = path.join(__dirname, 'sql-sanitized-changes.patch');
fs.writeFileSync(reportPath, out.join('\n'), 'utf8');
console.log('Wrote diff report to:', reportPath);
