#!/usr/bin/env node
/*
  Simple SQL runner for files containing SQL and psql meta-commands like \echo
  Usage: node scripts/run-sql-file.js ../verify-schema.sql
*/

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })

async function main() {
  const args = process.argv.slice(2)
  if (!args[0]) {
    console.error('Usage: node scripts/run-sql-file.js <sql-file>')
    process.exit(1)
  }

  const filePath = path.resolve(process.cwd(), args[0])
  if (!fs.existsSync(filePath)) {
    console.error('SQL file not found:', filePath)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  // Build statements, handling dollar-quoted blocks robustly by scanning the raw text.
  function splitSqlStatements(text) {
    const stmts = []
    let i = 0
    const len = text.length

    while (i < len) {
      // Skip leading whitespace
      while (i < len && /\s/.test(text[i])) i++
      if (i >= len) break

      // If next token starts with a backslash (psql meta-command), read the line
      if (text[i] === '\\') {
        const nl = text.indexOf('\n', i)
        const line = nl === -1 ? text.slice(i) : text.slice(i, nl)
        if (line.startsWith('\\echo')) {
          stmts.push({ type: 'echo', sql: line.replace(/\\echo\s*/i, '') })
        } else {
          stmts.push({ type: 'meta', sql: line.trim() })
        }
        i = nl === -1 ? len : nl + 1
        continue
      }

      // If we encounter a dollar-quoted block, capture it including the trailing semicolon
      const dollarOpen = text.slice(i).match(/\$[A-Za-z0-9_]*\$/)
      if (dollarOpen && text.slice(i, i + 50).toUpperCase().startsWith('DO ')) {
        // Found a DO $$ style block starting near here - find the opening tag by searching from i
        const openTagMatch = text.slice(i).match(/\$[A-Za-z0-9_]*\$/)
        if (openTagMatch) {
          const tag = openTagMatch[0]
          // Find the index of this tag occurrence
          const openIdx = text.indexOf(tag, i)
          // Find the closing tag after openIdx
          const closeIdx = text.indexOf(tag, openIdx + tag.length)
          if (closeIdx === -1) {
            // Unterminated dollar block; push the rest and break
            stmts.push({ type: 'sql', sql: text.slice(i).trim() })
            break
          }
          // Include up to the semicolon after the closing tag if present
          let endIdx = closeIdx + tag.length
          // consume until next semicolon after closing tag
          const semi = text.indexOf(';', endIdx)
          if (semi !== -1) endIdx = semi + 1
          const block = text.slice(i, endIdx).trim()
          stmts.push({ type: 'sql', sql: block })
          i = endIdx
          continue
        }
      }

      // Otherwise, capture up to the next semicolon as a statement
      const nextSemi = text.indexOf(';', i)
      if (nextSemi === -1) {
        const rest = text.slice(i).trim()
        if (rest) stmts.push({ type: 'sql', sql: rest })
        break
      }
      const part = text.slice(i, nextSemi + 1).trim()
      if (part) stmts.push({ type: 'sql', sql: part })
      i = nextSemi + 1
    }
    return stmts
  }

  const statements = splitSqlStatements(raw)

  // Create PG client from DATABASE_URL or environment
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Missing DATABASE_URL in .env.local')
    process.exit(1)
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('Connected to database')

    // If the file contains dollar-quoted blocks (DO $$ ... $$) or many semicolons,
    // prefer sending the whole file to the server in one request so Postgres can
    // parse dollar-quoted literals correctly. Fall back to statement-by-statement
    // execution if the single-shot approach fails.
    if (/\$[A-Za-z0-9_]*\$/.test(raw) || raw.split(';').length > 50) {
      try {
        console.log('\n>>> Executing full file as a single query (to preserve DO $$ blocks and multi-statement semantics)')
        const res = await client.query(raw)
        console.log('Done executing file. Command tag:', res.command, 'rowCount =', res.rowCount)
        console.log('\nAll statements processed.')
        await client.end()
        return
      } catch (fullErr) {
        console.warn('Full-file execution failed, falling back to statement-by-statement mode:', fullErr.message)
        // Attempt to clear any open transaction caused by the failed full-file run
        try {
          await client.query('ROLLBACK')
          console.log('Rolled back failed transaction, continuing with per-statement mode')
        } catch (rbErr) {
          console.warn('Rollback failed or no transaction to rollback:', rbErr.message)
        }
        // continue to per-statement execution
      }
    }

    for (const item of statements) {
      if (item.type === 'echo') {
        console.log(item.sql)
        continue
      }
      if (item.type === 'meta') {
        // print meta commands for traceability but skip execution
        console.log('[meta]', item.sql)
        continue
      }
      // Execute SQL
      const sql = item.sql
      try {
        // For SELECT queries, show results; otherwise show rowCount
        const isSelect = /^\s*SELECT/i.test(sql)
        console.log('\n>>> Executing SQL:', sql.replace(/\n/g, ' ').slice(0, 400), sql.length > 400 ? '...[truncated]' : '')
        const res = await client.query(sql)
        if (isSelect) {
          console.log('Rows:', res.rows.length)
          if (res.rows.length > 0) {
            // print first 5 rows
            console.table(res.rows.slice(0, 5))
          }
        } else {
          console.log('Done. rowCount =', res.rowCount)
        }
      } catch (err) {
        console.error('\nSQL Error executing statement:')
        console.error('Message:', err.message)
        if (err.code) console.error('Code:', err.code)
        // show the statement that failed
        console.error('Failed SQL (first 400 chars):', sql.replace(/\n/g, ' ').slice(0, 400))
        // do not exit immediately; continue to collect more info
      }
    }

    console.log('\nAll statements processed.')
  } catch (err) {
    console.error('Connection error:', err.message)
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
