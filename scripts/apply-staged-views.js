#!/usr/bin/env node
const { Pool } = require('pg')
require('dotenv').config()
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false })

async function listStagedViews(client) {
  const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%__staged__%';`)
  return res.rows.map(r => r.table_name)
}

async function getViewColumns(client, name) {
  const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`, [name])
  return res.rows.map(r => r.column_name)
}

async function run() {
  const client = await pool.connect()
  try {
    const preview = process.argv.includes('--preview') || process.argv.includes('-p')
    const apply = process.argv.includes('--apply') || process.argv.includes('-a')
    const force = process.argv.includes('--force') || process.argv.includes('-f')

    console.log('🔍 Scanning for staged views...')
    const staged = await listStagedViews(client)
    if (staged.length === 0) {
      console.log('✅ No staged views found.')
      return
    }
    console.log(`Found ${staged.length} staged views.`)

    for (const s of staged) {
      // derive original view name
      const m = s.match(/^(.*)__staged__(\d+)$/)
      const orig = m ? m[1] : null
      if (!orig) {
        console.warn(`⚠️  Could not derive origin from staged view name: ${s}`)
        continue
      }
      const stagedCols = await getViewColumns(client, s).catch(() => [])
      const origCols = await getViewColumns(client, orig).catch(() => [])
      const dropped = origCols.filter(c => !stagedCols.includes(c))
      console.log(`
• Staged view: ${s}
  -> Original view: ${orig}
  -> Staged cols: ${JSON.stringify(stagedCols)}
  -> Original cols: ${JSON.stringify(origCols)}
  -> Dropped columns: ${JSON.stringify(dropped)}
`) 
      if (dropped.length > 0 && !force) {
        console.log(`   ⚠️  Applying this staged view will drop columns. Use --force to proceed or inspect manually.`)
        continue
      }

      if (preview) {
        console.log('   🛈 Preview mode; no changes made.')
        continue
      }
      if (!apply) {
        console.log('   🛈 No --apply flag provided; to apply staged view use --apply')
        continue
      }

      const backupName = `${orig}__backup__${Date.now()}`
      try {
        console.log(`   🔁 Renaming original ${orig} -> ${backupName} (if exists)`)
        await client.query(`ALTER VIEW IF EXISTS "${orig}" RENAME TO "${backupName}"`)
      } catch (e) {
        console.warn(`   ⚠️  Failed to backup original view ${orig}: ${e && e.message}`)
      }
      try {
        console.log(`   🔁 Renaming staged ${s} -> ${orig}`)
        await client.query(`ALTER VIEW "${s}" RENAME TO "${orig}"`)
        console.log(`   ✅ Applied staged view ${s} -> ${orig}`)
      } catch (e) {
        console.error(`   ❌ Failed to apply staged view ${s} -> ${orig}: ${e && e.message}`)
        // attempt to restore backup
        try { await client.query(`ALTER VIEW IF EXISTS "${backupName}" RENAME TO "${orig}"`) } catch (ex) {}
      }
    }
  } catch (err) {
    console.error('❌ Error scanning/applying staged views:', err && err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

run().then(() => console.log('Done')).catch(() => process.exit(1))
