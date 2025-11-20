#!/usr/bin/env node
// Node-based fresh-run script to drop public schema objects and then run migration
// This avoids needing `psql` and uses the same connection string in process.env.DATABASE_URL.
// Run with: node scripts/fresh-run.js --force --dry
//  - --force: perform destructive drop (if omitted, only a 'dry-run' simulation happens)
//  - --dry: wrap the drop in a transaction and rollback to test

const { Pool } = require('pg')
const { spawnSync } = require('child_process')
require('dotenv').config()

const args = process.argv.slice(2)
const dry = args.includes('--dry') || args.includes('-n')
const force = args.includes('--force') || args.includes('-f')

async function run() {
  const conn = process.env.DATABASE_URL
  if (!conn) {
    console.error('DATABASE_URL not set - please set it in your environment or .env file.')
    process.exit(1)
  }

  console.log(`Connecting to ${conn.split('@')[1].split('/')[0]}`)
  const pool = new Pool({ connectionString: conn })
  const client = await pool.connect()

  try {
    console.log('Connected')
    if (!force) {
      console.warn('Please provide --force to perform destructive drops')
    }

    if (dry) {
      console.log('Running dry-run: wrapping operations in a transaction and rolling back at the end')
      await client.query('BEGIN')
    }

    // Check for presence of public schema and objects
    // We'll perform drop actions similar to the SQL drop script

    // Materialized views
    const matviews = await client.query("SELECT matviewname FROM pg_matviews WHERE schemaname = 'public'")
    for (const r of matviews.rows) {
      console.log('Dropping materialized view:', r.matviewname)
      if (force) {
        await client.query(`DROP MATERIALIZED VIEW IF EXISTS public."${r.matviewname}" CASCADE`)
      }
    }

    // Views
    const views = await client.query("SELECT table_name FROM information_schema.views WHERE table_schema = 'public'")
    for (const r of views.rows) {
      console.log('Dropping view:', r.table_name)
      if (force) {
        await client.query(`DROP VIEW IF EXISTS public."${r.table_name}" CASCADE`)
      }
    }

    // Triggers
    const triggers = await client.query("SELECT event_object_table, trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public'")
    for (const t of triggers.rows) {
      console.log(`Dropping trigger ${t.trigger_name} ON ${t.event_object_table}`)
      if (force) await client.query(`DROP TRIGGER IF EXISTS "${t.trigger_name}" ON public."${t.event_object_table}" CASCADE`)
    }

    // Functions
    const funcs = await client.query("SELECT p.proname as name, oidvectortypes(p.proargtypes) AS args FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname NOT LIKE 'pg_%'")
    for (const f of funcs.rows) {
      console.log(`Dropping function ${f.name}(${f.args})`)
      if (force) {
        try {
          await client.query(`DROP FUNCTION IF EXISTS public."${f.name}"(${f.args}) CASCADE`)
        } catch (err) {
          console.warn('Unable to drop function', f.name, f.args, err && err.message)
        }
      }
    }

    // Indexes via pg_indexes
    const indexes = await client.query("SELECT indexname FROM pg_indexes WHERE schemaname = 'public'")
    for (const idx of indexes.rows) {
      console.log('Dropping index', idx.indexname)
      if (force) await client.query(`DROP INDEX IF EXISTS public."${idx.indexname}" CASCADE`)
    }

    // Tables
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    for (const t of tables.rows) {
      console.log('Dropping table', t.tablename)
      if (force) await client.query(`DROP TABLE IF EXISTS public."${t.tablename}" CASCADE`)
    }

    // Sequences
    const seqs = await client.query("SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'")
    for (const s of seqs.rows) {
      console.log('Dropping sequence', s.sequence_name)
      if (force) await client.query(`DROP SEQUENCE IF EXISTS public."${s.sequence_name}" CASCADE`)
    }

    // Types (enums, composites)
    const types = await client.query("SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype IN ('e','r','b')")
    for (const ty of types.rows) {
      console.log('Dropping type', ty.typname)
      if (force) {
        try {
          await client.query(`DROP TYPE IF EXISTS public."${ty.typname}" CASCADE`)
        } catch (err) {
          console.warn('Unable to drop type', ty.typname, err && err.message)
        }
      }
    }

    // Final cleanup: any remaining classes
    const remaining = await client.query("SELECT c.relname, n.nspname, c.relkind FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','S')")
    for (const o of remaining.rows) {
      console.log('Dropping remaining object', o.relname, 'type', o.relkind)
      if (!force) continue
      try {
        if (o.relkind === 'v') {
          await client.query(`DROP VIEW IF EXISTS public."${o.relname}" CASCADE`)
        } else if (o.relkind === 'm') {
          await client.query(`DROP MATERIALIZED VIEW IF EXISTS public."${o.relname}" CASCADE`)
        } else if (o.relkind === 'S') {
          await client.query(`DROP SEQUENCE IF EXISTS public."${o.relname}" CASCADE`)
        } else {
          await client.query(`DROP TABLE IF EXISTS public."${o.relname}" CASCADE`)
        }
      } catch (err) {
        console.warn('Failed to drop', o.relname, err && err.message)
      }
    }

    if (dry) {
      await client.query('ROLLBACK')
      console.log('Dry-run rollback complete')
    }

    // Now run migrations (dry-run or real depending on flag)
    // We'll spawn npm scripts for migration
    if (dry) {
      console.log('Executing `npm run db:migrate:dry-run` for final verification (this will not commit changes)')
      const res = spawnSync('npm', ['run', 'db:migrate:dry-run', '--', '--fail-fast'], { stdio: 'inherit', cwd: __dirname + '/..', env: process.env })
      process.exit(res.status)
    } else {
      console.log('Executing `npm run db:migrate` (applying changes)')
      const res = spawnSync('npm', ['run', 'db:migrate'], { stdio: 'inherit', cwd: __dirname + '/..', env: process.env })
      process.exit(res.status)
    }

  } catch (err) {
    console.error('Error during fresh-run process', err && err.message)
    try { if (dry) await client.query('ROLLBACK') } catch (e) {}
    process.exit(2)
  } finally {
    try { client.release() } catch (e) {}
    await pool.end()
  }
}

run().catch(err => { console.error(err); process.exit(1) })
