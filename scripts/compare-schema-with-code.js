/**
 * COMPARE LIVE DATABASE WITH CODEBASE
 *
 * This script:
 * 1. Loads the live database schema from live-db-schema.json
 * 2. Scans your codebase for database queries and table/column references
 * 3. Identifies mismatches and missing columns
 * 4. Generates a comprehensive fix report
 *
 * Run with: node scripts/compare-schema-with-code.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const mismatches = {
  missingColumns: [],
  wrongColumnNames: [],
  wrongEnumValues: [],
  missingTables: [],
  issues: []
};

// Load live schema
function loadLiveSchema() {
  const schemaPath = path.join(__dirname, 'live-db-schema.json');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ live-db-schema.json not found!');
    console.error('Please run: node scripts/full-db-schema-audit.js first\n');
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

// Find all TypeScript/JavaScript files
function findCodeFiles() {
  const srcPath = path.join(__dirname, '..');

  const patterns = [
    'app/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'types/**/*.{ts,tsx,js,jsx}'
  ];

  let allFiles = [];

  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: srcPath,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
    });
    allFiles = allFiles.concat(files);
  });

  console.log(`\n✅ Found ${allFiles.length} code files to scan\n`);
  return allFiles;
}

// Extract SQL queries and table references from code
function scanCodeFile(filePath, liveSchema) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  const issues = [];

  // Find SQL queries
  const sqlRegex = /(?:query|execute|pool\.query)\s*\(\s*[`'"]([\s\S]*?)[`'"]/g;
  let match;

  while ((match = sqlRegex.exec(content)) !== null) {
    const sql = match[1];

    // Check for table references
    Object.keys(liveSchema.tables).forEach(tableName => {
      if (sql.includes(`"${tableName}"`)) {
        // Extract column references from this query
        const columnRegex = new RegExp(`"(\\w+)"`, 'g');
        let colMatch;

        while ((colMatch = columnRegex.exec(sql)) !== null) {
          const columnName = colMatch[1];

          // Skip if it's the table name itself
          if (columnName === tableName) continue;

          // Check if column exists in live schema
          const tableColumns = liveSchema.tables[tableName].columns.map(c => c.column_name);

          if (!tableColumns.includes(columnName) && columnName !== tableName) {
            // Check if it might be a different table's column
            let foundInOtherTable = false;
            Object.keys(liveSchema.tables).forEach(otherTable => {
              if (otherTable !== tableName) {
                const otherCols = liveSchema.tables[otherTable].columns.map(c => c.column_name);
                if (otherCols.includes(columnName)) {
                  foundInOtherTable = true;
                }
              }
            });

            if (!foundInOtherTable && !['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER', 'BY', 'LIMIT', 'OFFSET'].includes(columnName)) {
              issues.push({
                file: relativePath,
                table: tableName,
                column: columnName,
                type: 'missing_column',
                message: `Column "${columnName}" not found in table "${tableName}"`
              });
            }
          }
        }
      }
    });

    // Check for enum references
    Object.keys(liveSchema.enums).forEach(enumName => {
      if (sql.includes(enumName)) {
        // Extract potential enum values
        const enumValueRegex = /'(\w+)'/g;
        let enumMatch;

        while ((enumMatch = enumValueRegex.exec(sql)) !== null) {
          const value = enumMatch[1];
          const validValues = liveSchema.enums[enumName];

          if (!validValues.includes(value) && value.length > 0 && value === value.toUpperCase()) {
            issues.push({
              file: relativePath,
              enum: enumName,
              value: value,
              type: 'invalid_enum_value',
              validValues: validValues,
              message: `Invalid ${enumName} value: "${value}". Valid: [${validValues.join(', ')}]`
            });
          }
        }
      }
    });
  }

  // Check TypeScript enum definitions
  Object.keys(liveSchema.enums).forEach(enumName => {
    const enumRegex = new RegExp(`export enum ${enumName}[\\s\\S]*?\\{([\\s\\S]*?)\\}`, 'g');
    const enumMatch = enumRegex.exec(content);

    if (enumMatch) {
      const enumBody = enumMatch[1];
      const codeValues = [];

      // Extract enum values from code
      const valueRegex = /(\w+)\s*=\s*['"](\w+)['"]/g;
      let valueMatch;

      while ((valueMatch = valueRegex.exec(enumBody)) !== null) {
        codeValues.push(valueMatch[2]);
      }

      // Compare with live DB
      const liveValues = liveSchema.enums[enumName];
      const missing = liveValues.filter(v => !codeValues.includes(v));
      const extra = codeValues.filter(v => !liveValues.includes(v));

      if (missing.length > 0 || extra.length > 0) {
        issues.push({
          file: relativePath,
          enum: enumName,
          type: 'enum_mismatch',
          missing: missing,
          extra: extra,
          message: `Enum ${enumName} mismatch. Missing: [${missing.join(', ')}], Extra: [${extra.join(', ')}]`
        });
      }
    }
  });

  return issues;
}

// Main comparison
async function compareSchemaWithCode() {
  console.log('\n🔍 COMPARING LIVE DATABASE WITH CODEBASE');
  console.log('='.repeat(80));

  const liveSchema = loadLiveSchema();
  console.log(`\n✅ Loaded live schema:`);
  console.log(`   - ${Object.keys(liveSchema.tables).length} tables`);
  console.log(`   - ${Object.keys(liveSchema.enums).length} enums`);
  console.log(`   - ${liveSchema.triggers.length} triggers`);

  const codeFiles = findCodeFiles();
  const allIssues = [];

  console.log('🔎 Scanning code files for mismatches...\n');

  codeFiles.forEach((file, index) => {
    if (index % 10 === 0) {
      process.stdout.write(`Progress: ${index}/${codeFiles.length}\r`);
    }

    const fileIssues = scanCodeFile(file, liveSchema);
    allIssues.push(...fileIssues);
  });

  console.log(`\n✅ Scan complete!\n`);

  // Deduplicate issues
  const uniqueIssues = [];
  const issueKeys = new Set();

  allIssues.forEach(issue => {
    const key = `${issue.file}:${issue.table}:${issue.column}:${issue.enum}:${issue.value}`;
    if (!issueKeys.has(key)) {
      issueKeys.add(key);
      uniqueIssues.push(issue);
    }
  });

  // Categorize issues
  const missingColumns = uniqueIssues.filter(i => i.type === 'missing_column');
  const invalidEnums = uniqueIssues.filter(i => i.type === 'invalid_enum_value');
  const enumMismatches = uniqueIssues.filter(i => i.type === 'enum_mismatch');

  // Print report
  console.log('\n' + '='.repeat(80));
  console.log('📋 ANALYSIS REPORT');
  console.log('='.repeat(80));

  console.log(`\n✅ Total Issues Found: ${uniqueIssues.length}\n`);

  if (missingColumns.length > 0) {
    console.log(`\n❌ MISSING COLUMNS (${missingColumns.length}):\n`);
    missingColumns.forEach(issue => {
      console.log(`   File: ${issue.file}`);
      console.log(`   Table: ${issue.table}`);
      console.log(`   Missing Column: ${issue.column}`);
      console.log(`   → ${issue.message}\n`);
    });
  }

  if (invalidEnums.length > 0) {
    console.log(`\n❌ INVALID ENUM VALUES (${invalidEnums.length}):\n`);
    invalidEnums.forEach(issue => {
      console.log(`   File: ${issue.file}`);
      console.log(`   Enum: ${issue.enum}`);
      console.log(`   Invalid Value: ${issue.value}`);
      console.log(`   Valid Values: [${issue.validValues.join(', ')}]`);
      console.log(`   → ${issue.message}\n`);
    });
  }

  if (enumMismatches.length > 0) {
    console.log(`\n⚠️  ENUM DEFINITION MISMATCHES (${enumMismatches.length}):\n`);
    enumMismatches.forEach(issue => {
      console.log(`   File: ${issue.file}`);
      console.log(`   Enum: ${issue.enum}`);
      if (issue.missing.length > 0) {
        console.log(`   Missing in Code: [${issue.missing.join(', ')}]`);
      }
      if (issue.extra.length > 0) {
        console.log(`   Extra in Code: [${issue.extra.join(', ')}]`);
      }
      console.log('');
    });
  }

  if (uniqueIssues.length === 0) {
    console.log('\n🎉 NO MISMATCHES FOUND! Your code matches the live database schema.\n');
  }

  // Save detailed report
  const reportPath = path.join(__dirname, 'schema-comparison-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalIssues: uniqueIssues.length,
      missingColumns: missingColumns.length,
      invalidEnums: invalidEnums.length,
      enumMismatches: enumMismatches.length
    },
    issues: uniqueIssues,
    liveSchema: {
      tables: Object.keys(liveSchema.tables),
      enums: liveSchema.enums
    }
  }, null, 2));

  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);

  return uniqueIssues;
}

// Run comparison
compareSchemaWithCode()
  .then(issues => {
    console.log('='.repeat(80));
    console.log('✅ COMPARISON COMPLETE!');
    console.log('='.repeat(80));
    console.log('');
    process.exit(issues.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
