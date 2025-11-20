const fs=require('fs');
const path=require('path');
const argv=require('minimist')(process.argv.slice(2));
const schemaDir=path.join(__dirname,'..','database-schema');
const files=argv._.length?argv._:['05_functions.sql','06_triggers.sql'];

for (const f of files) {
  const full=path.join(schemaDir,f);
  if (!fs.existsSync(full)) { console.error('File not found', full); continue }
  let s=fs.readFileSync(full,'utf8');
  // find function blocks
  const funcRegex=/CREATE\s+OR\s+REPLACE\s+FUNCTION[\s\S]*?\bAS\b[\s\S]*?LANGUAGE\s+plpgsql\s*;/ig
  let out=s;
  let m;
  while ((m=funcRegex.exec(s)) !== null) {
    const block = m[0];
    // find opening $tag$
    const openMatch = block.match(/\bAS\s*(\$[A-Za-z0-9_]*\$)/i);
    if (openMatch) {
      const tag = openMatch[1];
      if (tag !== '$$') {
        // replace open tag
        const block2 = block.split(tag).join('$$');
        // ensure closing tag replaced as well
        // block contains both open and close tags normally
        out = out.replace(block, block2);
      }
    }
  }
  // Also normalize standalone DO blocks (DO $ ... $) -> DO $$ ... END $$;
  out = out.replace(/DO\s+\$([A-Za-z0-9_]*)\$/ig, 'DO $$');
  out = out.replace(/END\s+\$([A-Za-z0-9_]*)\s*;/ig, 'END $$;');
  // Write preview to sanitized folder
  const previewDir = path.join(__dirname,'..','database-schema-sanitized')
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir)
  fs.writeFileSync(path.join(previewDir,f), out,'utf8')
  console.log('Wrote preview', f)
}
