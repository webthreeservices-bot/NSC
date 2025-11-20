const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node count-dollar-tags.js <file>'); process.exit(1)}
const s = fs.readFileSync(path, 'utf8');
const re = /\$([A-Za-z0-9_]*)\$/g;
let m; const arr = [];
while ((m = re.exec(s)) !== null) arr.push(m[0]);
console.log('count:', arr.length)
console.log(arr.slice(0, 50))
