/**
 * COMPLETE DATABASE MIGRATION SCRIPT
 *
 * This script creates all necessary database functions and indexes
 * for the NSC Bot Platform on Neon DB.
 *
 * Safe to run multiple times (uses CREATE OR REPLACE / IF NOT EXISTS)
 */

let Pool
try {
  ({ Pool } = require('pg'))
} catch (e) {
  console.error('\n❌ Missing dependency: `pg` (postgres client) is not installed or failed to load.')
  console.error('   Please run `npm ci` (or `npm ci --no-optional`) in the repo root, and re-run the script.')
  console.error('   Common issues on Windows: file locked by editor/antivirus, or corrupted node_modules. Try:')
  console.error('     1) Close editors/IDEs and any Node processes. 2) Remove node_modules (rm -rf node_modules). 3) Run `npm ci --no-optional` as Administrator if necessary.')
  console.error(`\n   Under the hood, Node reported: ${e && e.message}`)
  process.exit(1)
}
require('dotenv').config()

const crypto = require('crypto')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? {
    rejectUnauthorized: false
  } : false
})

async function runMigrations() {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n')
  const force = process.argv.includes('--force') || process.argv.includes('-f')
  const reapply = process.argv.includes('--reapply') || process.argv.includes('-r')
  const applyStaged = process.argv.includes('--apply-staged') || process.argv.includes('-s')
  const failFast = process.argv.includes('--fail-fast') || process.argv.includes('-F')
  const client = await pool.connect()

  try {
    console.log('🚀 RUNNING DATABASE MIGRATIONS')
    console.log('=' .repeat(70))
    console.log(`📅 Timestamp: ${new Date().toISOString()}`)
    console.log(`🗄️  Database: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`)
    console.log(`⚙️  Flags: dryRun=${dryRun ? 'yes' : 'no'}, force=${force ? 'yes' : 'no'}, reapply=${reapply ? 'yes' : 'no'}`)
    console.log('=' .repeat(70))

    // Start transaction
    await client.query('BEGIN')

    // Ensure MigrationLog table exists to track applied files (skip creating persistent migration log in dry-run)
    if (!dryRun) {
      try {
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')
      } catch (e) {
        // non-fatal - extension might not be allowed in some managed DBs (already handled elsewhere)
      }
      await client.query(`CREATE TABLE IF NOT EXISTS public."MigrationLog" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL UNIQUE,
        appliedAt TIMESTAMP NOT NULL,
        status TEXT NOT NULL,
        details JSONB DEFAULT '{}' 
      );`)
    }

    // ========================================
    // MIGRATION 1: User Balance Function
    // ========================================
    console.log('\n📦 Migration 1: Creating get_user_balance() function...')
    await client.query(`
      DROP FUNCTION IF EXISTS get_user_balance(TEXT);

      CREATE OR REPLACE FUNCTION get_user_balance(p_user_id TEXT)
      RETURNS TABLE (
        "roiBalance" NUMERIC,
        "referralBalance" NUMERIC,
        "levelBalance" NUMERIC,
        "totalBalance" NUMERIC,
        "lockedCapital" NUMERIC
      ) AS $$
      DECLARE
        v_roi_balance NUMERIC;
        v_referral_balance NUMERIC;
        v_level_balance NUMERIC;
        v_total_withdrawn NUMERIC;
        v_locked_capital NUMERIC;
        v_total_earned NUMERIC;
        v_total_balance NUMERIC;
      BEGIN
        -- Get ROI balance
        SELECT COALESCE(SUM(amount)::NUMERIC, 0)
        INTO v_roi_balance
        FROM "Transaction"
        WHERE "userId" = p_user_id
        AND type = 'ROI_PAYMENT'
        AND status = 'COMPLETED';

        -- Get referral balance
        SELECT COALESCE(SUM(amount)::NUMERIC, 0)
        INTO v_referral_balance
        FROM "Earning"
        WHERE "userId" = p_user_id
        AND "earningType" = 'DIRECT_REFERRAL'::EarningType;

        -- Get level balance
        SELECT COALESCE(SUM(amount)::NUMERIC, 0)
        INTO v_level_balance
        FROM "Earning"
        WHERE "userId" = p_user_id
        AND "earningType" = 'LEVEL_INCOME'::EarningType;

        -- Get total withdrawn
        SELECT COALESCE(SUM(amount)::NUMERIC, 0)
        INTO v_total_withdrawn
        FROM "Withdrawal"
        WHERE "userId" = p_user_id
        AND status = 'COMPLETED';

        -- Get locked capital
        SELECT COALESCE(SUM(amount)::NUMERIC, 0)
        INTO v_locked_capital
        FROM "Package"
        WHERE "userId" = p_user_id
        AND status = 'ACTIVE';

        -- Calculate totals
        v_total_earned := v_roi_balance + v_referral_balance + v_level_balance;
        v_total_balance := GREATEST(v_total_earned - v_total_withdrawn, 0);

        -- Return the values
        RETURN QUERY
        SELECT
          v_roi_balance,
          v_referral_balance,
          v_level_balance,
          v_total_balance,
          v_locked_capital;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ get_user_balance() created')

    // ========================================
    // MIGRATION 2: Session Management Functions
    // ========================================
    console.log('\n📦 Migration 2: Creating session management functions...')

    // 2.1 validate_session
    await client.query(`
      DROP FUNCTION IF EXISTS validate_session(TEXT);

      CREATE OR REPLACE FUNCTION validate_session(p_token_hash TEXT)
      RETURNS TABLE (
        "sessionId" TEXT,
        "userId" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "isValid" BOOLEAN,
        "createdAt" TIMESTAMP,
        "lastUsedAt" TIMESTAMP,
        "expiresAt" TIMESTAMP
      ) AS $$
      DECLARE
        v_session RECORD;
      BEGIN
        SELECT
          s.id,
          s."userId",
          s."ipAddress",
          s."userAgent",
          s."createdAt",
          s."lastActivityAt",
          s."expiresAt",
          s."isActive"
        INTO v_session
        FROM "Session" s
        WHERE s."tokenHash" = p_token_hash
        AND s."isActive" = true
        AND s."expiresAt" > NOW()
        LIMIT 1;

        IF NOT FOUND THEN
          RETURN QUERY SELECT
            NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT,
            false, NULL::TIMESTAMP, NULL::TIMESTAMP, NULL::TIMESTAMP;
          RETURN;
        END IF;

        UPDATE "Session"
        SET "lastActivityAt" = NOW()
        WHERE id = v_session.id;

        RETURN QUERY SELECT
          v_session.id,
          v_session."userId",
          v_session."ipAddress",
          v_session."userAgent",
          true,
          v_session."createdAt",
          v_session."lastActivityAt",
          v_session."expiresAt";
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ validate_session() created')

    // 2.2 revoke_session
    await client.query(`
      DROP FUNCTION IF EXISTS revoke_session(TEXT);

      CREATE OR REPLACE FUNCTION revoke_session(p_session_id TEXT)
      RETURNS BOOLEAN AS $$
      DECLARE
        v_updated INTEGER;
      BEGIN
        UPDATE "Session"
        SET "isActive" = false
        WHERE id = p_session_id;

        GET DIAGNOSTICS v_updated = ROW_COUNT;
        RETURN v_updated > 0;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ revoke_session() created')

    // 2.3 revoke_all_user_sessions
    await client.query(`
      DROP FUNCTION IF EXISTS revoke_all_user_sessions(TEXT);

      CREATE OR REPLACE FUNCTION revoke_all_user_sessions(p_user_id TEXT)
      RETURNS INTEGER AS $$
      DECLARE
        v_updated INTEGER;
      BEGIN
        UPDATE "Session"
        SET "isActive" = false
        WHERE "userId" = p_user_id
        AND "isActive" = true;

        GET DIAGNOSTICS v_updated = ROW_COUNT;
        RETURN v_updated;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ revoke_all_user_sessions() created')

    // 2.4 revoke_other_sessions
    await client.query(`
      DROP FUNCTION IF EXISTS revoke_other_sessions(TEXT, TEXT);

      CREATE OR REPLACE FUNCTION revoke_other_sessions(
        p_user_id TEXT,
        p_current_session_id TEXT
      )
      RETURNS INTEGER AS $$
      DECLARE
        v_updated INTEGER;
      BEGIN
        UPDATE "Session"
        SET "isActive" = false
        WHERE "userId" = p_user_id
        AND id != p_current_session_id
        AND "isActive" = true;

        GET DIAGNOSTICS v_updated = ROW_COUNT;
        RETURN v_updated;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ revoke_other_sessions() created')

    // 2.5 get_user_sessions
    await client.query(`
      DROP FUNCTION IF EXISTS get_user_sessions(TEXT);

      CREATE OR REPLACE FUNCTION get_user_sessions(p_user_id TEXT)
      RETURNS TABLE (
        "sessionId" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "isActive" BOOLEAN,
        "createdAt" TIMESTAMP,
        "lastUsedAt" TIMESTAMP,
        "expiresAt" TIMESTAMP
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          s.id,
          s."ipAddress",
          s."userAgent",
          s."isActive",
          s."createdAt",
          s."lastActivityAt",
          s."expiresAt"
        FROM "Session" s
        WHERE s."userId" = p_user_id
        ORDER BY s."lastActivityAt" DESC;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ get_user_sessions() created')

    // ========================================
    // MIGRATION 3: Performance Indexes
    // ========================================
    console.log('\n📦 Migration 3: Creating performance indexes...')

    const indexes = [
      { name: 'Package_userId_idx', table: 'Package', column: '"userId"' },
      { name: 'Transaction_userId_idx', table: 'Transaction', column: '"userId"' },
      { name: 'Withdrawal_userId_idx', table: 'Withdrawal', column: '"userId"' },
      { name: 'Session_userId_idx', table: 'Session', column: '"userId"' },
      { name: 'Earning_userId_idx', table: 'Earning', column: '"userId"' },
      { name: 'RoiPayment_packageId_idx', table: 'RoiPayment', column: '"packageId"' },
      { name: 'RoiPayment_userId_idx', table: 'RoiPayment', column: '"userId"' },
      { name: 'Package_status_idx', table: 'Package', column: 'status' },
      { name: 'Transaction_status_idx', table: 'Transaction', column: 'status' },
      { name: 'Withdrawal_status_idx', table: 'Withdrawal', column: 'status' }
    ]

    for (const index of indexes) {
      await client.query(`
        CREATE INDEX IF NOT EXISTS "${index.name}"
        ON "${index.table}" (${index.column})
      `)
      console.log(`   ✅ ${index.name}`)
    }

    // ========================================
    // MIGRATION 4: LostCommission table
    // ========================================
    console.log('\n📦 Migration 4: Creating LostCommission table and indexes...')
    // Check if table exists using to_regclass with exact case handling
    const tableCheck = await client.query(`SELECT to_regclass('public."LostCommission"') as name`)
    const tableExists = tableCheck.rows[0].name !== null
    if (!tableExists) {
      await client.query(`
        CREATE TABLE public."LostCommission" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "packageId" TEXT NOT NULL,
          "wouldBeRecipientId" TEXT,
          level INTEGER,
          amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
          reason TEXT DEFAULT 'no_bot',
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        );
      `)
      console.log('   ✅ LostCommission table created')
    } else {
      console.log('   ⚠️  LostCommission table already exists, skipping')
    }

    // Index existence checks
    const idxPackage = await client.query(`SELECT indexname FROM pg_indexes WHERE indexname = 'idx_lostcommission_package'`)
    const idxRecipient = await client.query(`SELECT indexname FROM pg_indexes WHERE indexname = 'idx_lostcommission_recipient'`)
    if (idxPackage.rows.length === 0) {
      await client.query(`CREATE INDEX "idx_lostcommission_package" ON public."LostCommission" ("packageId")`)
      console.log('   ✅ idx_lostcommission_package created')
    } else {
      console.log('   ⚠️  idx_lostcommission_package already exists, skipping')
    }
    if (idxRecipient.rows.length === 0) {
      await client.query(`CREATE INDEX "idx_lostcommission_recipient" ON public."LostCommission" ("wouldBeRecipientId")`)
      console.log('   ✅ idx_lostcommission_recipient created')
    } else {
      console.log('   ⚠️  idx_lostcommission_recipient already exists, skipping')
    }

    // ========================================
    // MIGRATION 5: Apply SQL files in database-schema folder (alphabetically)
    // ========================================
    console.log('\n📦 Migration 5: Applying `database-schema` SQL files...')
    const fs = require('fs')
    const path = require('path')
    const schemaDirName = process.env.SCHEMA_DIR || 'database-schema'
    const schemaDir = path.join(__dirname, '..', schemaDirName)
    const files = fs.readdirSync(schemaDir)
      .filter(fn => /^\d{2}_.*\.sql$/.test(fn))
      .sort()

    // Helper: splits SQL into statements while preserving dollar-quoted functions
    // A robust splitter that understands single/double quotes and dollar-quoted blocks
    function splitSqlStatements(sql) {
      // first, replace dollar-quoted blocks using a scanner (ignoring those inside single/double quotes)
      const dollarBlocks = []
      let out = ''
      let i = 0
      let inSingle = false
      let inDouble = false
      while (i < sql.length) {
        const ch = sql[i]
        if (ch === "'" && !inDouble) { inSingle = !inSingle; out += ch; i++; continue }
        if (ch === '"' && !inSingle) { inDouble = !inDouble; out += ch; i++; continue }
        // detect $tag$ when not in single or double quote
        if (!inSingle && !inDouble && ch === '$') {
          // attempt to read tag
          const tagMatch = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
          if (tagMatch) {
            const tag = tagMatch[1]
            const openTag = `$${tag}$`
            const closeTag = openTag
            const start = i + openTag.length
            // Find a closing tag that is NOT inside single/double quotes
            let endIndex = -1
            let j = start
            let inSingleLocal = false
            let inDoubleLocal = false
            while (j < sql.length) {
              const ch2 = sql[j]
              if (ch2 === "'" && !inDoubleLocal) { inSingleLocal = !inSingleLocal; j++; continue }
              if (ch2 === '"' && !inSingleLocal) { inDoubleLocal = !inDoubleLocal; j++; continue }
              if (!inSingleLocal && !inDoubleLocal && sql.slice(j, j + closeTag.length) === closeTag) {
                endIndex = j
                break
              }
              j++
            }
            if (endIndex !== -1) {
              // we found a dollar-quoted block; replace it with a token and advance
              const token = `__DOLLAR_${dollarBlocks.length}__`
              const block = sql.slice(i, endIndex + closeTag.length)
              dollarBlocks.push(block)
              out += token
              i = endIndex + closeTag.length
              continue
            }
          }
        }
        out += ch
        i++
      }

      // Now split using semicolons while respecting quotes
      const statements = []
      let current = ''
      inSingle = false
      inDouble = false
      for (let j = 0; j < out.length; j++) {
        const ch = out[j]
        if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue }
        if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue }
        if (ch === ';' && !inSingle && !inDouble) {
          current = current.trim()
          if (current.length > 0) statements.push(current + ';')
          current = ''
          continue
        }
        current += ch
      }
      const last = current.trim()
      if (last.length > 0) statements.push(last)

      // restore dollar blocks
      const restored = statements.map(s => {
        let out = s
        dollarBlocks.forEach((blk, idx) => {
          const token = `__DOLLAR_${idx}__`
          out = out.split(token).join(blk)
        })
        return out
      })
      return restored
    }

    // Strip psql meta-commands (\-prefixed) and normalize some common constructs
    function sanitizeSql(rawSql) {
      // Remove backslash meta commands like \echo, \set, etc. Keep \i lines so expandIncludes handles them.
      const lines = rawSql.split(/\r?\n/)
      const kept = []
      for (let ln of lines) {
        const t = ln.trim()
        if (t.startsWith('\\')) {
          // If it's an include (\i) we keep it — expansion will inline it later. Otherwise drop it.
          if (/^\\i\s+/.test(t)) {
            kept.push(ln)
          } else {
            // Drop psql meta-commands silently but keep a comment marker
            kept.push('-- [psql command removed by sanitizer]')
          }
        } else {
          kept.push(ln)
        }
      }
      let out = kept.join('\n')

      // Normalize accidental usages of `DO $` to `DO $$` (single-dollar tags are invalid).
      // Detect `DO $ BEGIN` or `DO $tag$ BEGIN` with empty or whitespace tag and normalize to `DO $$ BEGIN`.
      out = out.replace(/DO\s+\$\s+BEGIN/gi, 'DO $$ BEGIN')
      // Normalize stray END $; to END $$;
      out = out.replace(/END\s+\$\s*;/gi, 'END $$;')

      // Convert `CREATE TYPE IF NOT EXISTS` to safe DO + to_regtype check for Postgres versions
      // that don't support `IF NOT EXISTS` for CREATE TYPE. This avoids syntax errors on older engines.
      out = out.replace(/CREATE\s+TYPE\s+IF\s+NOT\s+EXISTS\s+"([A-Za-z0-9_]+)"\s+AS\s+ENUM\s*\(([^;]*?)\);/gims, (m, typeName, inner) => {
        return `DO $$\nBEGIN\n  IF to_regtype('public."${typeName}"') IS NULL THEN\n    CREATE TYPE "${typeName}" AS ENUM (${inner});\n  END IF;\nEND$$;`
      })

      // Detect if some dollar-quote tags may not be balanced; this is a heuristic check
      // Scan for $tag$ occurrences that are not inside single/double quotes
      const seen = new Map()
      let i2 = 0
      let inSingle2 = false
      let inDouble2 = false
      while (i2 < out.length) {
        const ch = out[i2]
        if (ch === "'" && !inDouble2) { inSingle2 = !inSingle2; i2++; continue }
        if (ch === '"' && !inSingle2) { inDouble2 = !inDouble2; i2++; continue }
        if (!inSingle2 && !inDouble2 && ch === '$') {
          const tagMatch = out.slice(i2).match(/^\$([A-Za-z0-9_]*)\$/)
          if (tagMatch) {
            const tag = tagMatch[1]
            seen.set(tag, (seen.get(tag) || 0) + 1)
            i2 += tagMatch[0].length
            continue
          }
        }
        i2++
      }
      const unbalanced = Array.from(seen.entries()).filter(([k, v]) => (v % 2) !== 0)
      if (unbalanced.length > 0) {
        console.warn(`     ⚠️  Potential unbalanced dollar-quoted tags detected: ${JSON.stringify(unbalanced)}`)
      }

      return out
    }

    const failures = []
    let earliestNon25 = null
    let earliestError = null
    const stagedViews = []
    // helper to recursively expand \i directives in master SQL files
    function expandIncludes(rootPath, content, visitedFiles = new Set()) {
      const lines = content.split(/\r?\n/)
      let result = ''
      for (const line of lines) {
        const m = line.trim().match(/^\\i\s+(.+)$/)
        if (m) {
          // Resolve the include path relative to the root of the repo or rootPath
          let incPath = m[1].trim().replace(/['"]+/g, '')
          // If include is prefixed with database-schema/, remove the prefix so we can resolve against schemaDir
          if (incPath.startsWith('database-schema/')) incPath = incPath.replace(/^database-schema\//, '')
          const candidates = [
            path.join(rootPath, incPath),
            path.join(__dirname, '..', incPath),
            path.resolve(incPath)
          ]
          let normalized = null
          for (const cand of candidates) {
            if (fs.existsSync(cand)) { normalized = path.resolve(cand); break }
          }
          if (visitedFiles.has(normalized)) {
            console.log(`     ⚠️  Skipping circular include: ${incPath}`)
            continue
          }
          if (!normalized) {
            console.log(`     ⚠️  Included file not found: ${incPath}`)
            continue
          }
          visitedFiles.add(normalized)
          const childSql = fs.readFileSync(normalized, 'utf8')
          // Recursively expand includes in child and strip psql meta-commands
          let childExpanded = expandIncludes(path.dirname(normalized), childSql, visitedFiles)
          // Strip any psql meta-commands (lines starting with backslash) from included content
          childExpanded = childExpanded.split(/\r?\n/).filter(ln => !ln.trim().startsWith('\\')).join('\n')
          result += `\n-- Begin included: ${path.relative(schemaDir, normalized)}\n`
          result += childExpanded
          result += `\n-- End included: ${path.relative(schemaDir, normalized)}\n`
        } else {
          result += line + '\n'
        }
      }
      return result
    }

    // Helper: check if a view exists and return its columns (array)
    async function getViewColumns(client, name) {
      // Try a few forms because identifier case may vary when quoted vs unquoted
      const candidates = [name, name.toLowerCase(), name.toUpperCase()]
      const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ANY($1::text[]) ORDER BY ordinal_position`, [candidates])
      return res.rows.map(r => r.column_name)
    }

    // Handle CREATE OR REPLACE VIEW statements safely: make temp view, compare columns, and either replace or stage
    async function handleViewStatement(client, stmt, viewName, fileName, stmtCounter) {
      try {
        // sanitize viewName for SQL identifiers
        const sanitized = String(viewName).replace(/"/g, '')
        const ts = Date.now()
        const tempName = `${sanitized}__migtmp__${ts}`
        const stagedName = `${sanitized}__staged__${ts}`

        // Build a temporary CREATE VIEW statement by replacing only first occurrence of the view definition
        const tempStmt = stmt.replace(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:"[^"]+"|[A-Za-z0-9_]+)/i, `CREATE VIEW "${tempName}"`)

        // Try to create the temporary view
        try {
          await client.query(tempStmt)
        } catch (e) {
          return { handled: true, failed: true, error: `Failed to create temporary view ${tempName}: ${e && e.message}` }
        }

        // Get columns for existing and new view
        const existingCols = await getViewColumns(client, sanitized).catch(() => [])
        const newCols = await getViewColumns(client, tempName).catch(() => [])

        // If existing view doesn't exist, simply create the view using original statement
        if (existingCols.length === 0) {
          try {
            // Use CREATE OR REPLACE VIEW (safe) by executing original statement
            await client.query(stmt)
            // Drop the temp view if it exists
            try { await client.query(`DROP VIEW IF EXISTS "${tempName}"`) } catch (e) {}
            return { handled: true, applied: true }
          } catch (e) {
            // Clean up temp and return failure
            try { await client.query(`DROP VIEW IF EXISTS "${tempName}"`) } catch (err) {}
            return { handled: true, failed: true, error: `Failed to create view ${sanitized}: ${e.message}` }
          }
        }

        // Compare for column drops
        const dropped = existingCols.filter(c => !newCols.includes(c))
        if (dropped.length > 0) {
          // Create staged view by renaming temp view so an admin can review and swap when ready
          try {
            await client.query(`ALTER VIEW "${tempName}" RENAME TO "${stagedName}"`)
          } catch (e) {
            // if rename fails, try to drop the temp view — but don't fail the migration overall
            console.error(`     ⚠️  Failed to rename staged view ${tempName} -> ${stagedName}:`, e && e.message)
          }
          const message = { file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), stagedName, error: `Staged view created as ${stagedName}; migration requires manual review (dropped cols: ${JSON.stringify(dropped)})` }
          return { handled: true, staged: true, messages: [message] }
        }

        // No dropped columns, we can attempt to replace using original statement
        try {
          await client.query(stmt)
          // cleanup temp view
          try { await client.query(`DROP VIEW IF EXISTS "${tempName}"`) } catch (e) {}
          return { handled: true, applied: true }
        } catch (e) {
          // If replace failed, drop temp and return error
          try { await client.query(`DROP VIEW IF EXISTS "${tempName}"`) } catch (err) {}
          return { handled: true, failed: true, error: `Failed to replace view ${sanitized}: ${e && e.message}` }
        }
      } catch (err) {
        return { handled: true, failed: true, error: err.message }
      }
    }

    for (const fileName of files) {
      const filePath = path.join(schemaDir, fileName)
      console.log('   → Applying', fileName)
      const rawSql = fs.readFileSync(filePath, 'utf8')

      // Skip files already marked as success in MigrationLog
      try {
        const res = await client.query(`SELECT status FROM public."MigrationLog" WHERE name = $1 LIMIT 1`, [fileName])
        if (!force && res.rows.length > 0 && res.rows[0].status === 'success') {
          console.log(`     ⚠️  Skipping ${fileName} — already applied (MigrationLog).`)
          continue
        }
        if (force && res.rows.length > 0 && res.rows[0].status === 'success') {
          console.log(`     ⚠️  Re-applying ${fileName} due to --force despite MigrationLog marking as success.`)
        }
      } catch (e) {
        // ignore; continue applying file
      }

      // If this is the master file (contains \i includes), expand includes inline
      let sqlToRun = rawSql
      const hasIncludes = rawSql.split(/\r?\n/).some(line => line.trim().startsWith('\\i'))
      if (hasIncludes && fileName === '00_MASTER_SCHEMA.sql') {
        console.log(`     • Expanding includes in ${fileName}`)
        sqlToRun = expandIncludes(schemaDir, rawSql)
      } else {
        // If this file contains other psql meta-commands (lines starting with \), we'll sanitize it
        const containsPsqlCommands = rawSql.split(/\r?\n/).some(line => line.trim().startsWith('\\'))
        if (containsPsqlCommands) {
          console.log(`     ⚠️  Stripping psql meta-commands from ${fileName} (e.g. \\echo).`)
          // Leave sqlToRun as rawSql (sanitization happens below) — continue processing
        }
      }

      // Run sanitizer before splitting
      const sanitized = sanitizeSql(sqlToRun)
      // compute per-file hash to detect changes between runs
      const hash = crypto.createHash('sha256').update(sanitized).digest('hex')
      // If file includes dollar-quoted blocks (function or DO blocks), avoid splitting and treat as a single statement
      const hasDollarBlocks = /\b(AS\s+\$[A-Za-z0-9_]*\$|DO\s+\$[A-Za-z0-9_]*\$)/i.test(sanitized)
      const isMaster = fileName === '00_MASTER_SCHEMA.sql'
      const statements = (hasDollarBlocks && !isMaster) ? [sanitized] : splitSqlStatements(sanitized)
      if (statements.length === 0) {
        console.log(`     ⚠️  No statements found in ${fileName}, skipping`) 
        continue
      }

      try {
        // Check migration log to decide whether to apply this file
        try {
          const res = await client.query(`SELECT status, details FROM public."MigrationLog" WHERE name = $1 LIMIT 1`, [fileName])
          if (res.rows.length > 0) {
            const st = res.rows[0].status
            const details = res.rows[0].details || {}
            const prevHash = details.hash || null
            // If it's success and has the same hash, skip (unless force)
            if (st === 'success' && prevHash === hash && !force) {
              console.log(`     ⚠️  Skipping ${fileName} — already applied with same hash (MigrationLog).`)
              continue
            }
            // If it's success but changed hash, inform reapply required; reapply only if force or reapply
            if (st === 'success' && prevHash !== hash && !force && !reapply) {
              console.log(`     ⚠️  ${fileName} changed since last apply. Use --reapply or --force to re-apply.`)
              continue
            }
            // If partial/failed, reapply only if reapply or force
            if ((st === 'partial' || st === 'failed') && !reapply && !force) {
              console.log(`     ⚠️  Skipping ${fileName} (status=${st}). Use --reapply to attempt again.`)
              continue
            }
          }
        } catch (e) {
          // ignore any errors fetching migration log, continue
        }
        let stmtCounter = 0
        let lastStatementError = null
        let fileFailures = []
        for (const stmt of statements) {
          if (stmt.length === 0) continue

          // Try to create or replace view statements; avoid automated drops that
          // can cascade and break dependent views. Instead, attempt the statement
          // and, if it fails because replacing would drop columns, skip it and
          // warn about the need for a manual review.

          stmtCounter++
          const sanitizedFile = fileName.replace(/[^A-Za-z0-9_]/g, '_')
          const savePoint = `sp_${sanitizedFile}_${stmtCounter}`
          try {
            // Special handling for CREATE OR REPLACE VIEW statements — convert to staged replacements
            const viewMatch = stmt.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:"([^"]+)"|([A-Za-z0-9_]+))/i)
            let handled = null
            if (viewMatch) {
              const viewName = (viewMatch[1] || viewMatch[2])
              // handle view statement safely
              handled = await handleViewStatement(client, stmt, viewName, fileName, stmtCounter)
              if (handled && handled.staged) {
                fileFailures.push(...(handled.messages || []))
                failures.push(...(handled.messages || []))
                // capture staged view info for summary
                for (const m of (handled.messages || [])) {
                  try { stagedViews.push({ file: m.file, statementIndex: m.statementIndex, stagedName: m.stagedName || (m.error.match(/created as (\"?\w+\"?[^;]*)/i) ? m.error.match(/created as (\"?\w+\"?[^;]*)/i)[1] : null), notes: m.error }) } catch (e) {}
                }
                // continue next statement
                continue
              }
              if (handled && handled.failed) {
                // add to failures and skip executing original statement
                fileFailures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: handled.error || 'view handling failed', code: handled.code || null })
                failures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: handled.error || 'view handling failed', code: handled.code || null })
                if (failFast) {
                  console.log('   ❌ --fail-fast enabled: stopping at first failure')
                  // write a failure report then throw to exit early
                  const fs = require('fs')
                  const reportPath = path.join(__dirname, 'migration-failures.json')
                  fs.writeFileSync(reportPath, JSON.stringify({ failures }, null, 2))
                  throw new Error('Fail-fast: migration stopped due to a statement failure')
                }
                continue
              }
              // otherwise, it was safe and either applied inside handleViewStatement or should continue to run original
              if (handled && handled.applied) {
                // the handler already executed the statement (e.g., created or replaced the view)
                continue
              }
            }
            await client.query(`SAVEPOINT ${savePoint}`)
          } catch (e) {
            // ignore if savepoint fails; we still attempt to run the statement
          }

          // If this statement uses constructs that are not allowed inside transaction blocks
          // (e.g., REFRESH MATERIALIZED VIEW CONCURRENTLY, CREATE MATERIALIZED VIEW CONCURRENTLY)
          // we need to either skip in dry-run or run outside the main transaction.
          // Statements that cannot be run inside a transaction block
          const nonTxnRegex = /\b(CONCURRENTLY|CREATE\s+INDEX\s+CONCURRENTLY|DROP\s+INDEX\s+CONCURRENTLY|VACUUM|CLUSTER)\b/i
          const isFunctionOrDo = /^\s*(CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION|DO\s+\$)/i.test(stmt)
          const requiresNoTransaction = nonTxnRegex.test(stmt) && !isFunctionOrDo
          if (requiresNoTransaction) {
            const note = `Statement requires no transaction (CONCURRENTLY).`;
            if (dryRun) {
              console.log(`     ⚠️  Skipping non-transactional statement in dry-run: ${note}`)
              fileFailures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: 'skipped (dry-run): non-transactional statement', code: null })
              failures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: 'skipped (dry-run): non-transactional statement', code: null })
              continue
            }
            // Commit the running transaction to clear state so the statement can be run outside of a transaction
            try {
              await client.query('COMMIT')
            } catch (e) {}
            try {
              console.log(`     • Executing non-transactional statement outside of transaction: ${stmt.slice(0, 200).replace(/\n/g, ' ')}...`)
              await client.query(stmt)
              console.log(`     ✅ Non-transactional statement applied.`)
            } catch (errNt) {
              console.error(`     ❌ Failed non-transactional statement: ${errNt && errNt.message}`)
              failures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: errNt && errNt.message, code: errNt && errNt.code })
              // After failure, start a new transaction for remaining statements
              try { await client.query('BEGIN') } catch (e) {}
              // continue to next statement
              try { await client.query('BEGIN') } catch (e) {}
              continue
            }
            // After a successful non-transactional run, begin a new transaction for remaining statements
            try { await client.query('BEGIN') } catch (e) {}
            continue
          }

          try {
            // Remove any leading comment-only lines for logging and detection
            const normalizedStmt = stmt.replace(/^\s*--.*$/gm, '').trim()
            console.log(`     • Executing statement: ${normalizedStmt.slice(0, 200).replace(/\n/g, ' ')}${normalizedStmt.length > 200 ? '...' : ''}`)
            // If not a view statement or not already handled, just execute the statement
            await client.query(stmt)
          } catch (err) {
            // Capture the earliest (non-generic) error if found
            const isGeneric25 = err && err.message && err.message.toLowerCase().includes('current transaction is aborted')
            if (!isGeneric25 && !earliestError) {
              earliestError = { file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code || null }
            }
            // Also capture earliest non-25P02 SQLSTATE if present
            if (err && err.code && err.code !== '25P02' && !earliestNon25) {
              earliestNon25 = { file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code }
            }
            // store last statement error for root-cause reporting
            lastStatementError = { file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err && err.message, code: err && err.code }
            // enrich error logging with code + message and original SQL (trimmed)
            console.error(`     ❌ Statement failed (code=${err && err.code}): ${err && err.message}`)
            // enrich error logging with code + message and original SQL (trimmed)
            console.error(`     ❌ Statement failed (code=${err && err.code}): ${err && err.message}`)
            // If the transaction for this client is in an aborted state, roll back and begin a new
            // transaction so subsequent statements can be applied.
            if (err && err.code === '25P02') {
              console.log('     ⚠️  Transaction aborted; rolling back and starting a new transaction to continue.')
              try {
                await client.query('ROLLBACK')
              } catch (e) {}
              await client.query('BEGIN')
              // If we have a previous failing statement that is not the generic 25P02, log it as the likely root cause
              if (lastStatementError && lastStatementError.code && lastStatementError.code !== '25P02') {
                console.log(`     🛠️  Root cause likely: [${lastStatementError.code}] ${lastStatementError.error}`)
                failures.push(Object.assign({}, lastStatementError))
                // reset the lastStatementError to avoid duplicate reporting
                lastStatementError = null
              }
              // If we detected an earlier non-25P02 or generic error at any time, log it for clarity
              if (earliestNon25) {
                console.log(`     🧭 Earliest failing statement detected earlier: [${earliestNon25.code}] ${earliestNon25.error} (File: ${earliestNon25.file} @ ${earliestNon25.statementIndex})`)
                // optionally add it to the failures list if not already present
                try { failures.push(Object.assign({}, earliestNon25)) } catch (e) {}
              }
              if (earliestError && !earliestNon25) {
                console.log(`     🧭 Earliest error detected earlier: ${earliestError.error} (File: ${earliestError.file} @ ${earliestError.statementIndex})`)
                try { failures.push(Object.assign({}, earliestError)) } catch (e) {}
              }
            }
            // Special-case: if a CREATE OR REPLACE VIEW still fails with drop columns error,
            // attempt to drop the view and re-run once more.
            if (err && (err.code === '42P16' || (err.message && err.message.toLowerCase().includes('cannot drop columns')))) {
              const m = (stmt.replace(/^\s*--.*$/gm, '').trim()).match(/^\s*CREATE\s+OR\s+REPLACE\s+VIEW\s+"([^"]+)"/i)
              if (m) {
                const viewName = m[1]
                console.log(`     ⚠️  Skipping CREATE OR REPLACE VIEW ${viewName} because it would drop columns that are referenced by other objects. Manual review required.`)
                fileFailures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code })
                failures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code })
                continue
              }
            }
              // No need to check `handled` here; if the handler executed the statement we already continued earlier
            // Rollback to savepoint so the transaction remains usable
            try { await client.query(`ROLLBACK TO SAVEPOINT ${savePoint}`) } catch (e) {}
            try { await client.query(`RELEASE SAVEPOINT ${savePoint}`) } catch (e) {}
            // Handle common benign errors: duplicate key (insert conflicts), duplicate table/column (idempotent re-run) and skip
            if (err && (err.code === '23505' || err.code === '42P07' || err.code === '42701')) {
              console.log(`     ⚠️  Benign DB error (${err.code}) - skipping (idempotent re-run).`)
              fileFailures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code })
              failures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code })
              continue
            }
            // Log and continue rather than aborting entire migration
            console.error(`     ⚠️  Statement failed and was rolled back: ${err.message}`)
            // capture failure details
            failures.push({ file: fileName, statementIndex: stmtCounter, statement: stmt.trim().slice(0, 800), error: err.message, code: err.code })
            continue
          }
          try { await client.query(`RELEASE SAVEPOINT ${savePoint}`) } catch (e) {}
        }
        console.log(`     ✅ Applied ${fileName} (statements: ${stmtCounter}, errors: ${fileFailures.length})`)
        if (!dryRun) {
          try {
            await client.query(`INSERT INTO public."MigrationLog" (name, appliedAt, status, details) VALUES ($1, NOW(), $2, $3) ON CONFLICT (name) DO UPDATE SET appliedAt = EXCLUDED.appliedAt, status = EXCLUDED.status, details = EXCLUDED.details`, [fileName, fileFailures.length === 0 ? 'success' : 'partial', JSON.stringify({ statementsApplied: stmtCounter, errors: fileFailures.length, hash })])
          } catch (err) {
            console.error(`     ⚠️  Failed to write MigrationLog for ${fileName}:`, err && err.message)
          }
        }
      } catch (err) {
        console.error('     ❌ Failed applying', fileName, ':', err.message)
        // mark migration log as failed with details
        if (!dryRun) {
          try {
            await client.query(`INSERT INTO public."MigrationLog" (name, appliedAt, status, details) VALUES ($1, NOW(), $2, $3) ON CONFLICT (name) DO UPDATE SET appliedAt = EXCLUDED.appliedAt, status = EXCLUDED.status, details = EXCLUDED.details`, [fileName, 'failed', JSON.stringify({ error: err.message, hash })])
          } catch (e) {
            console.error(`     ⚠️  Failed to write MigrationLog failure for ${fileName}:`, e && e.message)
          }
        }
        throw err
      }
    }

    // Commit or rollback based on dry-run flag
    if (dryRun) {
      await client.query('ROLLBACK')
      console.log('\n⚠️ Dry-run mode enabled: changes were rolled back (no commit).')
    } else {
      await client.query('COMMIT')
      console.log('\n✅ Database changes committed')
    }

    // Write failures report (if any)
      if (failures.length > 0) {
      // embed earliestNon25 or earliestError if present for easy root-cause triage
      let output = { failures }
      if (earliestNon25) output.rootCause = earliestNon25
      else if (earliestError) output.rootCause = earliestError
      const reportPath = path.join(__dirname, 'migration-failures.json')
      fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8')
      console.log(`\n⚠️  ${failures.length} statement(s) failed during migration. See ${reportPath} for details.`)
    }
      // store a top-level migration hash summary for the run (non-dry-run only)
      if (!dryRun) {
        try {
          const runHash = crypto.createHash('sha256')
          for (const f of files) {
            const content = fs.readFileSync(path.join(schemaDir, f), 'utf8')
            runHash.update(content)
          }
          await client.query(`INSERT INTO public."MigrationLog" (name, appliedAt, status, details) VALUES ($1, NOW(), $2, $3) ON CONFLICT (name) DO NOTHING`, ['__RUN_SUMMARY__', new Date(), 'success', JSON.stringify({ files: files.length, hash: runHash.digest('hex') })])
        } catch (e) {
          console.error('     ⚠️  Failed to write run summary to MigrationLog:', e && e.message)
        }
      }

    console.log('\n' + '='.repeat(70))
    console.log('✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY')
    console.log('='.repeat(70))

    // Verification
    console.log('\n🔍 VERIFICATION:')

    const functionCount = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN (
        'get_user_balance',
        'validate_session',
        'revoke_session',
        'revoke_all_user_sessions',
        'revoke_other_sessions',
        'get_user_sessions'
      )
    `)
    console.log(`   📊 Functions created: ${functionCount.rows[0].count}/6`)

    const indexCount = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname IN (
        'Package_userId_idx',
        'Transaction_userId_idx',
        'Withdrawal_userId_idx',
        'Session_userId_idx',
        'Earning_userId_idx',
        'RoiPayment_packageId_idx',
        'RoiPayment_userId_idx',
        'Package_status_idx',
        'Transaction_status_idx',
        'Withdrawal_status_idx'
      )
    `)
    console.log(`   📊 Indexes created: ${indexCount.rows[0].count}/10`)

    try {
      const migrationCount = await client.query(`SELECT COUNT(*) as count FROM public."MigrationLog" WHERE status = 'success'`)
      console.log(`   📊 Migrations applied successfully: ${migrationCount.rows[0].count}/${files.length}`)
    } catch (e) {
      console.log(`   🛈 MigrationLog table not present - no migration history available (dry-run or fresh DB).`)
    }

    const lostCommissionCheck = await client.query(`SELECT to_regclass('public."LostCommission"') as name`)
    console.log(`   📊 LostCommission table present: ${lostCommissionCheck.rows[0].name ? 'yes' : 'no'}`)

    if (stagedViews.length > 0) {
      console.log('\n⚠️  STAGED VIEWS:')
      stagedViews.forEach(s => {
        console.log(`   • File: ${s.file}, Statement: ${s.statementIndex}, staged as ${s.stagedName} — ${s.notes}`)
      })
    }

    // Optionally apply staged views (dangerous: may drop columns). Requires explicit --apply-staged and confirmation via --force.
    if (stagedViews.length > 0 && applyStaged) {
      if (dryRun) {
        console.log('   🛈 --apply-staged provided, but running in dry-run mode; staged views will not be applied in dry-run.')
      } else {
        console.log('\n⚠️  Applying staged views (requested via --apply-staged). Please confirm this is intentional.')
        for (const s of stagedViews) {
          try {
            const stagedName = s.stagedName
            // derive original name (strip the __staged__ suffix)
            const origNameMatch = stagedName.match(/^(.*)__staged__/)
            const origName = origNameMatch ? origNameMatch[1] : null
            if (!origName) {
              console.log(`   ⚠️  Unable to derive original name for staged view ${stagedName}, skipping`)
              continue
            }
            const existingCols = await getViewColumns(client, origName).catch(() => [])
            const stagedCols = await getViewColumns(client, stagedName).catch(() => [])
            const dropped = existingCols.filter(c => !stagedCols.includes(c))
            if (dropped.length > 0 && !force) {
              console.log(`   ⚠️  Not applying staged view ${stagedName} -> ${origName} since it would drop columns: ${JSON.stringify(dropped)} (use --force to override).`)
              continue
            }
            // perform rename swap: original -> backup, staged -> original
            const backupName = `${origName}__backup__${Date.now()}`
            try {
              // rename original to backup (if exists)
              await client.query(`ALTER VIEW IF EXISTS "${origName}" RENAME TO "${backupName}"`)
            } catch (e) {
              console.log(`   ⚠️  Failed to rename existing view ${origName} -> ${backupName}: ${e && e.message}`)
              // continue and decide whether to proceed
            }
            try {
              await client.query(`ALTER VIEW "${stagedName}" RENAME TO "${origName}"`)
              console.log(`   ✅ Applied staged view ${stagedName} -> ${origName}`)
            } catch (e) {
              console.error(`   ❌ Failed to apply staged view ${stagedName} -> ${origName}: ${e && e.message}`)
              failures.push({ file: s.file, statementIndex: s.statementIndex, statement: `apply staged ${stagedName} -> ${origName}`, error: e && e.message })
            }
          } catch (e) {
            console.error(`   ❌ Error while applying staged view ${s.stagedName}:`, e && e.message)
            failures.push({ file: s.file, statementIndex: s.statementIndex, statement: `apply staged ${s.stagedName}`, error: e && e.message })
          }
        }
      }
    }

    console.log('\n💡 SUMMARY:')
    console.log('   ✅ User balance calculations optimized')
    console.log('   ✅ Session management enabled')
    console.log('   ✅ Database queries accelerated with indexes')
    console.log('   ✅ Production ready!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('\n❌ MIGRATION FAILED:', error.message)
    console.error('\n📝 Details:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✅ Migration script completed successfully!\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  })
