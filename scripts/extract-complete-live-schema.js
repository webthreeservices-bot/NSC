/**
 * EXTRACT COMPLETE LIVE DATABASE SCHEMA
 * Fetches everything from Neon: tables, columns, types, enums, indexes,
 * foreign keys, triggers, functions, constraints - EVERYTHING
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function extractCompleteSchema() {
  console.log('\n📦 EXTRACTING COMPLETE LIVE DATABASE SCHEMA\n');
  console.log('='.repeat(80));

  let sqlOutput = [];

  sqlOutput.push('-- ============================================================================');
  sqlOutput.push('-- COMPLETE NEON DATABASE SCHEMA DUMP');
  sqlOutput.push('-- Generated: ' + new Date().toISOString());
  sqlOutput.push('-- Database: ' + process.env.DATABASE_URL.split('@')[1].split('/')[0]);
  sqlOutput.push('-- ============================================================================\n');

  try {
    // 1. EXTRACT ENUMS
    console.log('\n1️⃣  Extracting ENUM types...\n');
    const enumsQuery = `
      SELECT
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;

    const enums = await pool.query(enumsQuery);

    sqlOutput.push('-- ============================================================================');
    sqlOutput.push('-- ENUM TYPES');
    sqlOutput.push('-- ============================================================================\n');

    enums.rows.forEach(enumType => {
      console.log(`   ✓ ${enumType.enum_name}`);
      sqlOutput.push(`-- Enum: ${enumType.enum_name}`);
      sqlOutput.push(`CREATE TYPE "${enumType.enum_name}" AS ENUM (`);
      const values = Array.isArray(enumType.enum_values) ? enumType.enum_values : [enumType.enum_values];
      sqlOutput.push(values.map(v => `  '${v}'`).join(',\n'));
      sqlOutput.push(');\n');
    });

    // 2. EXTRACT TABLES WITH FULL DETAILS
    console.log('\n2️⃣  Extracting TABLES and COLUMNS...\n');

    const tablesQuery = `
      SELECT
        table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tables = await pool.query(tablesQuery);

    sqlOutput.push('\n-- ============================================================================');
    sqlOutput.push('-- TABLES');
    sqlOutput.push('-- ============================================================================\n');

    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`   ✓ ${tableName}`);

      // Get columns for this table
      const columnsQuery = `
        SELECT
          c.column_name,
          c.data_type,
          c.udt_name,
          c.is_nullable,
          c.column_default,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          CASE
            WHEN pk.column_name IS NOT NULL THEN true
            ELSE false
          END as is_primary_key
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = $1
          AND tc.table_schema = 'public'
        ) pk ON c.column_name = pk.column_name
        WHERE c.table_name = $1
        AND c.table_schema = 'public'
        ORDER BY c.ordinal_position;
      `;

      const columns = await pool.query(columnsQuery, [tableName]);

      sqlOutput.push(`-- Table: ${tableName}`);
      sqlOutput.push(`CREATE TABLE "${tableName}" (`);

      const columnDefs = [];
      columns.rows.forEach(col => {
        let colDef = `  "${col.column_name}"`;

        // Data type
        if (col.data_type === 'USER-DEFINED') {
          colDef += ` "${col.udt_name}"`;
        } else if (col.data_type === 'character varying') {
          colDef += ` VARCHAR${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`;
        } else if (col.data_type === 'numeric') {
          colDef += ` NUMERIC${col.numeric_precision ? `(${col.numeric_precision},${col.numeric_scale})` : ''}`;
        } else {
          colDef += ` ${col.data_type.toUpperCase()}`;
        }

        // Nullable
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }

        // Default
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }

        // Primary key
        if (col.is_primary_key) {
          colDef += ' PRIMARY KEY';
        }

        columnDefs.push(colDef);
      });

      sqlOutput.push(columnDefs.join(',\n'));
      sqlOutput.push(');\n');
    }

    // 3. EXTRACT INDEXES
    console.log('\n3️⃣  Extracting INDEXES...\n');

    const indexesQuery = `
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname;
    `;

    const indexes = await pool.query(indexesQuery);

    sqlOutput.push('\n-- ============================================================================');
    sqlOutput.push('-- INDEXES');
    sqlOutput.push('-- ============================================================================\n');

    indexes.rows.forEach(idx => {
      console.log(`   ✓ ${idx.indexname} on ${idx.tablename}`);
      sqlOutput.push(`-- Index: ${idx.indexname}`);
      sqlOutput.push(`${idx.indexdef};\n`);
    });

    // 4. EXTRACT FOREIGN KEYS
    console.log('\n4️⃣  Extracting FOREIGN KEYS...\n');

    const foreignKeysQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    const foreignKeys = await pool.query(foreignKeysQuery);

    sqlOutput.push('\n-- ============================================================================');
    sqlOutput.push('-- FOREIGN KEYS');
    sqlOutput.push('-- ============================================================================\n');

    foreignKeys.rows.forEach(fk => {
      console.log(`   ✓ ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      sqlOutput.push(`-- Foreign Key: ${fk.constraint_name}`);
      let fkDef = `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" `;
      fkDef += `FOREIGN KEY ("${fk.column_name}") `;
      fkDef += `REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}")`;
      if (fk.update_rule !== 'NO ACTION') {
        fkDef += ` ON UPDATE ${fk.update_rule}`;
      }
      if (fk.delete_rule !== 'NO ACTION') {
        fkDef += ` ON DELETE ${fk.delete_rule}`;
      }
      sqlOutput.push(fkDef + ';\n');
    });

    // 5. EXTRACT UNIQUE CONSTRAINTS
    console.log('\n5️⃣  Extracting UNIQUE CONSTRAINTS...\n');

    const uniqueConstraintsQuery = `
      SELECT
        tc.table_name,
        tc.constraint_name,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
      GROUP BY tc.table_name, tc.constraint_name
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    const uniqueConstraints = await pool.query(uniqueConstraintsQuery);

    sqlOutput.push('\n-- ============================================================================');
    sqlOutput.push('-- UNIQUE CONSTRAINTS');
    sqlOutput.push('-- ============================================================================\n');

    uniqueConstraints.rows.forEach(uc => {
      console.log(`   ✓ ${uc.table_name}: ${uc.columns}`);
      sqlOutput.push(`-- Unique Constraint: ${uc.constraint_name}`);
      sqlOutput.push(`ALTER TABLE "${uc.table_name}" ADD CONSTRAINT "${uc.constraint_name}" UNIQUE (${uc.columns.split(', ').map(c => `"${c}"`).join(', ')});\n`);
    });

    // 6. EXTRACT CHECK CONSTRAINTS
    console.log('\n6️⃣  Extracting CHECK CONSTRAINTS...\n');

    const checkConstraintsQuery = `
      SELECT
        tc.table_name,
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.check_constraints AS cc
        ON tc.constraint_name = cc.constraint_name
        AND tc.constraint_schema = cc.constraint_schema
      WHERE tc.constraint_type = 'CHECK'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    const checkConstraints = await pool.query(checkConstraintsQuery);

    if (checkConstraints.rows.length > 0) {
      sqlOutput.push('\n-- ============================================================================');
      sqlOutput.push('-- CHECK CONSTRAINTS');
      sqlOutput.push('-- ============================================================================\n');

      checkConstraints.rows.forEach(cc => {
        console.log(`   ✓ ${cc.table_name}: ${cc.constraint_name}`);
        sqlOutput.push(`-- Check Constraint: ${cc.constraint_name}`);
        sqlOutput.push(`ALTER TABLE "${cc.table_name}" ADD CONSTRAINT "${cc.constraint_name}" CHECK (${cc.check_clause});\n`);
      });
    }

    // 7. EXTRACT FUNCTIONS
    console.log('\n7️⃣  Extracting FUNCTIONS...\n');

    const functionsQuery = `
      SELECT
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      ORDER BY p.proname;
    `;

    const functions = await pool.query(functionsQuery);

    sqlOutput.push('\n-- ============================================================================');
    sqlOutput.push('-- FUNCTIONS');
    sqlOutput.push('-- ============================================================================\n');

    functions.rows.forEach(func => {
      console.log(`   ✓ ${func.function_name}()`);
      sqlOutput.push(`-- Function: ${func.function_name}`);
      sqlOutput.push(func.definition + '\n');
    });

    // 8. EXTRACT TRIGGERS
    console.log('\n8️⃣  Extracting TRIGGERS...\n');

    const triggersQuery = `
      SELECT
        t.tgname as trigger_name,
        c.relname as table_name,
        pg_get_triggerdef(t.oid) as definition
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
      AND NOT t.tgisinternal
      ORDER BY c.relname, t.tgname;
    `;

    const triggers = await pool.query(triggersQuery);

    sqlOutput.push('\n-- ============================================================================');
    sqlOutput.push('-- TRIGGERS');
    sqlOutput.push('-- ============================================================================\n');

    triggers.rows.forEach(trigger => {
      console.log(`   ✓ ${trigger.trigger_name} on ${trigger.table_name}`);
      sqlOutput.push(`-- Trigger: ${trigger.trigger_name} on ${trigger.table_name}`);
      sqlOutput.push(trigger.definition + ';\n');
    });

    // 9. EXTRACT SEQUENCES
    console.log('\n9️⃣  Extracting SEQUENCES...\n');

    const sequencesQuery = `
      SELECT
        sequencename,
        start_value,
        increment_by,
        max_value,
        min_value,
        cache_size,
        cycle
      FROM pg_sequences
      WHERE schemaname = 'public'
      ORDER BY sequencename;
    `;

    const sequences = await pool.query(sequencesQuery);

    if (sequences.rows.length > 0) {
      sqlOutput.push('\n-- ============================================================================');
      sqlOutput.push('-- SEQUENCES');
      sqlOutput.push('-- ============================================================================\n');

      sequences.rows.forEach(seq => {
        console.log(`   ✓ ${seq.sequencename}`);
        sqlOutput.push(`-- Sequence: ${seq.sequencename}`);
        sqlOutput.push(`CREATE SEQUENCE "${seq.sequencename}"`);
        sqlOutput.push(`  START WITH ${seq.start_value}`);
        sqlOutput.push(`  INCREMENT BY ${seq.increment_by}`);
        sqlOutput.push(`  MINVALUE ${seq.min_value}`);
        sqlOutput.push(`  MAXVALUE ${seq.max_value}`);
        sqlOutput.push(`  CACHE ${seq.cache_size};`);
        sqlOutput.push('');
      });
    }

    // 10. SAVE TO FILE
    const outputPath = path.join(__dirname, 'live-database-complete-schema.sql');
    fs.writeFileSync(outputPath, sqlOutput.join('\n'));

    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n📄 Complete schema saved to: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   • Enums: ${enums.rows.length}`);
    console.log(`   • Tables: ${tables.rows.length}`);
    console.log(`   • Indexes: ${indexes.rows.length}`);
    console.log(`   • Foreign Keys: ${foreignKeys.rows.length}`);
    console.log(`   • Unique Constraints: ${uniqueConstraints.rows.length}`);
    console.log(`   • Check Constraints: ${checkConstraints.rows.length}`);
    console.log(`   • Functions: ${functions.rows.length}`);
    console.log(`   • Triggers: ${triggers.rows.length}`);
    console.log(`   • Sequences: ${sequences.rows.length}\n`);

    return {
      enums: enums.rows,
      tables: tables.rows,
      indexes: indexes.rows,
      foreignKeys: foreignKeys.rows,
      uniqueConstraints: uniqueConstraints.rows,
      checkConstraints: checkConstraints.rows,
      functions: functions.rows,
      triggers: triggers.rows,
      sequences: sequences.rows
    };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

extractCompleteSchema()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
